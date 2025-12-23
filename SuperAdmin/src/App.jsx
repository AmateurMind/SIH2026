import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import axios from 'axios';

// Import components
import Navbar from './components/Navbar';
import LoginPage from './pages/LoginPage';
import MentorDashboard from './pages/mentor/MentorDashboard';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminInternships from './pages/admin/AdminInternships';
import AdminApplications from './pages/admin/AdminApplications';
import AdminAnalytics from './pages/admin/AdminAnalytics';
import RecruiterDashboard from './pages/recruiter/RecruiterDashboard';
import RecruiterStudents from './pages/recruiter/RecruiterStudents';
import RecruiterInternships from './pages/recruiter/RecruiterInternships';
import LoadingScreen from './components/LoadingScreen';

// New Student Directory Components
import StudentDirectory from './pages/admin/StudentDirectory';
import AdminStudentProfile from './pages/admin/StudentProfile';
import AdminStudentResumes from './pages/admin/StudentResumes';
import IPPReviewDashboard from './pages/admin/IPPReviewDashboard';
import FacultyIPPReview from './pages/admin/FacultyIPPReview';
import SendEvaluationRequest from './pages/admin/SendEvaluationRequest';
import SkillAssessment from './pages/admin/SkillAssessment';
import StudentIPPPassport from './pages/admin/StudentIPPPassport';
import CompanyMentorEvaluation from './pages/mentor/CompanyMentorEvaluation';
import EvaluationSuccess from './pages/mentor/EvaluationSuccess';
import PublicIPPView from './pages/PublicIPPView';
import PublicResume from './pages/PublicResume';

// Context for authentication
import { AuthProvider, useAuth } from './context/AuthContext';

// Configure axios defaults
axios.defaults.baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

function App() {
  return (
    <AuthProvider>
      <Router
        future={{
          v7_startTransition: true,
          v7_relativeSplatPath: true,
        }}
      >
        <div className="min-h-screen bg-[hsl(var(--background))]">
          <Toaster
            position="bottom-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#fff',
                color: '#374151',
                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
                border: '1px solid #e5e7eb',
                borderRadius: '0.5rem',
              },
              success: {
                style: {
                  border: '1px solid #10b981',
                },
                iconTheme: {
                  primary: '#10b981',
                  secondary: '#fff',
                },
              },
              error: {
                style: {
                  border: '1px solid #ef4444',
                },
                iconTheme: {
                  primary: '#ef4444',
                  secondary: '#fff',
                },
              },
            }}
          />
          <AppContent />
        </div>
      </Router>
    </AuthProvider>
  );
}

