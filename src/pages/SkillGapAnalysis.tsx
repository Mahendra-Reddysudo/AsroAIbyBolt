import React, { useState, useEffect } from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import { 
  Target, 
  BookOpen, 
  Clock, 
  Star, 
  ExternalLink,
  AlertTriangle,
  CheckCircle,
  Loader,
  ArrowLeft,
  TrendingUp
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { apiService, SkillGap } from '../services/api';
import Button from '../components/UI/Button';

const SkillGapAnalysis: React.FC = () => {
  const { careerId } = useParams<{ careerId: string }>();
  const { isAuthenticated } = useAuth();
  const [analysis, setAnalysis] = useState<{
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
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isAuthenticated && careerId) {
      loadAnalysis();
    }
  }, [isAuthenticated, careerId]);

  const loadAnalysis = async () => {
    if (!careerId) return;

    try {
      setLoading(true);
      const data = await apiService.analyzeSkillGaps(careerId);
      setAnalysis(data);
    } catch (err) {
      setError('Failed to analyze skill gaps. Please try again.');
      console.error('Error loading skill gap analysis:', err);
    } finally {
      setLoading(false);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'Critical': return 'text-red-700 bg-red-100 border-red-200';
      case 'Important': return 'text-yellow-700 bg-yellow-100 border-yellow-200';
      case 'Nice to Have': return 'text-blue-700 bg-blue-100 border-blue-200';
      default: return 'text-secondary-700 bg-secondary-100 border-secondary-200';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'Critical': return <AlertTriangle className="h-4 w-4 text-red-600" />;
      case 'Important': return <Target className="h-4 w-4 text-yellow-600" />;
      case 'Nice to Have': return <CheckCircle className="h-4 w-4 text-blue-600" />;
      default: return <Target className="h-4 w-4 text-secondary-600" />;
    }
  };

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-secondary-50 pt-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center py-12">
            <Loader className="h-8 w-8 animate-spin text-primary-600" />
            <span className="ml-3 text-lg text-secondary-600">Analyzing skill gaps...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error || !analysis) {
    return (
      <div className="min-h-screen bg-secondary-50 pt-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
            <div className="text-red-600 mb-4">
              <AlertTriangle className="h-12 w-12 mx-auto" />
            </div>
            <h2 className="text-xl font-semibold text-secondary-900 mb-2">Analysis Failed</h2>
            <p className="text-secondary-600 mb-6">{error}</p>
            <div className="flex items-center justify-center space-x-4">
              <Link to="/career-recommendations">
                <Button variant="outline">Back to Recommendations</Button>
              </Link>
              <Button onClick={loadAnalysis}>Try Again</Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-secondary-50 pt-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link 
            to="/career-recommendations"
            className="inline-flex items-center text-primary-600 hover:text-primary-700 mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Recommendations
          </Link>
          
          <h1 className="text-3xl font-bold text-secondary-900 mb-2">
            Skill Gap Analysis: {analysis.career.name}
          </h1>
          <p className="text-lg text-secondary-600">
            {analysis.career.description}
          </p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-secondary-600">Skills You Have</h3>
              <CheckCircle className="h-5 w-5 text-green-600" />
            </div>
            <div className="text-2xl font-bold text-secondary-900">
              {analysis.summary.skills_you_have}/{analysis.summary.total_skills_required}
            </div>
            <div className="text-sm text-secondary-500">
              {Math.round((analysis.summary.skills_you_have / analysis.summary.total_skills_required) * 100)}% Complete
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-secondary-600">Critical Gaps</h3>
              <AlertTriangle className="h-5 w-5 text-red-600" />
            </div>
            <div className="text-2xl font-bold text-red-600">
              {analysis.summary.critical_gaps}
            </div>
            <div className="text-sm text-secondary-500">Must-have skills</div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-secondary-600">Important Gaps</h3>
              <Target className="h-5 w-5 text-yellow-600" />
            </div>
            <div className="text-2xl font-bold text-yellow-600">
              {analysis.summary.important_gaps}
            </div>
            <div className="text-sm text-secondary-500">Recommended skills</div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-secondary-600">Learning Time</h3>
              <Clock className="h-5 w-5 text-blue-600" />
            </div>
            <div className="text-2xl font-bold text-blue-600">
              {Math.round(analysis.summary.estimated_learning_time)}h
            </div>
            <div className="text-sm text-secondary-500">Estimated hours</div>
          </div>
        </div>

        {/* Skill Gaps */}
        {analysis.skill_gaps.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
            <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-secondary-900 mb-2">
              Congratulations! No Skill Gaps Found
            </h2>
            <p className="text-secondary-600 mb-6">
              You already have all the skills required for this career path. You're ready to apply!
            </p>
            <Button>View Similar Roles</Button>
          </div>
        ) : (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-secondary-900">Skills to Develop</h2>
            
            {analysis.skill_gaps.map((gap) => (
              <div
                key={gap.skill_id}
                className={`bg-white rounded-2xl shadow-lg p-6 border-l-4 ${getSeverityColor(gap.gap_severity)}`}
              >
                {/* Skill Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      {getSeverityIcon(gap.gap_severity)}
                      <h3 className="text-xl font-semibold text-secondary-900">
                        {gap.skill_name}
                      </h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getSeverityColor(gap.gap_severity)}`}>
                        {gap.gap_severity}
                      </span>
                    </div>
                    <div className="flex items-center space-x-4 text-sm text-secondary-600">
                      <span>Category: {gap.skill_category}</span>
                      <span>Required: {gap.required_proficiency}</span>
                      {gap.current_proficiency && (
                        <span>Current: {gap.current_proficiency}</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Learning Resources */}
                {gap.learning_resources.length > 0 && (
                  <div>
                    <h4 className="text-lg font-medium text-secondary-900 mb-4 flex items-center">
                      <BookOpen className="h-5 w-5 mr-2" />
                      Recommended Learning Resources
                    </h4>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {gap.learning_resources.slice(0, 6).map((resource) => (
                        <div
                          key={resource.id}
                          className="border border-secondary-200 rounded-lg p-4 hover:shadow-md transition-shadow duration-200"
                        >
                          <div className="flex items-start justify-between mb-2">
                            <h5 className="font-medium text-secondary-900 text-sm leading-tight">
                              {resource.title}
                            </h5>
                            <span className={`px-2 py-1 rounded text-xs font-medium ${
                              resource.type === 'Course' ? 'bg-blue-100 text-blue-800' :
                              resource.type === 'Certification' ? 'bg-purple-100 text-purple-800' :
                              'bg-secondary-100 text-secondary-800'
                            }`}>
                              {resource.type}
                            </span>
                          </div>
                          
                          <p className="text-xs text-secondary-600 mb-3 line-clamp-2">
                            {resource.description}
                          </p>
                          
                          <div className="flex items-center justify-between text-xs text-secondary-500 mb-3">
                            <span>{resource.provider}</span>
                            <div className="flex items-center space-x-2">
                              {resource.duration_hours && (
                                <span className="flex items-center">
                                  <Clock className="h-3 w-3 mr-1" />
                                  {resource.duration_hours}h
                                </span>
                              )}
                              {resource.rating && (
                                <span className="flex items-center">
                                  <Star className="h-3 w-3 mr-1 text-yellow-500" />
                                  {resource.rating}
                                </span>
                              )}
                            </div>
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-secondary-900">
                              {resource.price_usd === 0 ? 'Free' : `$${resource.price_usd}`}
                            </span>
                            <a
                              href={resource.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center text-primary-600 hover:text-primary-700 text-sm font-medium"
                            >
                              View Course
                              <ExternalLink className="h-3 w-3 ml-1" />
                            </a>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Action Section */}
        <div className="mt-12 bg-gradient-to-r from-primary-600 to-blue-600 rounded-2xl p-8 text-center text-white">
          <h2 className="text-2xl font-bold mb-4">Ready to Bridge Your Skill Gaps?</h2>
          <p className="text-lg mb-6 text-primary-100">
            Create a personalized learning plan and track your progress toward your career goals.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4">
            <Button 
              variant="outline" 
              className="bg-white text-primary-600 hover:bg-secondary-50 border-white"
            >
              Create Learning Plan
            </Button>
            <Link to="/career-recommendations">
              <Button 
                variant="outline" 
                className="bg-white text-primary-600 hover:bg-secondary-50 border-white"
              >
                Explore More Careers
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SkillGapAnalysis;