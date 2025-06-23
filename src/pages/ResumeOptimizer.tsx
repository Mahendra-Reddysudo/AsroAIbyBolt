import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { 
  FileText, 
  Upload, 
  CheckCircle, 
  AlertTriangle, 
  Target,
  TrendingUp,
  Loader,
  Download
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { apiService, ResumeOptimization } from '../services/api';
import Button from '../components/UI/Button';
import Input from '../components/UI/Input';
import ProgressBar from '../components/UI/ProgressBar';
import LoadingSpinner from '../components/UI/LoadingSpinner';

const ResumeOptimizer: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const [resumeText, setResumeText] = useState('');
  const [targetJobTitle, setTargetJobTitle] = useState('');
  const [optimization, setOptimization] = useState<ResumeOptimization | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const handleOptimize = async () => {
    if (!resumeText.trim() || !targetJobTitle.trim()) {
      setError('Please provide both resume text and target job title');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const result = await apiService.optimizeResume(resumeText, targetJobTitle);
      setOptimization(result);
    } catch (err) {
      setError('Failed to optimize resume. Please try again.');
      console.error('Error optimizing resume:', err);
    } finally {
      setLoading(false);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High': return 'text-red-700 bg-red-100 border-red-200';
      case 'Medium': return 'text-yellow-700 bg-yellow-100 border-yellow-200';
      case 'Low': return 'text-blue-700 bg-blue-100 border-blue-200';
      default: return 'text-secondary-700 bg-secondary-100 border-secondary-200';
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'High': return <AlertTriangle className="h-4 w-4 text-red-600" />;
      case 'Medium': return <Target className="h-4 w-4 text-yellow-600" />;
      case 'Low': return <CheckCircle className="h-4 w-4 text-blue-600" />;
      default: return <Target className="h-4 w-4 text-secondary-600" />;
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="min-h-screen bg-secondary-50 pt-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-secondary-900 mb-2">
            Resume Optimizer
          </h1>
          <p className="text-lg text-secondary-600">
            Get AI-powered feedback to optimize your resume for specific job roles and improve your chances of getting noticed.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Input Section */}
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h2 className="text-xl font-semibold text-secondary-900 mb-6 flex items-center">
              <FileText className="h-5 w-5 mr-2" />
              Resume Analysis
            </h2>

            <div className="space-y-6">
              <Input
                label="Target Job Title"
                value={targetJobTitle}
                onChange={(e) => setTargetJobTitle(e.target.value)}
                placeholder="e.g., Software Engineer, Product Manager"
                required
              />

              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">
                  Resume Content
                </label>
                <textarea
                  value={resumeText}
                  onChange={(e) => setResumeText(e.target.value)}
                  placeholder="Paste your resume text here or upload a file..."
                  rows={12}
                  className="block w-full px-3 py-2 border border-secondary-300 rounded-lg shadow-sm focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500 transition-colors duration-200"
                  required
                />
                <p className="text-sm text-secondary-500 mt-1">
                  Word count: {resumeText.split(/\s+/).filter(word => word.length > 0).length}
                </p>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-secondary-200">
                <div className="flex items-center space-x-2 text-sm text-secondary-600">
                  <Upload className="h-4 w-4" />
                  <span>File upload coming soon</span>
                </div>
                <Button
                  onClick={handleOptimize}
                  loading={loading}
                  disabled={!resumeText.trim() || !targetJobTitle.trim()}
                  className="flex items-center"
                >
                  Analyze Resume
                  <TrendingUp className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>

            {error && (
              <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-800 text-sm">{error}</p>
              </div>
            )}
          </div>

          {/* Results Section */}
          <div className="bg-white rounded-2xl shadow-lg p-8">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <LoadingSpinner size="lg" text="Analyzing your resume..." />
              </div>
            ) : optimization ? (
              <div className="space-y-6">
                {/* Overall Score */}
                <div className="text-center pb-6 border-b border-secondary-200">
                  <h3 className="text-lg font-semibold text-secondary-900 mb-4">Overall Score</h3>
                  <div className={`text-4xl font-bold mb-2 ${getScoreColor(optimization.overall_score)}`}>
                    {optimization.overall_score}/100
                  </div>
                  <ProgressBar 
                    progress={optimization.overall_score} 
                    color={optimization.overall_score >= 80 ? 'success' : optimization.overall_score >= 60 ? 'warning' : 'error'}
                    showLabel={false}
                  />
                </div>

                {/* Key Metrics */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-secondary-50 rounded-lg">
                    <div className="text-2xl font-bold text-secondary-900">
                      {optimization.skill_coverage_percentage}%
                    </div>
                    <div className="text-sm text-secondary-600">Skill Coverage</div>
                  </div>
                  <div className="text-center p-4 bg-secondary-50 rounded-lg">
                    <div className="text-2xl font-bold text-secondary-900">
                      {optimization.analysis_summary.word_count}
                    </div>
                    <div className="text-sm text-secondary-600">Word Count</div>
                  </div>
                </div>

                {/* Analysis Summary */}
                <div className="space-y-3">
                  <h4 className="font-medium text-secondary-900">Quick Analysis</h4>
                  <div className="grid grid-cols-1 gap-2">
                    <div className="flex items-center justify-between p-2 bg-secondary-50 rounded">
                      <span className="text-sm text-secondary-700">Quantifiable Achievements</span>
                      {optimization.analysis_summary.has_quantifiable_achievements ? (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      ) : (
                        <AlertTriangle className="h-4 w-4 text-red-600" />
                      )}
                    </div>
                    <div className="flex items-center justify-between p-2 bg-secondary-50 rounded">
                      <span className="text-sm text-secondary-700">Action Verbs</span>
                      {optimization.analysis_summary.uses_action_verbs ? (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      ) : (
                        <AlertTriangle className="h-4 w-4 text-red-600" />
                      )}
                    </div>
                    <div className="flex items-center justify-between p-2 bg-secondary-50 rounded">
                      <span className="text-sm text-secondary-700">Consistent Formatting</span>
                      {optimization.analysis_summary.formatting_consistent ? (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      ) : (
                        <AlertTriangle className="h-4 w-4 text-red-600" />
                      )}
                    </div>
                  </div>
                </div>

                {/* Download Report */}
                <Button variant="outline" className="w-full flex items-center justify-center">
                  <Download className="h-4 w-4 mr-2" />
                  Download Detailed Report
                </Button>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <FileText className="h-12 w-12 text-secondary-400 mb-4" />
                <h3 className="text-lg font-medium text-secondary-900 mb-2">
                  Ready to Optimize Your Resume?
                </h3>
                <p className="text-secondary-600">
                  Enter your resume content and target job title to get started with AI-powered analysis.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Detailed Feedback */}
        {optimization && optimization.feedback.length > 0 && (
          <div className="mt-8 bg-white rounded-2xl shadow-lg p-8">
            <h2 className="text-xl font-semibold text-secondary-900 mb-6">
              Detailed Feedback & Recommendations
            </h2>

            <div className="space-y-6">
              {optimization.feedback.map((item, index) => (
                <div
                  key={index}
                  className={`border-l-4 p-4 rounded-lg ${getPriorityColor(item.priority)}`}
                >
                  <div className="flex items-start space-x-3">
                    {getPriorityIcon(item.priority)}
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h4 className="font-medium">{item.category}</h4>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${getPriorityColor(item.priority)}`}>
                          {item.priority} Priority
                        </span>
                      </div>
                      <p className="text-sm mb-2">{item.issue}</p>
                      <p className="text-sm font-medium mb-2">Suggestion:</p>
                      <p className="text-sm">{item.suggestion}</p>
                      {item.examples && item.examples.length > 0 && (
                        <div className="mt-3">
                          <p className="text-sm font-medium mb-1">Examples:</p>
                          <ul className="text-sm space-y-1">
                            {item.examples.map((example, idx) => (
                              <li key={idx} className="flex items-start">
                                <span className="text-primary-600 mr-2">•</span>
                                <span>{example}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Missing Keywords */}
        {optimization && optimization.missing_keywords.length > 0 && (
          <div className="mt-8 bg-white rounded-2xl shadow-lg p-8">
            <h2 className="text-xl font-semibold text-secondary-900 mb-6">
              Missing Keywords for {targetJobTitle}
            </h2>
            <div className="flex flex-wrap gap-2">
              {optimization.missing_keywords.map((keyword, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-medium"
                >
                  {keyword}
                </span>
              ))}
            </div>
            <p className="text-sm text-secondary-600 mt-4">
              Consider incorporating these keywords naturally into your resume to improve ATS compatibility.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResumeOptimizer;