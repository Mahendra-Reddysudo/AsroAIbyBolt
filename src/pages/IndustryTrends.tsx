import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { 
  TrendingUp, 
  Filter, 
  Bell, 
  Star,
  Calendar,
  Users,
  Briefcase,
  Target,
  Loader
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { apiService, IndustryTrends as TrendsData } from '../services/api';
import Button from '../components/UI/Button';
import Input from '../components/UI/Input';
import LoadingSpinner from '../components/UI/LoadingSpinner';

const IndustryTrends: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const [trends, setTrends] = useState<TrendsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    industry: '',
    skill: '',
    limit: 10
  });

  useEffect(() => {
    if (isAuthenticated) {
      loadTrends();
    }
  }, [isAuthenticated, filters]);

  const loadTrends = async () => {
    try {
      setLoading(true);
      const data = await apiService.getIndustryTrends(filters);
      setTrends(data);
    } catch (err) {
      setError('Failed to load industry trends. Please try again.');
      console.error('Error loading trends:', err);
    } finally {
      setLoading(false);
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
            <LoadingSpinner size="lg" text="Loading industry trends..." />
          </div>
        </div>
      </div>
    );
  }

  if (error || !trends) {
    return (
      <div className="min-h-screen bg-secondary-50 pt-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
            <TrendingUp className="h-12 w-12 text-red-600 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-secondary-900 mb-2">Unable to Load Trends</h2>
            <p className="text-secondary-600 mb-6">{error}</p>
            <Button onClick={loadTrends}>Try Again</Button>
          </div>
        </div>
      </div>
    );
  }

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'Emerging Role': return <Briefcase className="h-5 w-5 text-blue-600" />;
      case 'Skill Demand': return <Target className="h-5 w-5 text-green-600" />;
      case 'Industry Shift': return <TrendingUp className="h-5 w-5 text-purple-600" />;
      case 'Market Trend': return <Users className="h-5 w-5 text-orange-600" />;
      default: return <TrendingUp className="h-5 w-5 text-secondary-600" />;
    }
  };

  const getInsightColor = (type: string) => {
    switch (type) {
      case 'Emerging Role': return 'bg-blue-50 border-blue-200';
      case 'Skill Demand': return 'bg-green-50 border-green-200';
      case 'Industry Shift': return 'bg-purple-50 border-purple-200';
      case 'Market Trend': return 'bg-orange-50 border-orange-200';
      default: return 'bg-secondary-50 border-secondary-200';
    }
  };

  return (
    <div className="min-h-screen bg-secondary-50 pt-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-secondary-900 mb-2">
            Industry Trends & Insights
          </h1>
          <p className="text-lg text-secondary-600">
            Stay ahead of the curve with AI-powered market insights and emerging opportunities.
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <div className="flex items-center space-x-4 mb-4">
            <Filter className="h-5 w-5 text-secondary-600" />
            <h2 className="text-lg font-semibold text-secondary-900">Filters</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              label="Industry"
              value={filters.industry}
              onChange={(e) => setFilters({ ...filters, industry: e.target.value })}
              placeholder="e.g., Technology, Healthcare"
            />
            <Input
              label="Skill"
              value={filters.skill}
              onChange={(e) => setFilters({ ...filters, skill: e.target.value })}
              placeholder="e.g., Python, Machine Learning"
            />
            <div className="flex items-end">
              <Button onClick={loadTrends} className="w-full">
                Apply Filters
              </Button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Personalized Insights */}
            {trends.personalized_insights.length > 0 && (
              <div className="bg-white rounded-2xl shadow-lg p-8">
                <h2 className="text-xl font-semibold text-secondary-900 mb-6 flex items-center">
                  <Star className="h-5 w-5 mr-2 text-yellow-500" />
                  Personalized for You
                </h2>
                <div className="space-y-4">
                  {trends.personalized_insights.map((insight, index) => (
                    <div
                      key={index}
                      className={`p-4 rounded-lg border ${getInsightColor(insight.insight_type)}`}
                    >
                      <div className="flex items-start space-x-3">
                        {getInsightIcon(insight.insight_type)}
                        <div className="flex-1">
                          <h3 className="font-medium text-secondary-900 mb-2">{insight.title}</h3>
                          <p className="text-sm text-secondary-700">{insight.summary}</p>
                          <div className="flex items-center space-x-4 mt-3 text-xs text-secondary-500">
                            <span className="flex items-center">
                              <Calendar className="h-3 w-3 mr-1" />
                              {new Date(insight.generated_date).toLocaleDateString()}
                            </span>
                            <span className="px-2 py-1 bg-white rounded text-xs font-medium">
                              {insight.insight_type}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* All Insights by Category */}
            {Object.entries(trends.insights).map(([category, insights]) => (
              insights.length > 0 && (
                <div key={category} className="bg-white rounded-2xl shadow-lg p-8">
                  <h2 className="text-xl font-semibold text-secondary-900 mb-6 flex items-center">
                    {getInsightIcon(category)}
                    <span className="ml-2">{category.replace(/([A-Z])/g, ' $1').trim()}</span>
                  </h2>
                  <div className="space-y-4">
                    {insights.map((insight: any, index: number) => (
                      <div
                        key={index}
                        className={`p-4 rounded-lg border ${getInsightColor(insight.insight_type)}`}
                      >
                        <h3 className="font-medium text-secondary-900 mb-2">{insight.title}</h3>
                        <p className="text-sm text-secondary-700 mb-3">{insight.summary}</p>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4 text-xs text-secondary-500">
                            <span className="flex items-center">
                              <Calendar className="h-3 w-3 mr-1" />
                              {new Date(insight.generated_date).toLocaleDateString()}
                            </span>
                          </div>
                          <Button size="sm" variant="ghost">
                            Learn More
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )
            ))}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Trending Skills */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-secondary-900 mb-4 flex items-center">
                <TrendingUp className="h-5 w-5 mr-2" />
                Trending Skills
              </h3>
              <div className="space-y-3">
                {trends.trending_skills.slice(0, 10).map((skill, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-sm text-secondary-700">{skill.skill}</span>
                    <span className="text-xs text-secondary-500 bg-secondary-100 px-2 py-1 rounded">
                      {skill.mentions} mentions
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Subscription Management */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-secondary-900 mb-4 flex items-center">
                <Bell className="h-5 w-5 mr-2" />
                Trend Alerts
              </h3>
              <p className="text-sm text-secondary-600 mb-4">
                Get notified about trends in your areas of interest.
              </p>
              <div className="space-y-3">
                {trends.user_subscriptions.length > 0 ? (
                  trends.user_subscriptions.map((sub: any, index: number) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-secondary-50 rounded">
                      <span className="text-sm text-secondary-700">{sub.subscription_value}</span>
                      <Button size="sm" variant="ghost">
                        Remove
                      </Button>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-secondary-500">No active subscriptions</p>
                )}
              </div>
              <Button variant="outline" size="sm" className="w-full mt-4">
                Manage Alerts
              </Button>
            </div>

            {/* Quick Stats */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-secondary-900 mb-4">Quick Stats</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-secondary-600">Total Insights</span>
                  <span className="text-sm font-medium text-secondary-900">{trends.total_insights}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-secondary-600">Last Updated</span>
                  <span className="text-sm font-medium text-secondary-900">
                    {trends.last_updated ? new Date(trends.last_updated).toLocaleDateString() : 'N/A'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-secondary-600">Trending Skills</span>
                  <span className="text-sm font-medium text-secondary-900">{trends.trending_skills.length}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IndustryTrends;