function AppContent() {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <>
      {user && <Navbar />}
      <main className={user ? "pt-16" : ""}>
        <Routes>
          <Route path="/login" element={!user ? <LoginPage /> : <Navigate to={getDashboardRoute(user.role)} />} />

          {/* Mentor Routes - IPP Reviews are here! */}
          <Route
            path="/mentor/dashboard"
            element={<ProtectedRoute role="mentor"><IPPReviewDashboard /></ProtectedRoute>}
          />
          <Route
            path="/mentor/applications"
            element={<ProtectedRoute role="mentor"><MentorDashboard /></ProtectedRoute>}
          />
          <Route
            path="/mentor/ipp/:ippId/review"
            element={<ProtectedRoute role="mentor"><FacultyIPPReview /></ProtectedRoute>}
          />
          <Route
            path="/mentor/ipp/:ippId/send-evaluation"
            element={<ProtectedRoute role="mentor"><SendEvaluationRequest /></ProtectedRoute>}
          />
          <Route
            path="/mentor/evaluate/:ippId"
            element={<CompanyMentorEvaluation />}
          />
          <Route
            path="/mentor/evaluation-success"
            element={<EvaluationSuccess />}
          />

          {/* Admin Routes */}
          <Route
            path="/admin/dashboard"
            element={<ProtectedRoute role="admin"><AdminDashboard /></ProtectedRoute>}
          />
          <Route
            path="/admin/students"
            element={<ProtectedRoute role="admin"><StudentDirectory /></ProtectedRoute>}
          />
          <Route
            path="/admin/students/:id"
            element={<ProtectedRoute role="admin"><AdminStudentProfile /></ProtectedRoute>}
          />
          <Route
            path="/admin/students/:id/resumes"
            element={<ProtectedRoute role="admin"><AdminStudentResumes /></ProtectedRoute>}
          />
          <Route
            path="/admin/internships"
            element={<ProtectedRoute role="admin"><AdminInternships /></ProtectedRoute>}
          />
          <Route
            path="/admin/applications"
            element={<ProtectedRoute role="admin"><AdminApplications /></ProtectedRoute>}
          />
          <Route
            path="/admin/analytics"
            element={<ProtectedRoute role="admin"><AdminAnalytics /></ProtectedRoute>}
          />
          <Route
            path="/admin/ipp"
            element={<ProtectedRoute role="admin"><IPPReviewDashboard /></ProtectedRoute>}
          />
          <Route
            path="/admin/ipp/:ippId/review"
            element={<ProtectedRoute role="admin"><FacultyIPPReview /></ProtectedRoute>}
          />
          <Route
            path="/admin/ipp/:ippId/skills"
            element={<ProtectedRoute role="admin"><SkillAssessment /></ProtectedRoute>}
          />
          <Route
            path="/admin/ipp/:ippId/passport"
            element={<ProtectedRoute role="admin"><StudentIPPPassport /></ProtectedRoute>}
          />
          <Route
            path="/admin/students/:studentId/passport"
            element={<ProtectedRoute role="admin"><StudentIPPPassport /></ProtectedRoute>}
          />

          {/* Recruiter Routes */}
          <Route
            path="/recruiter/dashboard"
            element={<ProtectedRoute role="recruiter"><RecruiterDashboard /></ProtectedRoute>}
          />
          <Route
            path="/recruiter/students"
            element={<ProtectedRoute role="recruiter"><StudentDirectory /></ProtectedRoute>}
          />
          <Route
            path="/recruiter/students/:id"
            element={<ProtectedRoute role="recruiter"><AdminStudentProfile /></ProtectedRoute>}
          />
          <Route
            path="/recruiter/students/:id/resumes"
            element={<ProtectedRoute role="recruiter"><AdminStudentResumes /></ProtectedRoute>}
          />
          <Route
            path="/recruiter/internships"
            element={<ProtectedRoute role="recruiter"><RecruiterInternships /></ProtectedRoute>}
          />
          <Route
            path="/recruiter/ipp"
            element={<ProtectedRoute role="recruiter"><IPPReviewDashboard /></ProtectedRoute>}
          />
          <Route
            path="/recruiter/ipp/:ippId/passport"
            element={<ProtectedRoute role="recruiter"><StudentIPPPassport /></ProtectedRoute>}
          />
          <Route
            path="/recruiter/students/:studentId/passport"
            element={<ProtectedRoute role="recruiter"><StudentIPPPassport /></ProtectedRoute>}
          />

          {/* Public Routes */}
          <Route path="/resume/view/:resumeId" element={<PublicResume />} />
          <Route path="/ipp/view/:ippId" element={<PublicIPPView />} />

          {/* Default redirects */}
          <Route
            path="/"
            element={
              user ?
                <Navigate to={getDashboardRoute(user.role)} /> :
                <Navigate to="/login" />
            }
          />

          {/* 404 fallback */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </main>
    </>
  );
}

function ProtectedRoute({ children, role }) {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" />;
  }

  if (role && user.role !== role) {
    return <Navigate to={getDashboardRoute(user.role)} />;
  }

  return children;
}

function getDashboardRoute(role) {
  const routes = {
    mentor: '/mentor/dashboard',
    admin: '/admin/dashboard',
    recruiter: '/recruiter/dashboard'
  };
  return routes[role] || '/login';
}

export default App;