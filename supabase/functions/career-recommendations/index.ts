import { createClient } from 'npm:@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

interface UserProfile {
  skills: Array<{ skill_id: string; skill_name: string; proficiency_level: string; years_experience: number }>;
  interests: string[];
  experience_level: string;
}

interface CareerMatch {
  career_id: string;
  career_name: string;
  description: string;
  match_score: number;
  explanation: string;
  required_skills: Array<{ skill_name: string; is_essential: boolean; user_has: boolean }>;
  salary_range: { min: number; max: number };
  growth_outlook: string;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
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

    // Get user's skills and profile data
    const { data: userSkills, error: skillsError } = await supabaseClient
      .from('user_skills')
      .select(`
        skill_id,
        proficiency_level,
        years_experience,
        skills (name)
      `)
      .eq('user_id', user.id)

    if (skillsError) {
      throw skillsError
    }

    // Get all careers with their required skills
    const { data: careers, error: careersError } = await supabaseClient
      .from('careers')
      .select(`
        id,
        name,
        description,
        average_salary_min,
        average_salary_max,
        growth_outlook,
        career_skills (
          is_essential,
          proficiency_level,
          skills (id, name)
        )
      `)

    if (careersError) {
      throw careersError
    }

    // Calculate career matches
    const careerMatches: CareerMatch[] = careers.map(career => {
      const requiredSkills = career.career_skills || []
      const userSkillIds = new Set(userSkills.map(us => us.skill_id))
      
      let matchScore = 0
      let totalWeight = 0
      const skillAnalysis = []

      // Calculate match score based on skills
      for (const reqSkill of requiredSkills) {
        const weight = reqSkill.is_essential ? 3 : 1
        const userHasSkill = userSkillIds.has(reqSkill.skills.id)
        
        if (userHasSkill) {
          const userSkill = userSkills.find(us => us.skill_id === reqSkill.skills.id)
          const proficiencyBonus = getProficiencyScore(userSkill?.proficiency_level || 'Beginner')
          matchScore += weight * proficiencyBonus
        }
        
        totalWeight += weight
        skillAnalysis.push({
          skill_name: reqSkill.skills.name,
          is_essential: reqSkill.is_essential,
          user_has: userHasSkill
        })
      }

      const finalScore = totalWeight > 0 ? (matchScore / totalWeight) * 100 : 0

      // Generate explanation
      const essentialSkillsCount = requiredSkills.filter(rs => rs.is_essential).length
      const userEssentialSkills = skillAnalysis.filter(sa => sa.is_essential && sa.user_has).length
      const explanation = generateExplanation(finalScore, userEssentialSkills, essentialSkillsCount, career.name)

      return {
        career_id: career.id,
        career_name: career.name,
        description: career.description,
        match_score: Math.round(finalScore * 100) / 100,
        explanation,
        required_skills: skillAnalysis,
        salary_range: {
          min: career.average_salary_min || 0,
          max: career.average_salary_max || 0
        },
        growth_outlook: career.growth_outlook
      }
    })

    // Sort by match score and take top 10
    const topMatches = careerMatches
      .sort((a, b) => b.match_score - a.match_score)
      .slice(0, 10)

    // Cache recommendations in database
    for (const match of topMatches) {
      await supabaseClient
        .from('career_recommendations')
        .upsert({
          user_id: user.id,
          career_id: match.career_id,
          match_score: match.match_score,
          explanation: match.explanation,
          recommendation_factors: {
            required_skills: match.required_skills,
            salary_range: match.salary_range,
            growth_outlook: match.growth_outlook
          },
          is_current: true
        }, {
          onConflict: 'user_id,career_id'
        })
    }

    return new Response(JSON.stringify({ recommendations: topMatches }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('Error generating recommendations:', error)
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})

function getProficiencyScore(level: string): number {
  switch (level) {
    case 'Advanced': return 1.0
    case 'Intermediate': return 0.7
    case 'Beginner': return 0.4
    default: return 0.2
  }
}

function generateExplanation(score: number, userEssentialSkills: number, totalEssentialSkills: number, careerName: string): string {
  if (score >= 80) {
    return `Excellent match! You have ${userEssentialSkills}/${totalEssentialSkills} essential skills for ${careerName}. Your experience aligns well with this career path.`
  } else if (score >= 60) {
    return `Good match! You have ${userEssentialSkills}/${totalEssentialSkills} essential skills for ${careerName}. With some additional learning, this could be a great fit.`
  } else if (score >= 40) {
    return `Moderate match. You have ${userEssentialSkills}/${totalEssentialSkills} essential skills for ${careerName}. Consider developing more relevant skills to strengthen your candidacy.`
  } else {
    return `This role requires significant skill development. You currently have ${userEssentialSkills}/${totalEssentialSkills} essential skills for ${careerName}, but it could be a good long-term goal.`
  }
}