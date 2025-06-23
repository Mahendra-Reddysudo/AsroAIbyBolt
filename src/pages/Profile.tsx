import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { 
  User, 
  Mail, 
  MapPin, 
  Calendar, 
  Briefcase, 
  GraduationCap, 
  Award,
  Edit,
  Save,
  X,
  Plus,
  Trash2
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import Button from '../components/UI/Button';
import Input from '../components/UI/Input';

interface Experience {
  id: string;
  title: string;
  company: string;
  location: string;
  startDate: string;
  endDate: string;
  current: boolean;
  description: string;
}

interface Education {
  id: string;
  degree: string;
  school: string;
  location: string;
  startDate: string;
  endDate: string;
  gpa?: string;
}

const Profile: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState('personal');

  // Mock profile data - in real app, this would come from API
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    location: 'San Francisco, CA',
    bio: 'Passionate software developer with 5 years of experience building scalable web applications.',
    skills: ['JavaScript', 'React', 'Node.js', 'Python', 'AWS', 'Docker'],
    experiences: [
      {
        id: '1',
        title: 'Senior Software Engineer',
        company: 'TechCorp Inc.',
        location: 'San Francisco, CA',
        startDate: '2022-01',
        endDate: '',
        current: true,
        description: 'Lead frontend development for the main product platform, managing a team of 3 developers.'
      },
      {
        id: '2',
        title: 'Software Engineer',
        company: 'StartupXYZ',
        location: 'Remote',
        startDate: '2020-06',
        endDate: '2021-12',
        current: false,
        description: 'Developed full-stack web applications using React, Node.js, and PostgreSQL.'
      }
    ] as Experience[],
    education: [
      {
        id: '1',
        degree: 'Bachelor of Science in Computer Science',
        school: 'University of California, Berkeley',
        location: 'Berkeley, CA',
        startDate: '2016-08',
        endDate: '2020-05',
        gpa: '3.8'
      }
    ] as Education[]
  });

  const [completionPercentage, setCompletionPercentage] = useState(85);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const handleSave = () => {
    // In real app, save to API
    setIsEditing(false);
  };

  const addExperience = () => {
    const newExp: Experience = {
      id: Date.now().toString(),
      title: '',
      company: '',
      location: '',
      startDate: '',
      endDate: '',
      current: false,
      description: ''
    };
    setProfileData({
      ...profileData,
      experiences: [...profileData.experiences, newExp]
    });
  };

  const removeExperience = (id: string) => {
    setProfileData({
      ...profileData,
      experiences: profileData.experiences.filter(exp => exp.id !== id)
    });
  };

  const addEducation = () => {
    const newEdu: Education = {
      id: Date.now().toString(),
      degree: '',
      school: '',
      location: '',
      startDate: '',
      endDate: '',
      gpa: ''
    };
    setProfileData({
      ...profileData,
      education: [...profileData.education, newEdu]
    });
  };

  const removeEducation = (id: string) => {
    setProfileData({
      ...profileData,
      education: profileData.education.filter(edu => edu.id !== id)
    });
  };

  const tabs = [
    { id: 'personal', label: 'Personal Details', icon: User },
    { id: 'experience', label: 'Work Experience', icon: Briefcase },
    { id: 'education', label: 'Education', icon: GraduationCap },
    { id: 'skills', label: 'Skills & Interests', icon: Award }
  ];

  return (
    <div className="min-h-screen bg-secondary-50 pt-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Profile Header */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6">
            <div className="flex items-center space-x-6">
              <img
                src={user?.avatar || 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=150'}
                alt={user?.name}
                className="w-20 h-20 rounded-full object-cover border-4 border-primary-100"
              />
              <div>
                <h1 className="text-2xl font-bold text-secondary-900">{profileData.name}</h1>
                <p className="text-secondary-600 flex items-center mt-1">
                  <MapPin className="h-4 w-4 mr-1" />
                  {profileData.location}
                </p>
                <p className="text-secondary-600 flex items-center mt-1">
                  <Mail className="h-4 w-4 mr-1" />
                  {profileData.email}
                </p>
              </div>
            </div>

            <div className="mt-4 md:mt-0 flex items-center space-x-4">
              <div className="text-right">
                <div className="text-sm text-secondary-600 mb-1">Profile Completion</div>
                <div className="flex items-center space-x-2">
                  <div className="w-24 bg-secondary-200 rounded-full h-2">
                    <div
                      className="bg-primary-600 h-2 rounded-full"
                      style={{ width: `${completionPercentage}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium text-secondary-900">{completionPercentage}%</span>
                </div>
              </div>

              {!isEditing ? (
                <Button onClick={() => setIsEditing(true)} className="flex items-center">
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Profile
                </Button>
              ) : (
                <div className="flex space-x-2">
                  <Button onClick={handleSave} className="flex items-center">
                    <Save className="h-4 w-4 mr-2" />
                    Save
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setIsEditing(false)}
                    className="flex items-center"
                  >
                    <X className="h-4 w-4 mr-2" />
                    Cancel
                  </Button>
                </div>
              )}
            </div>
          </div>

          <p className="text-secondary-700 leading-relaxed">{profileData.bio}</p>
        </div>

        {/* Profile Content */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <nav className="space-y-2">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors duration-200 ${
                      activeTab === tab.id
                        ? 'bg-primary-50 text-primary-700 border border-primary-200'
                        : 'text-secondary-700 hover:bg-secondary-50'
                    }`}
                  >
                    <tab.icon className="h-5 w-5" />
                    <span className="font-medium">{tab.label}</span>
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Content Area */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-2xl shadow-lg p-8">
              {activeTab === 'personal' && (
                <div className="space-y-6">
                  <h2 className="text-xl font-semibold text-secondary-900 mb-6">Personal Details</h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Input
                      label="Full Name"
                      value={profileData.name}
                      onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                      disabled={!isEditing}
                    />
                    <Input
                      label="Email"
                      type="email"
                      value={profileData.email}
                      onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                      disabled={!isEditing}
                    />
                    <Input
                      label="Location"
                      value={profileData.location}
                      onChange={(e) => setProfileData({ ...profileData, location: e.target.value })}
                      disabled={!isEditing}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-secondary-700 mb-1">
                      Bio
                    </label>
                    <textarea
                      value={profileData.bio}
                      onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                      disabled={!isEditing}
                      rows={4}
                      className="block w-full px-3 py-2 border border-secondary-300 rounded-lg shadow-sm focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500 transition-colors duration-200 disabled:bg-secondary-50 disabled:text-secondary-500"
                      placeholder="Tell us about yourself..."
                    />
                  </div>
                </div>
              )}

              {activeTab === 'experience' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold text-secondary-900">Work Experience</h2>
                    {isEditing && (
                      <Button onClick={addExperience} size="sm" className="flex items-center">
                        <Plus className="h-4 w-4 mr-2" />
                        Add Experience
                      </Button>
                    )}
                  </div>

                  <div className="space-y-6">
                    {profileData.experiences.map((exp, index) => (
                      <div key={exp.id} className="border border-secondary-200 rounded-lg p-6">
                        {isEditing && (
                          <div className="flex justify-end mb-4">
                            <Button
                              onClick={() => removeExperience(exp.id)}
                              variant="ghost"
                              size="sm"
                              className="text-accent-600 hover:text-accent-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                          <Input
                            label="Job Title"
                            value={exp.title}
                            disabled={!isEditing}
                            onChange={(e) => {
                              const updated = [...profileData.experiences];
                              updated[index] = { ...exp, title: e.target.value };
                              setProfileData({ ...profileData, experiences: updated });
                            }}
                          />
                          <Input
                            label="Company"
                            value={exp.company}
                            disabled={!isEditing}
                            onChange={(e) => {
                              const updated = [...profileData.experiences];
                              updated[index] = { ...exp, company: e.target.value };
                              setProfileData({ ...profileData, experiences: updated });
                            }}
                          />
                          <Input
                            label="Location"
                            value={exp.location}
                            disabled={!isEditing}
                            onChange={(e) => {
                              const updated = [...profileData.experiences];
                              updated[index] = { ...exp, location: e.target.value };
                              setProfileData({ ...profileData, experiences: updated });
                            }}
                          />
                          <div className="flex items-center space-x-4">
                            <Input
                              label="Start Date"
                              type="month"
                              value={exp.startDate}
                              disabled={!isEditing}
                              onChange={(e) => {
                                const updated = [...profileData.experiences];
                                updated[index] = { ...exp, startDate: e.target.value };
                                setProfileData({ ...profileData, experiences: updated });
                              }}
                            />
                            {!exp.current && (
                              <Input
                                label="End Date"
                                type="month"
                                value={exp.endDate}
                                disabled={!isEditing}
                                onChange={(e) => {
                                  const updated = [...profileData.experiences];
                                  updated[index] = { ...exp, endDate: e.target.value };
                                  setProfileData({ ...profileData, experiences: updated });
                                }}
                              />
                            )}
                          </div>
                        </div>

                        {isEditing && (
                          <div className="mb-4">
                            <label className="flex items-center">
                              <input
                                type="checkbox"
                                checked={exp.current}
                                onChange={(e) => {
                                  const updated = [...profileData.experiences];
                                  updated[index] = { ...exp, current: e.target.checked, endDate: e.target.checked ? '' : exp.endDate };
                                  setProfileData({ ...profileData, experiences: updated });
                                }}
                                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-secondary-300 rounded"
                              />
                              <span className="ml-2 text-sm text-secondary-700">I currently work here</span>
                            </label>
                          </div>
                        )}

                        <div>
                          <label className="block text-sm font-medium text-secondary-700 mb-1">
                            Description
                          </label>
                          <textarea
                            value={exp.description}
                            disabled={!isEditing}
                            rows={3}
                            onChange={(e) => {
                              const updated = [...profileData.experiences];
                              updated[index] = { ...exp, description: e.target.value };
                              setProfileData({ ...profileData, experiences: updated });
                            }}
                            className="block w-full px-3 py-2 border border-secondary-300 rounded-lg shadow-sm focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500 transition-colors duration-200 disabled:bg-secondary-50 disabled:text-secondary-500"
                            placeholder="Describe your role and achievements..."
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'education' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold text-secondary-900">Education</h2>
                    {isEditing && (
                      <Button onClick={addEducation} size="sm" className="flex items-center">
                        <Plus className="h-4 w-4 mr-2" />
                        Add Education
                      </Button>
                    )}
                  </div>

                  <div className="space-y-6">
                    {profileData.education.map((edu, index) => (
                      <div key={edu.id} className="border border-secondary-200 rounded-lg p-6">
                        {isEditing && (
                          <div className="flex justify-end mb-4">
                            <Button
                              onClick={() => removeEducation(edu.id)}
                              variant="ghost"
                              size="sm"
                              className="text-accent-600 hover:text-accent-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <Input
                            label="Degree"
                            value={edu.degree}
                            disabled={!isEditing}
                            onChange={(e) => {
                              const updated = [...profileData.education];
                              updated[index] = { ...edu, degree: e.target.value };
                              setProfileData({ ...profileData, education: updated });
                            }}
                          />
                          <Input
                            label="School"
                            value={edu.school}
                            disabled={!isEditing}
                            onChange={(e) => {
                              const updated = [...profileData.education];
                              updated[index] = { ...edu, school: e.target.value };
                              setProfileData({ ...profileData, education: updated });
                            }}
                          />
                          <Input
                            label="Location"
                            value={edu.location}
                            disabled={!isEditing}
                            onChange={(e) => {
                              const updated = [...profileData.education];
                              updated[index] = { ...edu, location: e.target.value };
                              setProfileData({ ...profileData, education: updated });
                            }}
                          />
                          <Input
                            label="GPA (Optional)"
                            value={edu.gpa || ''}
                            disabled={!isEditing}
                            onChange={(e) => {
                              const updated = [...profileData.education];
                              updated[index] = { ...edu, gpa: e.target.value };
                              setProfileData({ ...profileData, education: updated });
                            }}
                          />
                          <Input
                            label="Start Date"
                            type="month"
                            value={edu.startDate}
                            disabled={!isEditing}
                            onChange={(e) => {
                              const updated = [...profileData.education];
                              updated[index] = { ...edu, startDate: e.target.value };
                              setProfileData({ ...profileData, education: updated });
                            }}
                          />
                          <Input
                            label="End Date"
                            type="month"
                            value={edu.endDate}
                            disabled={!isEditing}
                            onChange={(e) => {
                              const updated = [...profileData.education];
                              updated[index] = { ...edu, endDate: e.target.value };
                              setProfileData({ ...profileData, education: updated });
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'skills' && (
                <div className="space-y-6">
                  <h2 className="text-xl font-semibold text-secondary-900">Skills & Interests</h2>
                  
                  <div>
                    <label className="block text-sm font-medium text-secondary-700 mb-3">
                      Technical Skills
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {profileData.skills.map((skill, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary-100 text-primary-800"
                        >
                          {skill}
                          {isEditing && (
                            <button
                              onClick={() => {
                                const updated = profileData.skills.filter((_, i) => i !== index);
                                setProfileData({ ...profileData, skills: updated });
                              }}
                              className="ml-2 text-primary-600 hover:text-primary-800"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          )}
                        </span>
                      ))}
                      {isEditing && (
                        <button
                          onClick={() => {
                            const newSkill = prompt('Enter a skill:');
                            if (newSkill && newSkill.trim()) {
                              setProfileData({
                                ...profileData,
                                skills: [...profileData.skills, newSkill.trim()]
                              });
                            }
                          }}
                          className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border-2 border-dashed border-primary-300 text-primary-600 hover:border-primary-400 hover:text-primary-700"
                        >
                          <Plus className="h-3 w-3 mr-1" />
                          Add Skill
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;