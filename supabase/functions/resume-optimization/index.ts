import { createClient } from 'npm:@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

interface OptimizationFeedback {
  category: 'Content' | 'Formatting' | 'Keywords' | 'Achievements';
  priority: 'High' | 'Medium' | 'Low';
  issue: string;
  suggestion: string;
  examples?: string[];
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { resume_text, target_job_title } = await req.json()

    if (!resume_text || !target_job_title) {
      return new Response(JSON.stringify({ error: 'resume_text and target_job_title are required' }), {
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

    // Get relevant skills for the target job title
    const { data: relevantCareers, error: careersError } = await supabaseClient
      .from('careers')
      .select(`
        id,
        name,
        career_skills (
          is_essential,
          skills (name, category)
        )
      `)
      .ilike('name', `%${target_job_title}%`)

    if (careersError) {
      throw careersError
    }

    // Extract relevant keywords from matching careers
    const relevantSkills = new Set<string>()
    const essentialSkills = new Set<string>()

    relevantCareers.forEach(career => {
      career.career_skills.forEach(cs => {
        relevantSkills.add(cs.skills.name.toLowerCase())
        if (cs.is_essential) {
          essentialSkills.add(cs.skills.name.toLowerCase())
        }
      })
    })

    // Analyze resume content
    const resumeLower = resume_text.toLowerCase()
    const feedback: OptimizationFeedback[] = []

    // Check for essential keywords
    const missingEssentialSkills = Array.from(essentialSkills).filter(skill => 
      !resumeLower.includes(skill)
    )

    if (missingEssentialSkills.length > 0) {
      feedback.push({
        category: 'Keywords',
        priority: 'High',
        issue: 'Missing essential keywords for the target role',
        suggestion: `Consider adding these essential skills to your resume: ${missingEssentialSkills.slice(0, 5).join(', ')}`,
        examples: missingEssentialSkills.slice(0, 3)
      })
    }

    // Check for quantifiable achievements
    const hasNumbers = /\d+/.test(resume_text)
    const hasPercentages = /%/.test(resume_text)
    const hasMetrics = /\$|revenue|sales|users|customers|growth|increase|decrease|improve/i.test(resume_text)

    if (!hasNumbers || !hasMetrics) {
      feedback.push({
        category: 'Achievements',
        priority: 'High',
        issue: 'Lack of quantifiable achievements',
        suggestion: 'Add specific numbers, percentages, and metrics to demonstrate your impact',
        examples: [
          'Increased team productivity by 25%',
          'Managed a budget of $500K',
          'Led a team of 8 developers'
        ]
      })
    }

    // Check resume length
    const wordCount = resume_text.split(/\s+/).length
    if (wordCount < 200) {
      feedback.push({
        category: 'Content',
        priority: 'Medium',
        issue: 'Resume appears too brief',
        suggestion: 'Consider expanding on your experiences and achievements. Aim for 300-600 words.',
      })
    } else if (wordCount > 800) {
      feedback.push({
        category: 'Content',
        priority: 'Medium',
        issue: 'Resume may be too lengthy',
        suggestion: 'Consider condensing your content. Focus on the most relevant and impactful experiences.',
      })
    }

    // Check for action verbs
    const actionVerbs = ['achieved', 'built', 'created', 'developed', 'implemented', 'improved', 'led', 'managed', 'optimized', 'reduced']
    const hasActionVerbs = actionVerbs.some(verb => resumeLower.includes(verb))

    if (!hasActionVerbs) {
      feedback.push({
        category: 'Content',
        priority: 'Medium',
        issue: 'Limited use of strong action verbs',
        suggestion: 'Start bullet points with powerful action verbs to make your achievements more impactful',
        examples: ['Developed', 'Implemented', 'Led', 'Optimized', 'Achieved']
      })
    }

    // Check for formatting issues (basic text analysis)
    const hasConsistentFormatting = checkFormattingConsistency(resume_text)
    if (!hasConsistentFormatting) {
      feedback.push({
        category: 'Formatting',
        priority: 'Low',
        issue: 'Inconsistent formatting detected',
        suggestion: 'Ensure consistent formatting for dates, bullet points, and section headers',
      })
    }

    // Generate overall score
    const totalIssues = feedback.length
    const highPriorityIssues = feedback.filter(f => f.priority === 'High').length
    const score = Math.max(0, 100 - (highPriorityIssues * 20) - ((totalIssues - highPriorityIssues) * 10))

    // Get skill coverage percentage
    const skillCoverage = Math.round(
      ((Array.from(relevantSkills).filter(skill => resumeLower.includes(skill)).length) / 
       Math.max(relevantSkills.size, 1)) * 100
    )

    return new Response(JSON.stringify({
      overall_score: score,
      skill_coverage_percentage: skillCoverage,
      feedback: feedback.sort((a, b) => {
        const priorityOrder = { 'High': 0, 'Medium': 1, 'Low': 2 }
        return priorityOrder[a.priority] - priorityOrder[b.priority]
      }),
      missing_keywords: missingEssentialSkills.slice(0, 10),
      relevant_skills_found: Array.from(relevantSkills).filter(skill => resumeLower.includes(skill)),
      analysis_summary: {
        word_count: wordCount,
        has_quantifiable_achievements: hasNumbers && hasMetrics,
        uses_action_verbs: hasActionVerbs,
        formatting_consistent: hasConsistentFormatting
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('Error optimizing resume:', error)
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})

function checkFormattingConsistency(text: string): boolean {
  // Basic checks for formatting consistency
  const lines = text.split('\n')
  
  // Check for consistent bullet point usage
  const bulletLines = lines.filter(line => line.trim().match(/^[•\-\*]/))
  const hasBullets = bulletLines.length > 0
  
  // Check for consistent date formatting
  const datePatterns = [
    /\d{4}\s*-\s*\d{4}/g,  // 2020 - 2023
    /\d{1,2}\/\d{4}/g,     // 01/2020
    /\w+\s+\d{4}/g         // January 2020
  ]
  
  const dateMatches = datePatterns.map(pattern => 
    (text.match(pattern) || []).length
  )
  
  const hasConsistentDates = dateMatches.some(count => count >= 2)
  
  return hasBullets && hasConsistentDates
}