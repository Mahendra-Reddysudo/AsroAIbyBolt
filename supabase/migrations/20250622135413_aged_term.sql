/*
  # Sample Data for ASPIRO AI

  1. Sample careers, skills, and relationships
  2. Learning resources
  3. Industry insights
*/

-- Insert sample skills
INSERT INTO skills (name, category, description) VALUES
('Python', 'Programming', 'High-level programming language for web development, data science, and AI'),
('JavaScript', 'Programming', 'Programming language for web development and full-stack applications'),
('React', 'Frontend', 'JavaScript library for building user interfaces'),
('Node.js', 'Backend', 'JavaScript runtime for server-side development'),
('SQL', 'Database', 'Language for managing and querying relational databases'),
('Machine Learning', 'AI/ML', 'Algorithms and statistical models for data analysis and predictions'),
('Data Analysis', 'Analytics', 'Process of inspecting and modeling data to discover insights'),
('Project Management', 'Management', 'Planning, executing, and closing projects effectively'),
('Communication', 'Soft Skills', 'Ability to convey information effectively'),
('Leadership', 'Soft Skills', 'Ability to guide and influence others'),
('AWS', 'Cloud', 'Amazon Web Services cloud computing platform'),
('Docker', 'DevOps', 'Containerization platform for application deployment'),
('Git', 'Development Tools', 'Version control system for tracking code changes'),
('Agile', 'Methodology', 'Iterative approach to project management and software development'),
('UI/UX Design', 'Design', 'User interface and user experience design principles')
ON CONFLICT (name) DO NOTHING;

-- Insert sample careers
INSERT INTO careers (name, description, average_salary_min, average_salary_max, growth_outlook, industry) VALUES
('Software Engineer', 'Design, develop, and maintain software applications and systems', 70000, 150000, 'High', 'Technology'),
('Data Scientist', 'Analyze complex data to help organizations make informed decisions', 80000, 160000, 'High', 'Technology'),
('Product Manager', 'Guide the development and strategy of products from conception to launch', 90000, 180000, 'High', 'Technology'),
('UX Designer', 'Design user experiences for digital products and services', 60000, 120000, 'Medium', 'Design'),
('DevOps Engineer', 'Bridge development and operations to improve deployment and infrastructure', 75000, 145000, 'High', 'Technology'),
('Frontend Developer', 'Build user-facing web applications and interfaces', 65000, 130000, 'High', 'Technology'),
('Backend Developer', 'Develop server-side logic and infrastructure for applications', 70000, 140000, 'High', 'Technology'),
('AI Engineer', 'Develop artificial intelligence and machine learning systems', 85000, 170000, 'High', 'Technology'),
('Marketing Manager', 'Plan and execute marketing strategies to promote products or services', 55000, 110000, 'Medium', 'Marketing'),
('Business Analyst', 'Analyze business processes and recommend improvements', 60000, 120000, 'Medium', 'Business')
ON CONFLICT DO NOTHING;

-- Link careers with skills (using subqueries to get IDs)
INSERT INTO career_skills (career_id, skill_id, is_essential, proficiency_level)
SELECT 
  c.id as career_id,
  s.id as skill_id,
  cs.is_essential,
  cs.proficiency_level
FROM (VALUES
  ('Software Engineer', 'Python', true, 'Intermediate'),
  ('Software Engineer', 'JavaScript', true, 'Intermediate'),
  ('Software Engineer', 'Git', true, 'Intermediate'),
  ('Software Engineer', 'SQL', false, 'Beginner'),
  ('Data Scientist', 'Python', true, 'Advanced'),
  ('Data Scientist', 'Machine Learning', true, 'Advanced'),
  ('Data Scientist', 'Data Analysis', true, 'Advanced'),
  ('Data Scientist', 'SQL', true, 'Intermediate'),
  ('Product Manager', 'Project Management', true, 'Advanced'),
  ('Product Manager', 'Communication', true, 'Advanced'),
  ('Product Manager', 'Leadership', true, 'Intermediate'),
  ('Product Manager', 'Agile', true, 'Intermediate'),
  ('UX Designer', 'UI/UX Design', true, 'Advanced'),
  ('UX Designer', 'Communication', true, 'Intermediate'),
  ('DevOps Engineer', 'AWS', true, 'Intermediate'),
  ('DevOps Engineer', 'Docker', true, 'Intermediate'),
  ('DevOps Engineer', 'Python', false, 'Beginner'),
  ('Frontend Developer', 'JavaScript', true, 'Advanced'),
  ('Frontend Developer', 'React', true, 'Advanced'),
  ('Frontend Developer', 'UI/UX Design', false, 'Beginner'),
  ('Backend Developer', 'Node.js', true, 'Advanced'),
  ('Backend Developer', 'SQL', true, 'Intermediate'),
  ('Backend Developer', 'Python', false, 'Intermediate'),
  ('AI Engineer', 'Python', true, 'Advanced'),
  ('AI Engineer', 'Machine Learning', true, 'Advanced'),
  ('AI Engineer', 'Data Analysis', true, 'Intermediate')
) AS cs(career_name, skill_name, is_essential, proficiency_level)
JOIN careers c ON c.name = cs.career_name
JOIN skills s ON s.name = cs.skill_name
ON CONFLICT (career_id, skill_id) DO NOTHING;

