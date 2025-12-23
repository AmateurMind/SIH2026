import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { ClerkProvider } from '@clerk/clerk-react';
import axios from 'axios';

// Components
import Navbar from './components/Navbar';
import LoadingScreen from './components/LoadingScreen';

// Pages - Auth & Default
import LoginPage from './pages/LoginPage';
import LandingPage from './pages/LandingPage';
import SessionConflictPage from './pages/SessionConflictPage';

// Pages - Student
import StudentDashboard from './pages/student/StudentDashboard';
import StudentProfile from './pages/student/StudentProfile';
import StudentInternships from './pages/student/StudentInternships';
import StudentApplications from './pages/student/StudentApplications';
import ResumeBuilder from './pages/student/ResumeBuilder';
import ResumeDashboard from './pages/student/Dashboard';
import PublicResume from './pages/PublicResume';
import StudentCalendar from './pages/student/StudentCalendar';
import StudentIPPDashboard from './pages/student/StudentIPPDashboard';
import IPPDetail from './pages/student/IPPDetail';
import IPPSubmission from './pages/student/IPPSubmission';
import CareerPage from './pages/student/CareerPage';
import JobsPage from './pages/student/JobsPage';

// Pages - AI Interview
import { Dashboard as AIMockDashboard } from './pages/student/ai-interview/dashboard';
import { CreateEditPage } from './pages/student/ai-interview/create-edit-page';
import { MockInterviewPage } from './pages/student/ai-interview/mock-interview-page';
import { MockLoadPage } from './pages/student/ai-interview/mock-load-page';
import { FeedbackPage } from './pages/student/ai-interview/feedback';

// Pages - Admin
import StudentDirectory from './pages/admin/StudentDirectory';
import AdminStudentProfile from './pages/admin/StudentProfile';
import AdminStudentResumes from './pages/admin/StudentResumes';
import StudentIPPs from './pages/admin/StudentIPPs';
import AdminApplications from './pages/admin/AdminApplications';
import AdminLoginPage from './pages/admin/AdminLoginPage';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminInternships from './pages/admin/AdminInternships';
import AdminCalendar from './pages/admin/AdminCalendar';

// Pages - Recruiter
import RecruiterLoginPage from './pages/recruiter/RecruiterLoginPage';
import RecruiterDashboard from './pages/recruiter/RecruiterDashboard';
import RecruiterInternships from './pages/recruiter/RecruiterInternships';
import RecruiterApplications from './pages/recruiter/RecruiterApplications';

// Pages - Mentor
import MentorLoginPage from './pages/mentor/MentorLoginPage';
import MentorDashboard from './pages/mentor/MentorDashboard';
import CompanyMentorEvaluation from './pages/mentor/CompanyMentorEvaluation';
import EvaluationSuccess from './pages/mentor/EvaluationSuccess';

// Context
import { AuthProvider, useAuth } from './context/AuthContext';

// Clerk publishable key
const CLERK_PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

// Configure axios defaults
axios.defaults.baseURL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:5000/api';

// --- PORT CONFIGURATION ---
import { APPS } from './config/apps';
const getBaseUrl = () => window.location.origin;



// Helper to determine current app mode
const getCurrentAppMode = () => {
  const port = window.location.port;
  const path = window.location.pathname;

  // Development: Port-based strict mode
  if (import.meta.env.DEV) {
    if (port === '5174') return 'admin';
    if (port === '5175') return 'recruiter';
    if (port === '5176') return 'mentor';
    if (port === '5173') return 'student';
  }

  // Production: Path-based detection
  if (path.startsWith('/admin')) return 'admin';
  if (path.startsWith('/recruiter')) return 'recruiter';
  if (path.startsWith('/mentor')) return 'mentor';

  return 'student'; // Default to student
};

