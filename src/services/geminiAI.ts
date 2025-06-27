interface GeminiResponse {
  candidates: Array<{
    content: {
      parts: Array<{
        text: string;
      }>;
    };
  }>;
  error?: {
    code: number;
    message: string;
    status: string;
  };
}

class GeminiAI {
  private apiKey: string;
  private baseUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';

  constructor() {
    this.apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    if (!this.apiKey || this.apiKey === 'your_gemini_api_key_here' || this.apiKey === 'AIzaSyB5VHdV_Ya6s9bl7mMzp-GMd-oP9YRkuGk') {
      console.warn('Gemini API key not properly configured. Using fallback responses.');
    }
  }

  private async makeRequest(prompt: string): Promise<string> {
    // If API key is not properly configured, return fallback response
    if (!this.apiKey || this.apiKey === 'your_gemini_api_key_here' || this.apiKey === 'AIzaSyB5VHdV_Ya6s9bl7mMzp-GMd-oP9YRkuGk') {
      console.warn('Using fallback response due to missing/invalid API key');
      throw new Error('API_KEY_NOT_CONFIGURED');
    }

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
          }],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 2048,
          }
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Gemini API error: ${response.status} - ${errorText}`);
        throw new Error(`API_REQUEST_FAILED: ${response.status}`);
      }

      const data: GeminiResponse = await response.json();
      
      if (data.error) {
        console.error('Gemini API returned error:', data.error);
        throw new Error(`API_ERROR: ${data.error.message}`);
      }

      const responseText = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!responseText) {
        throw new Error('API_NO_RESPONSE');
      }

      return responseText;
    } catch (error) {
      console.error('Gemini API request failed:', error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('API_REQUEST_FAILED');
    }
  }

  async generateCareerRecommendations(userProfile: {
    skills: string[];
    experience: string[];
    interests: string[];
    education: string[];
  }): Promise<any[]> {
    try {
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
      
      // Extract JSON from the response
      const jsonMatch = response.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      throw new Error('No valid JSON found in response');
    } catch (error) {
      console.error('Failed to generate career recommendations:', error);
      // Always return fallback recommendations
      return this.getFallbackCareerRecommendations(userProfile);
    }
  }

  async analyzeSkillGaps(userSkills: string[], targetCareer: string): Promise<any> {
    try {
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
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      throw new Error('No valid JSON found in response');
    } catch (error) {
      console.error('Failed to analyze skill gaps:', error);
      return this.getFallbackSkillGapAnalysis(userSkills, targetCareer);
    }
  }

  async optimizeResume(resumeText: string, targetJobTitle: string): Promise<any> {
    try {
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
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      throw new Error('No valid JSON found in response');
    } catch (error) {
      console.error('Failed to optimize resume:', error);
      return this.getFallbackResumeOptimization(resumeText, targetJobTitle);
    }
  }

  async generateIndustryTrends(): Promise<any> {
    // Check if API key is configured, if not, return fallback immediately
    if (!this.apiKey || this.apiKey === 'your_gemini_api_key_here' || this.apiKey === 'AIzaSyB5VHdV_Ya6s9bl7mMzp-GMd-oP9YRkuGk') {
      console.warn('Gemini API key not configured, using fallback industry trends');
      return this.getFallbackIndustryTrends();
    }

    try {
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
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      throw new Error('No valid JSON found in response');
    } catch (error) {
      console.error('Failed to generate industry trends:', error);
      return this.getFallbackIndustryTrends();
    }
  }

  async generateChatResponse(message: string, context?: string): Promise<string> {
    try {
      const prompt = `
You are ASPIRO AI, a career guidance assistant. Respond to the user's question about career development, skills, job search, or professional growth.

User message: ${message}
${context ? `Context: ${context}` : ''}