-- Insert sample learning resources
INSERT INTO learning_resources (title, description, type, url, provider, skill_id, duration_hours, difficulty_level, rating, price_usd)
SELECT 
  lr.title,
  lr.description,
  lr.type,
  lr.url,
  lr.provider,
  s.id as skill_id,
  lr.duration_hours,
  lr.difficulty_level,
  lr.rating,
  lr.price_usd
FROM (VALUES
  ('Complete Python Bootcamp', 'Comprehensive Python course from beginner to advanced', 'Course', 'https://udemy.com/python-bootcamp', 'Udemy', 'Python', 40, 'Beginner', 4.6, 89.99),
  ('JavaScript: The Complete Guide', 'Modern JavaScript from the ground up', 'Course', 'https://udemy.com/javascript-complete', 'Udemy', 'JavaScript', 52, 'Beginner', 4.7, 94.99),
  ('React - The Complete Guide', 'Build powerful, fast, user-friendly React.js Applications', 'Course', 'https://udemy.com/react-complete', 'Udemy', 'React', 48, 'Intermediate', 4.6, 89.99),
  ('Machine Learning Specialization', 'Learn the fundamentals of machine learning', 'Certification', 'https://coursera.org/ml-specialization', 'Coursera', 'Machine Learning', 120, 'Intermediate', 4.8, 49.00),
  ('AWS Certified Solutions Architect', 'Prepare for AWS certification exam', 'Certification', 'https://aws.amazon.com/certification', 'AWS', 'AWS', 80, 'Intermediate', 4.5, 300.00),
  ('Data Analysis with Python', 'Learn data analysis using Python and pandas', 'Course', 'https://freecodecamp.org/data-analysis', 'FreeCodeCamp', 'Data Analysis', 30, 'Beginner', 4.4, 0.00),
  ('Docker Mastery', 'Complete Docker course with Kubernetes', 'Course', 'https://udemy.com/docker-mastery', 'Udemy', 'Docker', 25, 'Intermediate', 4.7, 79.99),
  ('Git Complete: The definitive guide', 'Master Git version control system', 'Course', 'https://udemy.com/git-complete', 'Udemy', 'Git', 15, 'Beginner', 4.5, 54.99)
) AS lr(title, description, type, url, provider, skill_name, duration_hours, difficulty_level, rating, price_usd)
JOIN skills s ON s.name = lr.skill_name
ON CONFLICT DO NOTHING;

-- Insert sample industry insights
INSERT INTO industry_insights (title, summary, relevant_skills, relevant_careers, insight_type, generated_date, is_active) VALUES
('AI Revolution Accelerates Across Industries', 'Artificial Intelligence adoption is rapidly expanding beyond tech companies into healthcare, finance, and manufacturing. Companies are seeking professionals who can bridge AI capabilities with domain expertise.', 
 '["Machine Learning", "Python", "Data Analysis"]'::jsonb, 
 '["AI Engineer", "Data Scientist", "Software Engineer"]'::jsonb, 
 'Industry Shift', now() - interval '2 days', true),

('Remote Work Drives Cloud Skills Demand', 'The shift to remote work has accelerated cloud adoption, creating high demand for cloud architecture and DevOps skills. AWS, Azure, and GCP certifications are becoming essential.', 
 '["AWS", "Docker", "DevOps"]'::jsonb, 
 '["DevOps Engineer", "Software Engineer"]'::jsonb, 
 'Skill Demand', now() - interval '1 day', true),

('Product Management Evolution', 'Product management roles are evolving to require more technical skills and data-driven decision making. Modern PMs need to understand analytics, user research, and basic technical concepts.', 
 '["Data Analysis", "Project Management", "Communication"]'::jsonb, 
 '["Product Manager", "Business Analyst"]'::jsonb, 
 'Emerging Role', now() - interval '3 days', true),

('Frontend Development Trends', 'React continues to dominate frontend development, but new frameworks like Next.js and Svelte are gaining traction. Full-stack capabilities are increasingly valued.', 
 '["React", "JavaScript", "Node.js"]'::jsonb, 
 '["Frontend Developer", "Software Engineer"]'::jsonb, 
 'Market Trend', now() - interval '1 day', true);