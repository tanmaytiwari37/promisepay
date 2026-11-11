import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import DashboardLayout from './components/layout/DashboardLayout';

// Pages
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import CreateAgreement from './pages/CreateAgreement';
import ProjectDetail from './pages/ProjectDetail';
import SubmitWork from './pages/SubmitWork';
import VerificationReport from './pages/VerificationReport';

function RequireAuth({ children }) {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className="min-h-screen bg-primary-bg flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-emerald border-t-transparent rounded-full animate-spin"></div>
          <span className="text-secondary-text text-sm">Loading...</span>
        </div>
      </div>
    );
  }
  return user ? children : <Navigate to="/login" replace />;
}

function RedirectIfAuth({ children }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  return user ? <Navigate to="/dashboard" replace /> : children;
}

function AppLayout({ children }) {
  return <DashboardLayout>{children}</DashboardLayout>;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<RedirectIfAuth><Landing /></RedirectIfAuth>} />
          <Route path="/login" element={<RedirectIfAuth><Login /></RedirectIfAuth>} />
          <Route path="/register" element={<RedirectIfAuth><Register /></RedirectIfAuth>} />

          {/* Protected routes with sidebar layout */}
          <Route path="/dashboard" element={<RequireAuth><AppLayout><Dashboard /></AppLayout></RequireAuth>} />
          <Route path="/create-agreement" element={<RequireAuth><AppLayout><CreateAgreement /></AppLayout></RequireAuth>} />
          <Route path="/projects" element={<RequireAuth><AppLayout><Dashboard /></AppLayout></RequireAuth>} />
          <Route path="/project/:projectId" element={<RequireAuth><AppLayout><ProjectDetail /></AppLayout></RequireAuth>} />
          <Route path="/project/:projectId/submit" element={<RequireAuth><AppLayout><SubmitWork /></AppLayout></RequireAuth>} />
          <Route path="/project/:projectId/verify" element={<RequireAuth><AppLayout><VerificationReport /></AppLayout></RequireAuth>} />
          <Route path="/reports" element={<RequireAuth><AppLayout><Dashboard /></AppLayout></RequireAuth>} />

          {/* Legacy routes — redirect */}
          <Route path="/agreement-review" element={<Navigate to="/dashboard" replace />} />
          <Route path="/agreement-review/:projectId" element={<Navigate to="/project/:projectId" replace />} />
          <Route path="/submit-work" element={<Navigate to="/dashboard" replace />} />
          <Route path="/submit-work/:projectId" element={<Navigate to="/project/:projectId/submit" replace />} />
          <Route path="/verification-report" element={<Navigate to="/dashboard" replace />} />
          <Route path="/verification-report/:projectId" element={<Navigate to="/project/:projectId/verify" replace />} />

          {/* Catch all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
