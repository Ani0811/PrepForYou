import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from '@/components/ui/sonner';
import LandingPage from '@/pages/LandingPage';
import LoginPage from '@/pages/LoginPage';
import SignupPage from '@/pages/SignupPage';
import Dashboard from '@/pages/Dashboard';
import Practice from '@/pages/Practice';
import Blog from '@/pages/Blog';
import BlogPost from '@/pages/BlogPost';
import Notes from '@/pages/Notes';
import StudyPlanner from '@/pages/StudyPlanner';
import QuestionGenerator from '@/pages/QuestionGenerator';
import Profile from '@/pages/Profile';

function App() {
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/practice" element={<Practice />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/blog/:id" element={<BlogPost />} />
          <Route path="/notes" element={<Notes />} />
          <Route path="/study-planner" element={<StudyPlanner />} />
          <Route path="/question-generator" element={<QuestionGenerator />} />
          <Route path="/profile" element={<Profile />} />
        </Routes>
      </BrowserRouter>
      <Toaster />
    </>
  );
}

export default App;
