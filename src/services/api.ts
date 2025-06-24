import { geminiAI } from './geminiAI';

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

// Helper function to get user profile data
const getUserProfileData = () => {
  // This would typically come from your user context or API
  // For now, we'll use mock data that represents a typical user profile
  return {
    skills: ['JavaScript', 'React', 'Node.js', 'Python', 'SQL'],
    experience: ['Frontend Developer at TechCorp (2 years)', 'Junior Developer at StartupXYZ (1 year)'],
    interests: ['Web Development', 'Machine Learning', 'User Experience'],
    education: ['Bachelor of Computer Science', 'Online Courses in Web Development']
  };
};

export const apiService = {
  // Career Recommendations
  async getCareerRecommendations(): Promise<{ recommendations: CareerRecommendation[] }> {
    try {
      const userProfile = getUserProfileData();
      const recommendations = await geminiAI.generateCareerRecommendations(userProfile);
      return { recommendations };
    } catch (error) {
      console.error('Error generating career recommendations:', error);
      throw new Error('Failed to fetch career recommendations');
    }
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
    try {
      const userProfile = getUserProfileData();
      // Map career ID to career name (in a real app, this would come from a database)
      const careerNames: { [key: string]: string } = {
        'software-engineer': 'Software Engineer',
        'data-scientist': 'Data Scientist',
        'product-manager': 'Product Manager',
        'ux-designer': 'UX Designer',
        'devops-engineer': 'DevOps Engineer'
      };
      
      const targetCareerName = careerNames[targetCareerId] || 'Software Engineer';
      const analysis = await geminiAI.analyzeSkillGaps(userProfile.skills, targetCareerName);
      return analysis;
    } catch (error) {
      console.error('Error analyzing skill gaps:', error);
      throw new Error('Failed to analyze skill gaps');
    }
  },

  // Resume Optimization
  async optimizeResume(resumeText: string, targetJobTitle: string): Promise<ResumeOptimization> {
    try {
      const optimization = await geminiAI.optimizeResume(resumeText, targetJobTitle);
      return optimization;
    } catch (error) {
      console.error('Error optimizing resume:', error);
      throw new Error('Failed to optimize resume');
    }
  },

  // Industry Trends
  async getIndustryTrends(filters?: {
    industry?: string;
    skill?: string;
    limit?: number;
  }): Promise<IndustryTrends> {
    try {
      const trends = await geminiAI.generateIndustryTrends();
      return trends;
    } catch (error) {
      console.error('Error fetching industry trends:', error);
      throw new Error('Failed to fetch industry trends');
    }
  },

  // User Feedback
  async submitCareerFeedback(careerId: string, feedbackType: 'like' | 'dismiss' | 'interested' | 'not_relevant'): Promise<void> {
    // Store feedback locally for now (in a real app, this would go to a database)
    const feedback = {
      careerId,
      feedbackType,
      timestamp: new Date().toISOString()
    };
    
    const existingFeedback = JSON.parse(localStorage.getItem('career_feedback') || '[]');
    existingFeedback.push(feedback);
    localStorage.setItem('career_feedback', JSON.stringify(existingFeedback));
  },

  // User Skills Management
  async updateUserSkills(skills: Array<{
    skill_id: string;
    proficiency_level: string;
    years_experience: number;
    is_learning?: boolean;
  }>): Promise<void> {
    // Store skills locally for now (in a real app, this would go to a database)
    localStorage.setItem('user_skills', JSON.stringify(skills));
  },

  // Chat functionality
  async sendChatMessage(message: string, context?: string): Promise<string> {
    try {
      const response = await geminiAI.generateChatResponse(message, context);
      return response;
    } catch (error) {
      console.error('Error sending chat message:', error);
      throw new Error('Failed to get chat response');
    }
  }
};