/*
  # ASPIRO AI Core Database Schema

  1. New Tables
    - `careers` - Career path definitions with descriptions and salary info
    - `skills` - Master skills database with categories
    - `career_skills` - Junction table linking careers to required skills
    - `learning_resources` - Educational resources for skill development
    - `job_descriptions` - Job market data for trend analysis
    - `industry_insights` - AI-generated market insights
    - `user_skills` - User's current skills
    - `user_feedback` - User feedback on career recommendations
    - `user_subscriptions` - User trend alert subscriptions
    - `skill_gaps_analysis` - Stored skill gap analyses
    - `career_recommendations` - Cached career recommendations

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
    - Separate public data from user-specific data

  3. Indexes
    - Performance indexes for common queries
    - Full-text search capabilities
*/

-- Careers table
CREATE TABLE IF NOT EXISTS careers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  average_salary_min integer,
  average_salary_max integer,
  growth_outlook text CHECK (growth_outlook IN ('High', 'Medium', 'Low')),
  industry text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Skills table
CREATE TABLE IF NOT EXISTS skills (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  category text NOT NULL,
  description text,
  created_at timestamptz DEFAULT now()
);

-- Career skills junction table
CREATE TABLE IF NOT EXISTS career_skills (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  career_id uuid REFERENCES careers(id) ON DELETE CASCADE,
  skill_id uuid REFERENCES skills(id) ON DELETE CASCADE,
  is_essential boolean DEFAULT false,
  proficiency_level text CHECK (proficiency_level IN ('Beginner', 'Intermediate', 'Advanced')),
  created_at timestamptz DEFAULT now(),
  UNIQUE(career_id, skill_id)
);

-- Learning resources table
CREATE TABLE IF NOT EXISTS learning_resources (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  type text CHECK (type IN ('Course', 'Certification', 'Bootcamp', 'Article', 'Video', 'Book')),
  url text,
  provider text,
  skill_id uuid REFERENCES skills(id) ON DELETE CASCADE,
  duration_hours integer,
  difficulty_level text CHECK (difficulty_level IN ('Beginner', 'Intermediate', 'Advanced')),
  rating decimal(3,2),
  price_usd decimal(10,2),
  created_at timestamptz DEFAULT now()
);

-- Job descriptions table for market analysis
CREATE TABLE IF NOT EXISTS job_descriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  company text,
  location text,
  full_text text,
  extracted_skills jsonb,
  salary_min integer,
  salary_max integer,
  posted_date timestamptz,
  source_url text,
  created_at timestamptz DEFAULT now()
);

-- Industry insights table
CREATE TABLE IF NOT EXISTS industry_insights (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  summary text NOT NULL,
  relevant_skills jsonb,
  relevant_careers jsonb,
  insight_type text CHECK (insight_type IN ('Emerging Role', 'Skill Demand', 'Industry Shift', 'Market Trend')),
  generated_date timestamptz DEFAULT now(),
  is_active boolean DEFAULT true
);

-- User skills table
CREATE TABLE IF NOT EXISTS user_skills (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  skill_id uuid REFERENCES skills(id) ON DELETE CASCADE,
  proficiency_level text CHECK (proficiency_level IN ('Beginner', 'Intermediate', 'Advanced')),
  years_experience integer DEFAULT 0,
  is_learning boolean DEFAULT false,
  acquired_date timestamptz,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, skill_id)
);

-- User feedback on recommendations
CREATE TABLE IF NOT EXISTS user_feedback (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  career_id uuid REFERENCES careers(id) ON DELETE CASCADE,
  feedback_type text CHECK (feedback_type IN ('like', 'dismiss', 'interested', 'not_relevant')),
  created_at timestamptz DEFAULT now()
);

-- User subscriptions for trend alerts
CREATE TABLE IF NOT EXISTS user_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  subscription_type text CHECK (subscription_type IN ('industry', 'skill', 'career')),
  subscription_value text NOT NULL,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Skill gaps analysis cache
CREATE TABLE IF NOT EXISTS skill_gaps_analysis (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  career_id uuid REFERENCES careers(id) ON DELETE CASCADE,
  skill_gaps jsonb NOT NULL,
  recommended_resources jsonb,
  analysis_date timestamptz DEFAULT now(),
  is_current boolean DEFAULT true
);

-- Career recommendations cache
CREATE TABLE IF NOT EXISTS career_recommendations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  career_id uuid REFERENCES careers(id) ON DELETE CASCADE,
  match_score decimal(5,2) NOT NULL,
  explanation text,
  recommendation_factors jsonb,
  generated_at timestamptz DEFAULT now(),
  is_current boolean DEFAULT true
);

-- Enable RLS
ALTER TABLE careers ENABLE ROW LEVEL SECURITY;
ALTER TABLE skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE career_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE learning_resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_descriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE industry_insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE skill_gaps_analysis ENABLE ROW LEVEL SECURITY;
ALTER TABLE career_recommendations ENABLE ROW LEVEL SECURITY;

-- Public read access for reference data
CREATE POLICY "Public read access for careers"
  ON careers FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Public read access for skills"
  ON skills FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Public read access for career_skills"
  ON career_skills FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Public read access for learning_resources"
  ON learning_resources FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Public read access for industry_insights"
  ON industry_insights FOR SELECT
  TO authenticated
  USING (is_active = true);

-- User-specific data policies
CREATE POLICY "Users can manage their own skills"
  ON user_skills
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own feedback"
  ON user_feedback
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own subscriptions"
  ON user_subscriptions
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own skill gaps"
  ON skill_gaps_analysis
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own recommendations"
  ON career_recommendations
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_career_skills_career_id ON career_skills(career_id);
CREATE INDEX IF NOT EXISTS idx_career_skills_skill_id ON career_skills(skill_id);
CREATE INDEX IF NOT EXISTS idx_learning_resources_skill_id ON learning_resources(skill_id);
CREATE INDEX IF NOT EXISTS idx_user_skills_user_id ON user_skills(user_id);
CREATE INDEX IF NOT EXISTS idx_user_skills_skill_id ON user_skills(skill_id);
CREATE INDEX IF NOT EXISTS idx_career_recommendations_user_id ON career_recommendations(user_id);
CREATE INDEX IF NOT EXISTS idx_skill_gaps_analysis_user_id ON skill_gaps_analysis(user_id);

-- Full-text search indexes
CREATE INDEX IF NOT EXISTS idx_careers_search ON careers USING gin(to_tsvector('english', name || ' ' || COALESCE(description, '')));
CREATE INDEX IF NOT EXISTS idx_skills_search ON skills USING gin(to_tsvector('english', name || ' ' || COALESCE(description, '')));