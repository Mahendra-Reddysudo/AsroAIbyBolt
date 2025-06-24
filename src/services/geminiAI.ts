interface GeminiResponse {
  candidates: Array<{
    content: {
      parts: Array<{
        text: string;
      }>;
    };
  }>;
}

class GeminiAI {
  private apiKey: string;
  private baseUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';

  constructor() {
    this.apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    if (!this.apiKey) {
      throw new Error('Gemini API key not found in environment variables');
    }
  }

  private async makeRequest(prompt: string): Promise<string> {
    try {
      const response = await fetch(`${this.baseUrl}?key=${this.apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: prompt
            }]
          }]
        })
      });

      if (!response.ok) {
        throw new Error(`Gemini API error: ${response.status}`);
      }

      const data: GeminiResponse = await response.json();
      return data.candidates[0]?.content?.parts[0]?.text || 'No response generated';
    } catch (error) {
      console.error('Gemini API request failed:', error);
      throw new Error('Failed to get AI response');
    }
  }

  async generateCareerRecommendations(userProfile: {
    skills: string[];
    experience: string[];
    interests: string[];
    education: string[];
  }): Promise<any[]> {
    const prompt = `
Based on the following user profile, recommend 5-8 career paths with detailed analysis:

User Skills: ${userProfile.skills.join(', ')}
Experience: ${userProfile.experience.join(', ')}
Interests: ${userProfile.interests.join(', ')}
Education: ${userProfile.education.join(', ')}

For each career recommendation, provide:
1. Career title
2. Match score (0-100)
3. Detailed explanation of why it's a good fit
4. Required skills (mark which ones the user already has)
5. Salary range
6. Growth outlook

Format the response as a JSON array with this structure:
[
  {
    "career_id": "unique_id",
    "career_name": "Career Title",
    "description": "Brief description",
    "match_score": 85,
    "explanation": "Detailed explanation of the match",
    "required_skills": [
      {"skill_name": "Python", "is_essential": true, "user_has": true},
      {"skill_name": "Machine Learning", "is_essential": true, "user_has": false}
    ],
    "salary_range": {"min": 70000, "max": 120000},
    "growth_outlook": "High"
  }
]
`;

    const response = await this.makeRequest(prompt);
    try {
      // Extract JSON from the response
      const jsonMatch = response.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      throw new Error('No valid JSON found in response');
    } catch (error) {
      console.error('Failed to parse career recommendations:', error);
      // Return fallback recommendations
      return this.getFallbackCareerRecommendations(userProfile);
    }
  }

  async analyzeSkillGaps(userSkills: string[], targetCareer: string): Promise<any> {
    const prompt = `
Analyze skill gaps for a user wanting to become a ${targetCareer}.

User's current skills: ${userSkills.join(', ')}

Provide a detailed skill gap analysis including:
1. Skills the user already has that are relevant
2. Critical skills missing (essential for the role)
3. Important skills missing (recommended)
4. Nice-to-have skills missing
5. Learning resources for each missing skill
6. Estimated learning time

Format as JSON:
{
  "career": {
    "id": "career_id",
    "name": "${targetCareer}",
    "description": "Career description"
  },
  "skill_gaps": [
    {
      "skill_id": "skill_id",
      "skill_name": "Skill Name",
      "skill_category": "Programming",
      "is_essential": true,
      "required_proficiency": "Intermediate",
      "current_proficiency": null,
      "gap_severity": "Critical",
      "learning_resources": [
        {
          "id": "resource_id",
          "title": "Course Title",
          "description": "Course description",
          "type": "Course",
          "url": "https://example.com",
          "provider": "Provider Name",
          "duration_hours": 40,
          "difficulty_level": "Beginner",
          "rating": 4.5,
          "price_usd": 99
        }
      ]
    }
  ],
  "summary": {
    "total_skills_required": 10,
    "skills_you_have": 6,
    "critical_gaps": 2,
    "important_gaps": 1,
    "nice_to_have_gaps": 1,
    "estimated_learning_time": 120
  }
}
`;

    const response = await this.makeRequest(prompt);
    try {
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      throw new Error('No valid JSON found in response');
    } catch (error) {
      console.error('Failed to parse skill gap analysis:', error);
      return this.getFallbackSkillGapAnalysis(userSkills, targetCareer);
    }
  }

  async optimizeResume(resumeText: string, targetJobTitle: string): Promise<any> {
    const prompt = `
Analyze and optimize this resume for the position: ${targetJobTitle}

Resume text:
${resumeText}

Provide detailed feedback including:
1. Overall score (0-100)
2. Skill coverage percentage
3. Specific feedback categorized by priority
4. Missing keywords
5. Analysis summary

Format as JSON:
{
  "overall_score": 75,
  "skill_coverage_percentage": 80,
  "feedback": [
    {
      "category": "Content",
      "priority": "High",
      "issue": "Description of the issue",
      "suggestion": "Specific suggestion for improvement",
      "examples": ["Example 1", "Example 2"]
    }
  ],
  "missing_keywords": ["keyword1", "keyword2"],
  "relevant_skills_found": ["skill1", "skill2"],
  "analysis_summary": {
    "word_count": 350,
    "has_quantifiable_achievements": true,
    "uses_action_verbs": true,
    "formatting_consistent": false
  }
}
`;

    const response = await this.makeRequest(prompt);
    try {
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      throw new Error('No valid JSON found in response');
    } catch (error) {
      console.error('Failed to parse resume optimization:', error);
      return this.getFallbackResumeOptimization(resumeText, targetJobTitle);
    }
  }

  async generateIndustryTrends(): Promise<any> {
    const prompt = `
Generate current industry trends and insights for career development.

Provide insights about:
1. Emerging job roles
2. Skills in high demand
3. Industry shifts
4. Market trends
5. Trending skills with mention counts

Format as JSON:
{
  "insights": {
    "emerging_roles": [
      {
        "title": "AI Product Manager",
        "summary": "Description of the emerging role",
        "insight_type": "Emerging Role",
        "generated_date": "2024-01-15T10:00:00Z"
      }
    ],
    "skill_demand": [],
    "industry_shifts": [],
    "market_trends": []
  },
  "trending_skills": [
    {"skill": "Artificial Intelligence", "mentions": 1250},
    {"skill": "Cloud Computing", "mentions": 980}
  ],
  "personalized_insights": [],
  "user_subscriptions": [],
  "total_insights": 15,
  "last_updated": "2024-01-15T10:00:00Z"
}
`;

    const response = await this.makeRequest(prompt);
    try {
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      throw new Error('No valid JSON found in response');
    } catch (error) {
      console.error('Failed to parse industry trends:', error);
      return this.getFallbackIndustryTrends();
    }
  }

  async generateChatResponse(message: string, context?: string): Promise<string> {
    const prompt = `
You are ASPIRO AI, a career guidance assistant. Respond to the user's question about career development, skills, job search, or professional growth.

User message: ${message}
${context ? `Context: ${context}` : ''}

Provide a helpful, encouraging, and actionable response. Keep it conversational but professional.
`;

    return await this.makeRequest(prompt);
  }

  // Fallback methods for when AI parsing fails
  private getFallbackCareerRecommendations(userProfile: any): any[] {
    return [
      {
        career_id: "software-engineer",
        career_name: "Software Engineer",
        description: "Design and develop software applications",
        match_score: 85,
        explanation: "Based on your technical skills and interests, software engineering is an excellent match.",
        required_skills: [
          { skill_name: "Programming", is_essential: true, user_has: true },
          { skill_name: "Problem Solving", is_essential: true, user_has: true }
        ],
        salary_range: { min: 70000, max: 150000 },
        growth_outlook: "High"
      }
    ];
  }

  private getFallbackSkillGapAnalysis(userSkills: string[], targetCareer: string): any {
    return {
      career: {
        id: "target-career",
        name: targetCareer,
        description: `Career path in ${targetCareer}`
      },
      skill_gaps: [
        {
          skill_id: "advanced-skill",
          skill_name: "Advanced Technical Skills",
          skill_category: "Technical",
          is_essential: true,
          required_proficiency: "Advanced",
          current_proficiency: "Intermediate",
          gap_severity: "Important",
          learning_resources: [
            {
              id: "course-1",
              title: "Advanced Course",
              description: "Comprehensive advanced course",
              type: "Course",
              url: "https://example.com",
              provider: "Online Learning",
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

  private getFallbackResumeOptimization(resumeText: string, targetJobTitle: string): any {
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

  private getFallbackIndustryTrends(): any {
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
}

export const geminiAI = new GeminiAI();