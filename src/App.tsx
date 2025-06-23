import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Header from './components/Layout/Header';
import Footer from './components/Layout/Footer';
import ChatWidget from './components/Chat/ChatWidget';
import ToastContainer from './components/UI/ToastContainer';
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Profile from './pages/Profile';
import CareerRecommendations from './pages/CareerRecommendations';
import SkillGapAnalysis from './pages/SkillGapAnalysis';
import ResumeOptimizer from './pages/ResumeOptimizer';
import IndustryTrends from './pages/IndustryTrends';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen flex flex-col">
          <Header />
          <main className="flex-grow">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/career-recommendations" element={<CareerRecommendations />} />
              <Route path="/career-analysis/:careerId" element={<SkillGapAnalysis />} />
              <Route path="/resume-optimizer" element={<ResumeOptimizer />} />
              <Route path="/industry-trends" element={<IndustryTrends />} />
            </Routes>
          </main>
          <Footer />
          <ChatWidget />
          <ToastContainer />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;