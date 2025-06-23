const API_BASE_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1`;

const getAuthHeaders = () => {
  const token = localStorage.getItem('supabase.auth.token');
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  };
};

export interface CareerRecommendation {
  career_id: string;
  career_name: string;
  description: string;
  match_score: number;
  explanation: string;
  required_skills: Array<{
    skill_name: string;
    is_essential: boolean;
    user_has: boolean;
  }>;
  salary_range: { min: number; max: number };
  growth_outlook: string;
}

export interface SkillGap {
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

export interface ResumeOptimization {
  overall_score: number;
  skill_coverage_percentage: number;
  feedback: Array<{
    category: 'Content' | 'Formatting' | 'Keywords' | 'Achievements';
    priority: 'High' | 'Medium' | 'Low';
    issue: string;
    suggestion: string;
    examples?: string[];
  }>;
  missing_keywords: string[];
  relevant_skills_found: string[];
  analysis_summary: {
    word_count: number;
    has_quantifiable_achievements: boolean;
    uses_action_verbs: boolean;
    formatting_consistent: boolean;
  };
}

export interface IndustryTrends {
  insights: {
    emerging_roles: any[];
    skill_demand: any[];
    industry_shifts: any[];
    market_trends: any[];
  };
  trending_skills: Array<{ skill: string; mentions: number }>;
  personalized_insights: any[];
  user_subscriptions: any[];
  total_insights: number;
  last_updated: string | null;
}

export const apiService = {
  // Career Recommendations
  async getCareerRecommendations(): Promise<{ recommendations: CareerRecommendation[] }> {
    const response = await fetch(`${API_BASE_URL}/career-recommendations`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch career recommendations');
    }

    return response.json();
  },

  // Skill Gap Analysis
  async analyzeSkillGaps(targetCareerId: string): Promise<{
    career: { id: string; name: string; description: string };
    skill_gaps: SkillGap[];
    summary: {
      total_skills_required: number;
      skills_you_have: number;
      critical_gaps: number;
      important_gaps: number;
      nice_to_have_gaps: number;
      estimated_learning_time: number;
    };
  }> {
    const response = await fetch(`${API_BASE_URL}/skill-gap-analysis`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ target_career_id: targetCareerId }),
    });

    if (!response.ok) {
      throw new Error('Failed to analyze skill gaps');
    }

    return response.json();
  },

  // Resume Optimization
  async optimizeResume(resumeText: string, targetJobTitle: string): Promise<ResumeOptimization> {
    const response = await fetch(`${API_BASE_URL}/resume-optimization`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({
        resume_text: resumeText,
        target_job_title: targetJobTitle,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to optimize resume');
    }

    return response.json();
  },

  // Industry Trends
  async getIndustryTrends(filters?: {
    industry?: string;
    skill?: string;
    limit?: number;
  }): Promise<IndustryTrends> {
    const params = new URLSearchParams();
    if (filters?.industry) params.append('industry', filters.industry);
    if (filters?.skill) params.append('skill', filters.skill);
    if (filters?.limit) params.append('limit', filters.limit.toString());

    const response = await fetch(`${API_BASE_URL}/industry-trends?${params}`, {
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch industry trends');
    }

    return response.json();
  },

  // User Feedback
  async submitCareerFeedback(careerId: string, feedbackType: 'like' | 'dismiss' | 'interested' | 'not_relevant'): Promise<void> {
    // This would be implemented as a direct Supabase call in the component
    // since it's a simple insert operation
  },

  // User Skills Management
  async updateUserSkills(skills: Array<{
    skill_id: string;
    proficiency_level: string;
    years_experience: number;
    is_learning?: boolean;
  }>): Promise<void> {
    // This would be implemented as direct Supabase calls in the component
  },
};