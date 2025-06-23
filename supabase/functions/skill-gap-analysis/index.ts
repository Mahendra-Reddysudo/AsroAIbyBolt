import { createClient } from 'npm:@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

interface SkillGap {
  skill_id: string;
  skill_name: string;
  skill_category: string;
  is_essential: boolean;
  required_proficiency: string;
  current_proficiency: string | null;
  gap_severity: 'Critical' | 'Important' | 'Nice to Have';
  learning_resources: Array<{
    id: string;
    title: string;
    description: string;
    type: string;
    url: string;
    provider: string;
    duration_hours: number;
    difficulty_level: string;
    rating: number;
    price_usd: number;
  }>;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { target_career_id } = await req.json()

    if (!target_career_id) {
      return new Response(JSON.stringify({ error: 'target_career_id is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Get user from JWT token
    const authHeader = req.headers.get('Authorization')!
    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token)

    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Get career details and required skills
    const { data: careerData, error: careerError } = await supabaseClient
      .from('careers')
      .select(`
        id,
        name,
        description,
        career_skills (
          is_essential,
          proficiency_level,
          skills (
            id,
            name,
            category,
            description
          )
        )
      `)
      .eq('id', target_career_id)
      .single()

    if (careerError || !careerData) {
      return new Response(JSON.stringify({ error: 'Career not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Get user's current skills
    const { data: userSkills, error: userSkillsError } = await supabaseClient
      .from('user_skills')
      .select(`
        skill_id,
        proficiency_level,
        years_experience,
        skills (id, name)
      `)
      .eq('user_id', user.id)

    if (userSkillsError) {
      throw userSkillsError
    }

    const userSkillMap = new Map(
      userSkills.map(us => [us.skill_id, us])
    )

    // Identify skill gaps
    const skillGaps: SkillGap[] = []

    for (const careerSkill of careerData.career_skills) {
      const skill = careerSkill.skills
      const userSkill = userSkillMap.get(skill.id)
      const requiredLevel = careerSkill.proficiency_level
      const currentLevel = userSkill?.proficiency_level || null

      // Determine if there's a gap
      const hasGap = !userSkill || isProficiencyGap(currentLevel, requiredLevel)

      if (hasGap) {
        // Get learning resources for this skill
        const { data: resources, error: resourcesError } = await supabaseClient
          .from('learning_resources')
          .select('*')
          .eq('skill_id', skill.id)
          .order('rating', { ascending: false })
          .limit(5)

        if (resourcesError) {
          console.error('Error fetching resources:', resourcesError)
        }

        const gapSeverity = careerSkill.is_essential 
          ? 'Critical' 
          : (requiredLevel === 'Advanced' ? 'Important' : 'Nice to Have')

        skillGaps.push({
          skill_id: skill.id,
          skill_name: skill.name,
          skill_category: skill.category,
          is_essential: careerSkill.is_essential,
          required_proficiency: requiredLevel,
          current_proficiency: currentLevel,
          gap_severity: gapSeverity as 'Critical' | 'Important' | 'Nice to Have',
          learning_resources: resources || []
        })
      }
    }

    // Sort gaps by severity (Critical first, then Important, then Nice to Have)
    skillGaps.sort((a, b) => {
      const severityOrder = { 'Critical': 0, 'Important': 1, 'Nice to Have': 2 }
      return severityOrder[a.gap_severity] - severityOrder[b.gap_severity]
    })

    // Cache the analysis
    await supabaseClient
      .from('skill_gaps_analysis')
      .upsert({
        user_id: user.id,
        career_id: target_career_id,
        skill_gaps: skillGaps,
        recommended_resources: skillGaps.map(sg => ({
          skill_id: sg.skill_id,
          resources: sg.learning_resources.slice(0, 3) // Top 3 resources per skill
        })),
        is_current: true
      }, {
        onConflict: 'user_id,career_id'
      })

    // Generate summary statistics
    const summary = {
      total_skills_required: careerData.career_skills.length,
      skills_you_have: careerData.career_skills.length - skillGaps.length,
      critical_gaps: skillGaps.filter(sg => sg.gap_severity === 'Critical').length,
      important_gaps: skillGaps.filter(sg => sg.gap_severity === 'Important').length,
      nice_to_have_gaps: skillGaps.filter(sg => sg.gap_severity === 'Nice to Have').length,
      estimated_learning_time: skillGaps.reduce((total, sg) => {
        const avgHours = sg.learning_resources.reduce((sum, lr) => sum + (lr.duration_hours || 0), 0) / Math.max(sg.learning_resources.length, 1)
        return total + avgHours
      }, 0)
    }

    return new Response(JSON.stringify({
      career: {
        id: careerData.id,
        name: careerData.name,
        description: careerData.description
      },
      skill_gaps: skillGaps,
      summary
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('Error analyzing skill gaps:', error)
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})

function isProficiencyGap(current: string | null, required: string): boolean {
  const levels = { 'Beginner': 1, 'Intermediate': 2, 'Advanced': 3 }
  const currentLevel = current ? levels[current as keyof typeof levels] || 0 : 0
  const requiredLevel = levels[required as keyof typeof levels] || 1
  return currentLevel < requiredLevel
}