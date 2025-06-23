import { createClient } from 'npm:@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const url = new URL(req.url)
    const industry = url.searchParams.get('industry')
    const skill = url.searchParams.get('skill')
    const limit = parseInt(url.searchParams.get('limit') || '10')

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Get user from JWT token (optional for trends)
    let user = null
    const authHeader = req.headers.get('Authorization')
    if (authHeader) {
      const token = authHeader.replace('Bearer ', '')
      const { data: { user: authUser } } = await supabaseClient.auth.getUser(token)
      user = authUser
    }

    // Build query for industry insights
    let query = supabaseClient
      .from('industry_insights')
      .select('*')
      .eq('is_active', true)
      .order('generated_date', { ascending: false })
      .limit(limit)

    // Apply filters if provided
    if (industry) {
      query = query.contains('relevant_careers', [industry])
    }

    if (skill) {
      query = query.contains('relevant_skills', [skill])
    }

    const { data: insights, error: insightsError } = await query

    if (insightsError) {
      throw insightsError
    }

    // Get trending skills based on recent job descriptions
    const { data: trendingSkills, error: skillsError } = await supabaseClient
      .rpc('get_trending_skills', { days_back: 30, limit_count: 10 })

    // If RPC doesn't exist, create a fallback query
    let skillTrends = []
    if (skillsError) {
      // Fallback: Get skills mentioned in recent insights
      const allSkills = insights.flatMap(insight => 
        insight.relevant_skills || []
      )
      const skillCounts = allSkills.reduce((acc, skill) => {
        acc[skill] = (acc[skill] || 0) + 1
        return acc
      }, {} as Record<string, number>)
      
      skillTrends = Object.entries(skillCounts)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 10)
        .map(([skill, count]) => ({ skill, mentions: count }))
    } else {
      skillTrends = trendingSkills || []
    }

    // Get user's subscriptions if authenticated
    let userSubscriptions = []
    if (user) {
      const { data: subscriptions } = await supabaseClient
        .from('user_subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true)

      userSubscriptions = subscriptions || []
    }

    // Categorize insights
    const categorizedInsights = {
      emerging_roles: insights.filter(i => i.insight_type === 'Emerging Role'),
      skill_demand: insights.filter(i => i.insight_type === 'Skill Demand'),
      industry_shifts: insights.filter(i => i.insight_type === 'Industry Shift'),
      market_trends: insights.filter(i => i.insight_type === 'Market Trend')
    }

    // Generate personalized recommendations if user is authenticated
    let personalizedInsights = []
    if (user) {
      // Get user's skills to provide relevant insights
      const { data: userSkills } = await supabaseClient
        .from('user_skills')
        .select('skills(name)')
        .eq('user_id', user.id)

      const userSkillNames = userSkills?.map(us => us.skills.name) || []
      
      personalizedInsights = insights.filter(insight => {
        const relevantSkills = insight.relevant_skills || []
        return relevantSkills.some(skill => userSkillNames.includes(skill))
      }).slice(0, 5)
    }

    return new Response(JSON.stringify({
      insights: categorizedInsights,
      trending_skills: skillTrends,
      personalized_insights: personalizedInsights,
      user_subscriptions: userSubscriptions,
      total_insights: insights.length,
      last_updated: insights[0]?.generated_date || null
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('Error fetching industry trends:', error)
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})