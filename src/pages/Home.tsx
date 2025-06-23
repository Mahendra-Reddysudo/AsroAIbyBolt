import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowRight, 
  Target, 
  BarChart3, 
  FileText, 
  Star,
  CheckCircle,
  Users,
  Award,
  TrendingUp,
  Sparkles
} from 'lucide-react';
import Button from '../components/UI/Button';

const Home: React.FC = () => {
  const [currentTestimonial, setCurrentTestimonial] = useState(0);

  const features = [
    {
      icon: Target,
      title: 'Personalized Career Path',
      description: 'AI-powered recommendations tailored to your unique skills, interests, and goals.',
      color: 'from-primary-500 to-primary-600'
    },
    {
      icon: BarChart3,
      title: 'Skill Gap Analysis',
      description: 'Identify missing skills and get actionable insights to bridge the gap in your career.',
      color: 'from-blue-500 to-blue-600'
    },
    {
      icon: FileText,
      title: 'Resume Optimization',
      description: 'Get your resume analyzed and optimized for better job prospects and ATS compatibility.',
      color: 'from-purple-500 to-purple-600'
    }
  ];

  const testimonials = [
    {
      name: 'Sarah Chen',
      role: 'Software Engineer',
      image: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=150',
      content: 'ASPIRO AI helped me transition from marketing to tech. The personalized roadmap was incredibly detailed and actionable.'
    },
    {
      name: 'Marcus Johnson',
      role: 'Data Scientist',
      image: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=150',
      content: 'The skill gap analysis was eye-opening. I finally understood what I needed to learn to advance my career.'
    },
    {
      name: 'Emily Rodriguez',
      role: 'Product Manager',
      image: 'https://images.pexels.com/photos/1130626/pexels-photo-1130626.jpeg?auto=compress&cs=tinysrgb&w=150',
      content: 'Within 3 months of following ASPIRO AI\'s recommendations, I landed my dream job at a Fortune 500 company.'
    }
  ];

  const stats = [
    { number: '50K+', label: 'Users Guided' },
    { number: '95%', label: 'Success Rate' },
    { number: '200+', label: 'Career Paths' },
    { number: '4.9/5', label: 'User Rating' }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [testimonials.length]);

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative pt-20 pb-16 md:pt-28 md:pb-24 bg-gradient-to-br from-primary-50 via-white to-blue-50 overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=%2260%22 height=%2260%22 viewBox=%220 0 60 60%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cg fill=%22none%22 fill-rule=%22evenodd%22%3E%3Cg fill=%22%23f0fdfa%22 fill-opacity=%220.4%22%3E%3Ccircle cx=%2230%22 cy=%2230%22 r=%221.5%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-30"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center animate-fade-in">
            <div className="inline-flex items-center space-x-2 bg-primary-100 text-primary-800 px-4 py-2 rounded-full text-sm font-medium mb-6">
              <Sparkles className="h-4 w-4" />
              <span>AI-Powered Career Guidance</span>
            </div>
            
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-secondary-900 mb-6 leading-tight">
              Unlock Your
              <span className="block bg-gradient-to-r from-primary-600 to-blue-600 bg-clip-text text-transparent">
                Potential
              </span>
              with ASPIRO AI
            </h1>
            
            <p className="text-lg md:text-xl text-secondary-600 mb-8 max-w-3xl mx-auto leading-relaxed">
              Discover personalized career paths, identify skill gaps, and optimize your professional journey 
              with our AI-powered platform. Your future starts here.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4">
              <Link to="/signup">
                <Button size="lg" className="w-full sm:w-auto group">
                  Get Started - It's Free
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform duration-200" />
                </Button>
              </Link>
              
              <Link to="#features">
                <Button variant="outline" size="lg" className="w-full sm:w-auto">
                  Explore Features
                </Button>
              </Link>
            </div>

            <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-8 max-w-2xl mx-auto">
              {stats.map((stat, index) => (
                <div key={index} className="text-center animate-slide-up" style={{ animationDelay: `${index * 0.1}s` }}>
                  <div className="text-2xl md:text-3xl font-bold text-secondary-900">{stat.number}</div>
                  <div className="text-sm text-secondary-600">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-16 md:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-secondary-900 mb-4">
              Everything You Need to Succeed
            </h2>
            <p className="text-lg text-secondary-600 max-w-2xl mx-auto">
              Our comprehensive platform provides all the tools and insights you need 
              to navigate your career journey with confidence.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="group bg-white p-8 rounded-2xl border border-secondary-200 hover:border-primary-300 hover:shadow-xl transition-all duration-300 animate-slide-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className={`inline-flex p-3 rounded-xl bg-gradient-to-r ${feature.color} mb-6`}>
                  <feature.icon className="h-6 w-6 text-white" />
                </div>
                
                <h3 className="text-xl font-semibold text-secondary-900 mb-3 group-hover:text-primary-600 transition-colors duration-200">
                  {feature.title}
                </h3>
                
                <p className="text-secondary-600 leading-relaxed">
                  {feature.description}
                </p>

                <div className="mt-6">
                  <Button variant="ghost" className="p-0 text-primary-600 hover:text-primary-700">
                    Learn more
                    <ArrowRight className="ml-1 h-4 w-4 group-hover:translate-x-1 transition-transform duration-200" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-16 md:py-24 bg-secondary-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-secondary-900 mb-4">
              Trusted by Professionals Worldwide
            </h2>
            <p className="text-lg text-secondary-600 max-w-2xl mx-auto">
              Join thousands of professionals who have transformed their careers with ASPIRO AI.
            </p>
          </div>

          <div className="relative">
            <div className="bg-white rounded-2xl p-8 md:p-12 shadow-lg max-w-4xl mx-auto">
              <div className="flex items-center justify-center mb-6">
                <div className="flex space-x-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                  ))}
                </div>
              </div>

              <blockquote className="text-lg md:text-xl text-secondary-700 text-center mb-8 leading-relaxed">
                "{testimonials[currentTestimonial].content}"
              </blockquote>

              <div className="flex items-center justify-center">
                <img
                  src={testimonials[currentTestimonial].image}
                  alt={testimonials[currentTestimonial].name}
                  className="w-12 h-12 rounded-full object-cover mr-4"
                />
                <div className="text-center">
                  <div className="font-semibold text-secondary-900">
                    {testimonials[currentTestimonial].name}
                  </div>
                  <div className="text-secondary-600 text-sm">
                    {testimonials[currentTestimonial].role}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-center mt-8 space-x-2">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentTestimonial(index)}
                  className={`w-2 h-2 rounded-full transition-colors duration-200 ${
                    index === currentTestimonial ? 'bg-primary-600' : 'bg-secondary-300'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24 bg-gradient-to-r from-primary-600 to-blue-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to Transform Your Career?
          </h2>
          <p className="text-lg md:text-xl text-primary-100 mb-8 max-w-2xl mx-auto">
            Join thousands of professionals who have already started their journey to success.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4">
            <Link to="/signup">
              <Button 
                size="lg" 
                className="w-full sm:w-auto bg-white text-primary-600 hover:bg-secondary-50 focus:ring-white"
              >
                Start Your Journey Today
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            
            <Link to="/contact">
              <Button 
                variant="outline" 
                size="lg" 
                className="w-full sm:w-auto border-white text-white hover:bg-white hover:text-primary-600"
              >
                Talk to an Expert
              </Button>
            </Link>
          </div>

          <div className="mt-12 flex items-center justify-center space-x-8 text-primary-100">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5" />
              <span className="text-sm">Free to start</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5" />
              <span className="text-sm">No credit card required</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5" />
              <span className="text-sm">Cancel anytime</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;