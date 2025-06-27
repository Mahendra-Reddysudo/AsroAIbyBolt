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
      console.log('Generating career recommendations for profile:', userProfile);
      
      const recommendations = await geminiAI.generateCareerRecommendations(userProfile);
      console.log('Generated recommendations:', recommendations);
      
      return { recommendations };
    } catch (error) {
      console.error('Error generating career recommendations:', error);
      
      // Provide fallback recommendations even if AI fails
      const userProfile = getUserProfileData();
      const fallbackRecommendations: CareerRecommendation[] = [
        {
          career_id: "software-engineer",
          career_name: "Software Engineer",
          description: "Design, develop, and maintain software applications and systems",
          match_score: 85,
          explanation: "Your technical skills in JavaScript, React, and Python align perfectly with software engineering roles. This career offers excellent growth opportunities and matches your programming interests.",
          required_skills: [
            { skill_name: "JavaScript", is_essential: true, user_has: true },
            { skill_name: "React", is_essential: true, user_has: true },
            { skill_name: "Python", is_essential: false, user_has: true },
            { skill_name: "Git", is_essential: true, user_has: false },
            { skill_name: "Testing", is_essential: true, user_has: false }
          ],
          salary_range: { min: 75000, max: 150000 },
          growth_outlook: "High"
        },
        {
          career_id: "frontend-developer",
          career_name: "Frontend Developer",
          description: "Create user interfaces and experiences for web applications",
          match_score: 90,
          explanation: "Your expertise in React and JavaScript makes you an excellent candidate for frontend development. This role focuses on creating engaging user experiences and is in high demand.",
          required_skills: [
            { skill_name: "React", is_essential: true, user_has: true },
            { skill_name: "JavaScript", is_essential: true, user_has: true },
            { skill_name: "CSS", is_essential: true, user_has: false },
            { skill_name: "HTML", is_essential: true, user_has: false },
            { skill_name: "UI/UX Design", is_essential: false, user_has: false }
          ],
          salary_range: { min: 65000, max: 130000 },
          growth_outlook: "High"
        }
      ];
      
      return { recommendations: fallbackRecommendations };
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
        'devops-engineer': 'DevOps Engineer',
        'frontend-developer': 'Frontend Developer',
        'data-analyst': 'Data Analyst'
      };
      
      const targetCareerName = careerNames[targetCareerId] || 'Software Engineer';
      console.log('Analyzing skill gaps for:', targetCareerName);
      
      const analysis = await geminiAI.analyzeSkillGaps(userProfile.skills, targetCareerName);
      return analysis;
    } catch (error) {
      console.error('Error analyzing skill gaps:', error);
      
      // Provide fallback analysis
      const careerNames: { [key: string]: string } = {
        'software-engineer': 'Software Engineer',
        'data-scientist': 'Data Scientist',
        'product-manager': 'Product Manager',
        'ux-designer': 'UX Designer',
        'devops-engineer': 'DevOps Engineer',
        'frontend-developer': 'Frontend Developer',
        'data-analyst': 'Data Analyst'
      };
      
      const targetCareerName = careerNames[targetCareerId] || 'Software Engineer';
      
      return {
        career: {
          id: targetCareerId,
          name: targetCareerName,
          description: `Career path focused on ${targetCareerName.toLowerCase()} responsibilities and growth opportunities`
        },
        skill_gaps: [
          {
            skill_id: "advanced-frameworks",
            skill_name: "Advanced Frameworks",
            skill_category: "Technical",
            is_essential: true,
            required_proficiency: "Advanced",
            current_proficiency: "Intermediate",
            gap_severity: "Important",
            learning_resources: [
              {
                id: "course-1",
                title: "Advanced Framework Mastery",
                description: "Comprehensive course covering advanced framework concepts and best practices",
                type: "Course",
                url: "https://example.com",
                provider: "Online Learning Platform",
                duration_hours: 40,
                difficulty_level: "Advanced",
                rating: 4.5,
                price_usd: 99
              }
            ]
          }
        ],
        summary: {
          total_skills_required: 8,
          skills_you_have: 6,
          critical_gaps: 0,
          important_gaps: 2,
          nice_to_have_gaps: 0,
          estimated_learning_time: 80
        }
      };
    }
  },

  // Resume Optimization
  async optimizeResume(resumeText: string, targetJobTitle: string): Promise<ResumeOptimization> {
    try {
      console.log('Optimizing resume for:', targetJobTitle);
      const optimization = await geminiAI.optimizeResume(resumeText, targetJobTitle);
      return optimization;
    } catch (error) {
      console.error('Error optimizing resume:', error);
      
      // Provide fallback optimization
      const wordCount = resumeText.split(/\s+/).length;
      return {
        overall_score: 75,
        skill_coverage_percentage: 70,
        feedback: [
          {
            category: "Content",
            priority: "Medium",
            issue: "Consider adding more quantifiable achievements",
            suggestion: "Include specific numbers and metrics to demonstrate your impact",
            examples: ["Increased efficiency by 25%", "Managed a team of 5 people"]
          }
        ],
        missing_keywords: ["leadership", "project management"],
        relevant_skills_found: ["communication", "teamwork"],
        analysis_summary: {
          word_count: wordCount,
          has_quantifiable_achievements: wordCount > 200,
          uses_action_verbs: true,
          formatting_consistent: true
        }
      };
    }
  },

  // Industry Trends
  async getIndustryTrends(filters?: {
    industry?: string;
    skill?: string;
    limit?: number;
  }): Promise<IndustryTrends> {
    try {
      console.log('Fetching industry trends with filters:', filters);
      const trends = await geminiAI.generateIndustryTrends(filters);
      return trends;
    } catch (error) {
      console.error('Error fetching industry trends:', error);
      
      // Provide fallback trends
      return {
        insights: {
          emerging_roles: [
            {
              title: "AI Ethics Specialist",
              summary: "Professionals who ensure AI systems are developed and deployed ethically",
              insight_type: "Emerging Role",
              generated_date: new Date().toISOString()
            }
          ],
          skill_demand: [
            {
              title: "Cloud Computing Skills Surge",
              summary: "Demand for cloud computing skills continues to grow across industries",
              insight_type: "Skill Demand",
              generated_date: new Date().toISOString()
            }
          ],
          industry_shifts: [],
          market_trends: []
        },
        trending_skills: [
          { skill: "Artificial Intelligence", mentions: 1250 },
          { skill: "Cloud Computing", mentions: 980 },
          { skill: "Data Science", mentions: 850 },
          { skill: "Cybersecurity", mentions: 720 }
        ],
        personalized_insights: [],
        user_subscriptions: [],
        total_insights: 2,
        last_updated: new Date().toISOString()
      };
    }
  },

  // User Feedback
  async submitCareerFeedback(careerId: string, feedbackType: 'like' | 'dismiss' | 'interested' | 'not_relevant'): Promise<void> {
    try {
      // Store feedback locally for now (in a real app, this would go to a database)
      const feedback = {
        careerId,
        feedbackType,
        timestamp: new Date().toISOString()
      };
      
      const existingFeedback = JSON.parse(localStorage.getItem('career_feedback') || '[]');
      existingFeedback.push(feedback);
      localStorage.setItem('career_feedback', JSON.stringify(existingFeedback));
      
      console.log('Feedback submitted:', feedback);
    } catch (error) {
      console.error('Error submitting feedback:', error);
      // Don't throw error for feedback submission failures
    }
  },

  // User Skills Management
  async updateUserSkills(skills: Array<{
    skill_id: string;
    proficiency_level: string;
    years_experience: number;
    is_learning?: boolean;
  }>): Promise<void> {
    try {
      // Store skills locally for now (in a real app, this would go to a database)
      localStorage.setItem('user_skills', JSON.stringify(skills));
      console.log('User skills updated:', skills);
    } catch (error) {
      console.error('Error updating user skills:', error);
      // Don't throw error for skills update failures
    }
  },

  // Chat functionality
  async sendChatMessage(message: string, context?: string): Promise<string> {
    try {
      console.log('Sending chat message:', message);
      const response = await geminiAI.generateChatResponse(message, context);
      return response;
    } catch (error) {
      console.error('Error sending chat message:', error);
      return "I'm sorry, I'm having trouble connecting to my AI service right now. Please try again later, or feel free to ask me about career guidance and I'll do my best to help with the information I have available.";
    }
  }
};