Provide a helpful, encouraging, and actionable response. Keep it conversational but professional.
`;

      return await this.makeRequest(prompt);
    } catch (error) {
      console.error('Failed to generate chat response:', error);
      return "I'm sorry, I'm having trouble connecting to my AI service right now. Please try again later, or feel free to ask me about career guidance and I'll do my best to help with the information I have available.";
    }
  }

  // Enhanced fallback methods with more realistic data
  private getFallbackCareerRecommendations(userProfile: any): any[] {
    const hasJavaScript = userProfile.skills.some((skill: string) => 
      skill.toLowerCase().includes('javascript') || skill.toLowerCase().includes('js')
    );
    const hasPython = userProfile.skills.some((skill: string) => 
      skill.toLowerCase().includes('python')
    );
    const hasReact = userProfile.skills.some((skill: string) => 
      skill.toLowerCase().includes('react')
    );
    const hasSQL = userProfile.skills.some((skill: string) => 
      skill.toLowerCase().includes('sql')
    );

    return [
      {
        career_id: "software-engineer",
        career_name: "Software Engineer",
        description: "Design, develop, and maintain software applications and systems",
        match_score: hasJavaScript || hasPython ? 88 : 75,
        explanation: `Your technical skills in ${userProfile.skills.join(', ')} align well with software engineering. This role offers excellent growth opportunities and matches your programming interests.`,
        required_skills: [
          { skill_name: "JavaScript", is_essential: true, user_has: hasJavaScript },
          { skill_name: "Python", is_essential: false, user_has: hasPython },
          { skill_name: "Problem Solving", is_essential: true, user_has: true },
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
        match_score: hasReact || hasJavaScript ? 85 : 70,
        explanation: `Your skills in ${hasReact ? 'React and ' : ''}web technologies make you a strong candidate for frontend development. This role focuses on creating engaging user experiences.`,
        required_skills: [
          { skill_name: "React", is_essential: true, user_has: hasReact },
          { skill_name: "JavaScript", is_essential: true, user_has: hasJavaScript },
          { skill_name: "CSS", is_essential: true, user_has: false },
          { skill_name: "HTML", is_essential: true, user_has: false },
          { skill_name: "UI/UX Design", is_essential: false, user_has: false }
        ],
        salary_range: { min: 65000, max: 130000 },
        growth_outlook: "High"
      },
      {
        career_id: "data-analyst",
        career_name: "Data Analyst",
        description: "Analyze data to help organizations make informed business decisions",
        match_score: hasPython || hasSQL ? 82 : 65,
        explanation: `Your analytical skills and ${hasPython ? 'Python' : 'technical'} background provide a solid foundation for data analysis. This growing field offers diverse opportunities across industries.`,
        required_skills: [
          { skill_name: "SQL", is_essential: true, user_has: hasSQL },
          { skill_name: "Python", is_essential: true, user_has: hasPython },
          { skill_name: "Excel", is_essential: true, user_has: false },
          { skill_name: "Statistics", is_essential: true, user_has: false },
          { skill_name: "Data Visualization", is_essential: true, user_has: false }
        ],
        salary_range: { min: 60000, max: 120000 },
        growth_outlook: "High"
      },
      {
        career_id: "product-manager",
        career_name: "Product Manager",
        description: "Guide product development from conception to launch",
        match_score: 78,
        explanation: "Your technical background combined with problem-solving skills makes you well-suited for product management. This role bridges technical and business aspects of product development.",
        required_skills: [
          { skill_name: "Product Strategy", is_essential: true, user_has: false },
          { skill_name: "User Research", is_essential: true, user_has: false },
          { skill_name: "Technical Understanding", is_essential: true, user_has: true },
          { skill_name: "Communication", is_essential: true, user_has: true },
          { skill_name: "Analytics", is_essential: true, user_has: false }
        ],
        salary_range: { min: 80000, max: 160000 },
        growth_outlook: "High"
      },
      {
        career_id: "devops-engineer",
        career_name: "DevOps Engineer",
        description: "Streamline development and deployment processes",
        match_score: 72,
        explanation: "Your technical skills provide a good foundation for DevOps engineering. This role focuses on automation, infrastructure, and improving development workflows.",
        required_skills: [
          { skill_name: "Cloud Platforms", is_essential: true, user_has: false },
          { skill_name: "Docker", is_essential: true, user_has: false },
          { skill_name: "CI/CD", is_essential: true, user_has: false },
          { skill_name: "Linux", is_essential: true, user_has: false },
          { skill_name: "Scripting", is_essential: true, user_has: hasPython }
        ],
        salary_range: { min: 85000, max: 155000 },
        growth_outlook: "High"
      }
    ];
  }

  private getFallbackSkillGapAnalysis(userSkills: string[], targetCareer: string): any {
    const careerSkillMap: { [key: string]: any } = {
      "Software Engineer": {
        essential: ["Programming Languages", "Data Structures", "Algorithms", "Version Control"],
        important: ["Testing", "Debugging", "System Design"],
        nice: ["Cloud Computing", "DevOps"]
      },
      "Data Scientist": {
        essential: ["Python", "Statistics", "Machine Learning", "SQL"],
        important: ["Data Visualization", "R", "Deep Learning"],
        nice: ["Big Data Tools", "Cloud Platforms"]
      },
      "Product Manager": {
        essential: ["Product Strategy", "User Research", "Analytics", "Communication"],
        important: ["Technical Understanding", "Market Research", "Roadmapping"],
        nice: ["Design Thinking", "A/B Testing"]
      }
    };

    const careerData = careerSkillMap[targetCareer] || careerSkillMap["Software Engineer"];
    const userSkillsLower = userSkills.map(s => s.toLowerCase());

    const generateSkillGaps = (skills: string[], severity: string) => {
      return skills.map((skill, index) => ({
        skill_id: `${severity.toLowerCase()}-${index}`,
        skill_name: skill,
        skill_category: "Technical",
        is_essential: severity === "Critical",
        required_proficiency: "Intermediate",
        current_proficiency: userSkillsLower.some(us => us.includes(skill.toLowerCase())) ? "Beginner" : null,
        gap_severity: severity,
        learning_resources: [
          {
            id: `resource-${index}`,
            title: `Complete ${skill} Course`,
            description: `Comprehensive course covering ${skill} fundamentals and advanced concepts`,
            type: "Course",
            url: "https://example.com",
            provider: "Online Learning Platform",
            duration_hours: 40,
            difficulty_level: "Intermediate",
            rating: 4.5,
            price_usd: 99
          }
        ]
      }));
    };

    const criticalGaps = generateSkillGaps(careerData.essential.filter((skill: string) => 
      !userSkillsLower.some(us => us.includes(skill.toLowerCase()))
    ), "Critical");

    const importantGaps = generateSkillGaps(careerData.important.filter((skill: string) => 
      !userSkillsLower.some(us => us.includes(skill.toLowerCase()))
    ), "Important");

    const niceToHaveGaps = generateSkillGaps(careerData.nice.filter((skill: string) => 
      !userSkillsLower.some(us => us.includes(skill.toLowerCase()))
    ), "Nice to Have");

    const allGaps = [...criticalGaps, ...importantGaps, ...niceToHaveGaps];

    return {
      career: {
        id: targetCareer.toLowerCase().replace(/\s+/g, '-'),
        name: targetCareer,
        description: `Career path focused on ${targetCareer.toLowerCase()} responsibilities and growth opportunities`
      },
      skill_gaps: allGaps,
      summary: {
        total_skills_required: careerData.essential.length + careerData.important.length + careerData.nice.length,
        skills_you_have: userSkills.length,
        critical_gaps: criticalGaps.length,
        important_gaps: importantGaps.length,
        nice_to_have_gaps: niceToHaveGaps.length,
        estimated_learning_time: allGaps.length * 30
      }
    };
  }

  private getFallbackResumeOptimization(resumeText: string, targetJobTitle: string): any {
    const wordCount = resumeText.split(/\s+/).length;
    const hasNumbers = /\d+/.test(resumeText);
    const hasActionVerbs = /\b(managed|developed|created|implemented|designed|led|improved)\b/i.test(resumeText);
    
    return {
      overall_score: wordCount > 300 ? 78 : 65,
      skill_coverage_percentage: hasNumbers ? 75 : 60,
      feedback: [
        {
          category: "Content",
          priority: "High",
          issue: hasNumbers ? "Good use of quantifiable achievements" : "Lacks quantifiable achievements",
          suggestion: hasNumbers ? "Continue including specific metrics and numbers" : "Add specific numbers, percentages, and metrics to demonstrate your impact",
          examples: ["Increased team productivity by 25%", "Managed a budget of $50,000", "Led a team of 8 developers"]
        },
        {
          category: "Keywords",
          priority: "Medium",
          issue: "Missing industry-specific keywords",
          suggestion: `Include more keywords relevant to ${targetJobTitle} positions`,
          examples: ["agile", "collaboration", "problem-solving", "leadership"]
        },
        {
          category: "Formatting",
          priority: "Low",
          issue: "Consider improving visual hierarchy",
          suggestion: "Use consistent formatting for sections and bullet points",
          examples: ["Use bullet points for achievements", "Consistent date formatting", "Clear section headers"]
        }
      ],
      missing_keywords: ["leadership", "teamwork", "problem-solving", "communication"],
      relevant_skills_found: userSkills.slice(0, 3),
      analysis_summary: {
        word_count: wordCount,
        has_quantifiable_achievements: hasNumbers,
        uses_action_verbs: hasActionVerbs,
        formatting_consistent: wordCount > 200
      }
    };
  }

  private getFallbackIndustryTrends(): any {
    return {
      insights: {
        emerging_roles: [
          {
            title: "AI Ethics Specialist",
            summary: "Professionals who ensure AI systems are developed and deployed ethically, addressing bias, fairness, and transparency in AI applications",
            insight_type: "Emerging Role",
            generated_date: new Date().toISOString()
          },
          {
            title: "Sustainability Data Analyst",
            summary: "Specialists who analyze environmental data to help organizations meet sustainability goals and comply with environmental regulations",
            insight_type: "Emerging Role",
            generated_date: new Date().toISOString()
          }
        ],
        skill_demand: [
          {
            title: "Cloud Computing Skills Surge",
            summary: "Demand for cloud computing skills continues to grow across industries as organizations accelerate digital transformation",
            insight_type: "Skill Demand",
            generated_date: new Date().toISOString()
          },
          {
            title: "Cybersecurity Expertise Critical",
            summary: "With increasing cyber threats, cybersecurity skills are in high demand across all sectors",
            insight_type: "Skill Demand",
            generated_date: new Date().toISOString()
          }
        ],
        industry_shifts: [
          {
            title: "Remote Work Transformation",
            summary: "Organizations are adapting to permanent remote and hybrid work models, changing how teams collaborate",
            insight_type: "Industry Shift",
            generated_date: new Date().toISOString()
          }
        ],
        market_trends: [
          {
            title: "AI Integration Accelerating",
            summary: "Companies across industries are integrating AI tools to improve efficiency and decision-making",
            insight_type: "Market Trend",
            generated_date: new Date().toISOString()
          }
        ]
      },
      trending_skills: [
        { skill: "Artificial Intelligence", mentions: 1250 },
        { skill: "Cloud Computing", mentions: 980 },
        { skill: "Data Science", mentions: 850 },
        { skill: "Cybersecurity", mentions: 720 },
        { skill: "Machine Learning", mentions: 680 },
        { skill: "DevOps", mentions: 620 },
        { skill: "React", mentions: 580 },
        { skill: "Python", mentions: 550 }
      ],
      personalized_insights: [],
      user_subscriptions: [],
      total_insights: 6,
      last_updated: new Date().toISOString()
    };
  }
}

export const geminiAI = new GeminiAI();