function App() {
  return (
    <ClerkProvider publishableKey={CLERK_PUBLISHABLE_KEY}>
      <AuthProvider>
        <Router
          future={{
            v7_startTransition: true,
            v7_relativeSplatPath: true,
          }}
        >
          <div className="min-h-screen bg-secondary-50">
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
    </ClerkProvider>
  );
}

// Custom Root Route Component
const HomeRoute = () => {
  const mode = getCurrentAppMode();
  const { user } = useAuth();

  // If on Student Port, show Landing Page
  if (mode === 'student') {
    return <LandingPage />;
  }

  // If on other ports
  if (user) {
    // If logged in, let RoleRedirect send them to the right place
    return <RoleRedirect role={user.role} />;
  }

  // If not logged in on Non-Student port, go to Login
  return <Navigate to="/login" replace />;
};

function AppContent() {
  const { user, loading } = useAuth();
  const [minLoading, setMinLoading] = useState(true);
  const currentAppMode = getCurrentAppMode();
  const location = useLocation();

  useEffect(() => {
    const timer = setTimeout(() => {
      setMinLoading(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  console.log('AppContent: rendering', { user: !!user, loading, minLoading, appMode: currentAppMode });

  if (loading || minLoading) {
    return <LoadingScreen />;
  }

  const isLandingPage = location.pathname === '/' && currentAppMode === 'student';
  const isPublicMentorPage = location.pathname.startsWith('/mentor/evaluate') || location.pathname.startsWith('/mentor/evaluation-success');

  return (
    <>
      {/* Show Navbar only if logged in AND we are not on Landing Page AND not on Public Mentor Pages */}
      {user && !isLandingPage && !isPublicMentorPage && <Navbar />}

      <main className={user && !isLandingPage && !isPublicMentorPage ? "pt-16 pb-20 md:pb-0" : ""}>
        <Routes>
          <Route path="/" element={<HomeRoute />} />

          {/* Explicit Login Routes for Production/Single-Domain */}
          <Route path="/admin/login" element={!user ? <AdminLoginPage /> : <SessionConflictPage targetRole="admin" />} />
          <Route path="/recruiter/login" element={!user ? <RecruiterLoginPage /> : <SessionConflictPage targetRole="recruiter" />} />
          <Route path="/mentor/login" element={!user ? <MentorLoginPage /> : <SessionConflictPage targetRole="mentor" />} />
          <Route path="/student/login" element={!user ? <LoginPage /> : <SessionConflictPage targetRole="student" />} />

          {/* Default Login Route */}
          <Route
            path="/login"
            element={
              !user ? (
                currentAppMode === 'recruiter' ? <RecruiterLoginPage /> :
                  currentAppMode === 'mentor' ? <MentorLoginPage /> :
                    currentAppMode === 'admin' ? <AdminLoginPage /> :
                      <LoginPage />
              ) : (
                <RoleRedirect role={user.role} />
              )
            }
          />

          {/* --- STUDENT ROUTES --- */}
          {(currentAppMode === 'student' || !import.meta.env.DEV) && (
            <>
              <Route path="/student/dashboard" element={<ProtectedRoute role="student"><StudentDashboard /></ProtectedRoute>} />
              <Route path="/student/profile" element={<ProtectedRoute role="student"><StudentProfile /></ProtectedRoute>} />
              <Route path="/student/internships" element={<ProtectedRoute role="student"><StudentInternships /></ProtectedRoute>} />
              <Route path="/student/applications" element={<ProtectedRoute role="student"><StudentApplications /></ProtectedRoute>} />
              <Route path="/student/resume-builder" element={<ProtectedRoute role="student"><ResumeBuilder /></ProtectedRoute>} />
              <Route path="/student/resumes" element={<ProtectedRoute role="student"><ResumeDashboard /></ProtectedRoute>} />
              <Route path="/student/resume/create" element={<ProtectedRoute role="student"><ResumeBuilder /></ProtectedRoute>} />
              <Route path="/student/resume/edit/:resumeId" element={<ProtectedRoute role="student"><ResumeBuilder /></ProtectedRoute>} />
              <Route path="/resume/view/:resumeId" element={<PublicResume />} />
              <Route path="/student/calendar" element={<ProtectedRoute role="student"><StudentCalendar /></ProtectedRoute>} />
              <Route path="/student/internship-passports" element={<ProtectedRoute role="student"><StudentIPPDashboard /></ProtectedRoute>} />
              <Route path="/student/ipp/:ippId" element={<ProtectedRoute role="student"><IPPDetail /></ProtectedRoute>} />
              <Route path="/student/ipp/:ippId/submit" element={<ProtectedRoute role="student"><IPPSubmission /></ProtectedRoute>} />
              <Route path="/student/career" element={<ProtectedRoute role="student"><CareerPage /></ProtectedRoute>} />
              <Route path="/student/jobs" element={<ProtectedRoute role="student"><JobsPage /></ProtectedRoute>} />

              {/* AI Interview Routes */}
              <Route path="/ai-interview" element={<ProtectedRoute role="student"><AIMockDashboard /></ProtectedRoute>} />
              <Route path="/ai-interview/create" element={<ProtectedRoute role="student"><CreateEditPage /></ProtectedRoute>} />
              <Route path="/ai-interview/edit/:interviewId" element={<ProtectedRoute role="student"><CreateEditPage /></ProtectedRoute>} />
              <Route path="/ai-interview/interview/:interviewId" element={<ProtectedRoute role="student"><MockLoadPage /></ProtectedRoute>} />
              <Route path="/ai-interview/start/:interviewId" element={<ProtectedRoute role="student"><MockInterviewPage /></ProtectedRoute>} />
              <Route path="/ai-interview/feedback/:interviewId" element={<ProtectedRoute role="student"><FeedbackPage /></ProtectedRoute>} />
            </>
          )}

          {/* --- MENTOR ROUTES --- */}
          {(currentAppMode === 'mentor' || !import.meta.env.DEV) && (
            <>
              <Route path="/mentor/dashboard" element={<ProtectedRoute role="mentor"><MentorDashboard /></ProtectedRoute>} />
              <Route path="/mentor/students" element={<ProtectedRoute role="mentor"><StudentDirectory /></ProtectedRoute>} />
              <Route path="/mentor/students/:id" element={<ProtectedRoute role="mentor"><AdminStudentProfile /></ProtectedRoute>} />
              <Route path="/mentor/students/:id/resumes" element={<ProtectedRoute role="mentor"><AdminStudentResumes /></ProtectedRoute>} />
              <Route path="/mentor/students/:id/ipps" element={<ProtectedRoute role="mentor"><StudentIPPs /></ProtectedRoute>} />
              <Route path="/mentor/ipp/:ippId" element={<ProtectedRoute role="mentor"><IPPDetail /></ProtectedRoute>} />
              <Route path="/mentor/calendar" element={<ProtectedRoute role="mentor"><AdminCalendar /></ProtectedRoute>} />
            </>
          )}

          {/* Public Mentor Routes (Available on all ports) */}
          <>
            <Route path="/mentor/evaluate/:ippId" element={<CompanyMentorEvaluation />} />
            <Route path="/mentor/evaluation-success" element={<EvaluationSuccess />} />
          </>

          {/* --- ADMIN ROUTES --- */}
          {(currentAppMode === 'admin' || !import.meta.env.DEV) && (
            <>
              <Route path="/admin/dashboard" element={<ProtectedRoute role="admin"><AdminDashboard /></ProtectedRoute>} />
              <Route path="/admin/students" element={<ProtectedRoute role="admin"><StudentDirectory /></ProtectedRoute>} />
              <Route path="/admin/students/:id" element={<ProtectedRoute role="admin"><AdminStudentProfile /></ProtectedRoute>} />
              <Route path="/admin/applications" element={<ProtectedRoute role="admin"><AdminApplications /></ProtectedRoute>} />
              <Route path="/admin/students/:id/resumes" element={<ProtectedRoute role="admin"><AdminStudentResumes /></ProtectedRoute>} />
              <Route path="/admin/students/:id/ipps" element={<ProtectedRoute role="admin"><StudentIPPs /></ProtectedRoute>} />
              <Route path="/admin/ipp/:ippId" element={<ProtectedRoute role="admin"><IPPDetail /></ProtectedRoute>} />
              <Route path="/admin/internships" element={<ProtectedRoute role="admin"><AdminInternships /></ProtectedRoute>} />
              <Route path="/admin/calendar" element={<ProtectedRoute role="admin"><AdminCalendar /></ProtectedRoute>} />
            </>
          )}

          {/* --- RECRUITER ROUTES --- */}
          {(currentAppMode === 'recruiter' || !import.meta.env.DEV) && (
            <>
              <Route path="/recruiter/dashboard" element={<ProtectedRoute role="recruiter"><RecruiterDashboard /></ProtectedRoute>} />
              <Route path="/recruiter/internships" element={<ProtectedRoute role="recruiter"><RecruiterInternships /></ProtectedRoute>} />
              <Route path="/recruiter/applications" element={<ProtectedRoute role="recruiter"><RecruiterApplications /></ProtectedRoute>} />
              <Route path="/recruiter/students" element={<ProtectedRoute role="recruiter"><StudentDirectory /></ProtectedRoute>} />
              <Route path="/recruiter/students/:id" element={<ProtectedRoute role="recruiter"><AdminStudentProfile /></ProtectedRoute>} />
              <Route path="/recruiter/students/:id/resumes" element={<ProtectedRoute role="recruiter"><AdminStudentResumes /></ProtectedRoute>} />
              <Route path="/recruiter/students/:id/ipps" element={<ProtectedRoute role="recruiter"><StudentIPPs /></ProtectedRoute>} />
              <Route path="/recruiter/ipp/:ippId" element={<ProtectedRoute role="recruiter"><IPPDetail /></ProtectedRoute>} />
            </>
          )}

          {/* 404 fallback */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </main>
    </>
  );
}

// Handles Cross-Port Redirection
function RoleRedirect({ role }) {
  const targetUrl = getDashboardUrl(role);

  useEffect(() => {
    if (targetUrl) {
      if (import.meta.env.DEV) {
        // Dev: Port based redirection
        try {
          const target = new URL(targetUrl);
          if (window.location.port !== target.port) {
            window.location.href = targetUrl;
          }
        } catch (e) {
          console.error("Invalid target URL", targetUrl);
        }
      }
      // Prod: Internal navigation is handled by Navigate below
    }
  }, [targetUrl]);

  // Extract path for internal navigation
  let targetPath = '/';
  try {
    targetPath = new URL(targetUrl).pathname;
    // If targetUrl is relative or same origin
  } catch (e) {
    if (targetUrl.startsWith('/')) targetPath = targetUrl;
  }

  return <Navigate to={targetPath} replace />;
}

function ProtectedRoute({ children, role }) {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" />;
  }

  // In DEV, enforce port check
  if (import.meta.env.DEV) {
    const correctUrl = getDashboardUrl(user.role);
    try {
      const targetPort = new URL(correctUrl).port;
      if (window.location.port !== targetPort) {
        return <RoleRedirect role={user.role} />;
      }
    } catch (e) { }
  }

  if (role && user.role !== role) {
    return <RoleRedirect role={user.role} />;
  }

  return children;
}

function getDashboardUrl(role) {
  const r = (role || 'student').toLowerCase();
  switch (r) {
    case 'admin': return `${APPS.ADMIN.url}/admin/dashboard`;
    case 'recruiter': return `${APPS.RECRUITER.url}/recruiter/dashboard`;
    case 'mentor': return `${APPS.MENTOR.url}/mentor/dashboard`;
    default: return `${APPS.STUDENT.url}/student/dashboard`;
  }
}

export default App;
