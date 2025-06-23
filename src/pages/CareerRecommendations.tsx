import React, { useState, useEffect } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { 
  Target, 
  TrendingUp, 
  DollarSign, 
  Clock, 
  ThumbsUp, 
  ThumbsDown,
  ExternalLink,
  Loader,
  Star,
  ArrowRight
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { apiService, CareerRecommendation } from '../services/api';
import Button from '../components/UI/Button';

const CareerRecommendations: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const [recommendations, setRecommendations] = useState<CareerRecommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [feedbackLoading, setFeedbackLoading] = useState<string | null>(null);

  useEffect(() => {
    if (isAuthenticated) {
      loadRecommendations();
    }
  }, [isAuthenticated]);

  const loadRecommendations = async () => {
    try {
      setLoading(true);
      const data = await apiService.getCareerRecommendations();
      setRecommendations(data.recommendations);
    } catch (err) {
      setError('Failed to load career recommendations. Please try again.');
      console.error('Error loading recommendations:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFeedback = async (careerId: string, feedbackType: 'like' | 'dismiss') => {
    try {
      setFeedbackLoading(careerId);
      await apiService.submitCareerFeedback(careerId, feedbackType);
      
      // Update local state to reflect feedback
      setRecommendations(prev => 
        prev.map(rec => 
          rec.career_id === careerId 
            ? { ...rec, user_feedback: feedbackType }
            : rec
        )
      );
    } catch (err) {
      console.error('Error submitting feedback:', err);
    } finally {
      setFeedbackLoading(null);
    }
  };

  const getMatchScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-100';
    if (score >= 60) return 'text-blue-600 bg-blue-100';
    if (score >= 40) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getGrowthOutlookIcon = (outlook: string) => {
    switch (outlook) {
      case 'High': return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'Medium': return <TrendingUp className="h-4 w-4 text-yellow-600" />;
      case 'Low': return <TrendingUp className="h-4 w-4 text-red-600" />;
      default: return <TrendingUp className="h-4 w-4 text-secondary-400" />;
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
            <span className="ml-3 text-lg text-secondary-600">Analyzing your profile...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-secondary-50 pt-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
            <div className="text-red-600 mb-4">
              <Target className="h-12 w-12 mx-auto" />
            </div>
            <h2 className="text-xl font-semibold text-secondary-900 mb-2">Unable to Load Recommendations</h2>
            <p className="text-secondary-600 mb-6">{error}</p>
            <Button onClick={loadRecommendations}>Try Again</Button>
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
          <h1 className="text-3xl font-bold text-secondary-900 mb-2">
            Your Personalized Career Recommendations
          </h1>
          <p className="text-lg text-secondary-600">
            Based on your skills, experience, and interests, here are the career paths that match your profile.
          </p>
        </div>

        {/* Recommendations Grid */}
        {recommendations.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
            <Target className="h-12 w-12 text-secondary-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-secondary-900 mb-2">No Recommendations Yet</h2>
            <p className="text-secondary-600 mb-6">
              Complete your profile with skills and experience to get personalized career recommendations.
            </p>
            <Link to="/profile">
              <Button>Complete Your Profile</Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {recommendations.map((recommendation) => (
              <div
                key={recommendation.career_id}
                className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300"
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-secondary-900 mb-2">
                      {recommendation.career_name}
                    </h3>
                    <div className="flex items-center space-x-4 mb-3">
                      <div className={`px-3 py-1 rounded-full text-sm font-medium ${getMatchScoreColor(recommendation.match_score)}`}>
                        {recommendation.match_score}% Match
                      </div>
                      <div className="flex items-center space-x-1">
                        {getGrowthOutlookIcon(recommendation.growth_outlook)}
                        <span className="text-sm text-secondary-600">{recommendation.growth_outlook} Growth</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Description */}
                <p className="text-secondary-700 mb-4 leading-relaxed">
                  {recommendation.description}
                </p>

                {/* Explanation */}
                <div className="bg-primary-50 rounded-lg p-4 mb-4">
                  <p className="text-primary-800 text-sm leading-relaxed">
                    {recommendation.explanation}
                  </p>
                </div>

                {/* Salary Range */}
                {recommendation.salary_range.min > 0 && (
                  <div className="flex items-center space-x-2 mb-4">
                    <DollarSign className="h-4 w-4 text-secondary-500" />
                    <span className="text-sm text-secondary-600">
                      ${recommendation.salary_range.min.toLocaleString()} - ${recommendation.salary_range.max.toLocaleString()}
                    </span>
                  </div>
                )}

                {/* Skills Overview */}
                <div className="mb-6">
                  <h4 className="text-sm font-medium text-secondary-900 mb-2">Required Skills</h4>
                  <div className="flex flex-wrap gap-2">
                    {recommendation.required_skills.slice(0, 6).map((skill, index) => (
                      <span
                        key={index}
                        className={`px-2 py-1 rounded text-xs font-medium ${
                          skill.user_has
                            ? 'bg-green-100 text-green-800'
                            : skill.is_essential
                            ? 'bg-red-100 text-red-800'
                            : 'bg-secondary-100 text-secondary-700'
                        }`}
                      >
                        {skill.skill_name}
                        {skill.user_has && ' ✓'}
                      </span>
                    ))}
                    {recommendation.required_skills.length > 6 && (
                      <span className="px-2 py-1 rounded text-xs font-medium bg-secondary-100 text-secondary-700">
                        +{recommendation.required_skills.length - 6} more
                      </span>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between pt-4 border-t border-secondary-200">
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleFeedback(recommendation.career_id, 'like')}
                      disabled={feedbackLoading === recommendation.career_id}
                      className="p-2 text-secondary-500 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors duration-200"
                      title="I'm interested"
                    >
                      <ThumbsUp className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleFeedback(recommendation.career_id, 'dismiss')}
                      disabled={feedbackLoading === recommendation.career_id}
                      className="p-2 text-secondary-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
                      title="Not interested"
                    >
                      <ThumbsDown className="h-4 w-4" />
                    </button>
                  </div>

                  <Link to={`/career-analysis/${recommendation.career_id}`}>
                    <Button size="sm" className="flex items-center">
                      Analyze Skills Gap
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Call to Action */}
        {recommendations.length > 0 && (
          <div className="mt-12 bg-gradient-to-r from-primary-600 to-blue-600 rounded-2xl p-8 text-center text-white">
            <h2 className="text-2xl font-bold mb-4">Ready to Take the Next Step?</h2>
            <p className="text-lg mb-6 text-primary-100">
              Explore detailed skill gap analyses for your top career matches and create a personalized learning plan.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4">
              <Link to="/industry-trends">
                <Button 
                  variant="outline" 
                  className="bg-white text-primary-600 hover:bg-secondary-50 border-white"
                >
                  View Industry Trends
                </Button>
              </Link>
              <Link to="/resume-optimizer">
                <Button 
                  variant="outline" 
                  className="bg-white text-primary-600 hover:bg-secondary-50 border-white"
                >
                  Optimize Your Resume
                </Button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CareerRecommendations;