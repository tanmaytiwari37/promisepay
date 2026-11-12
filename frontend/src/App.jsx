import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import DashboardLayout from './components/layout/DashboardLayout';
import ErrorBoundary from './components/ui/ErrorBoundary';

// Pages
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import CreateAgreement from './pages/CreateAgreement';
import ProjectDetail from './pages/ProjectDetail';
import SubmitWork from './pages/SubmitWork';
import VerificationReport from './pages/VerificationReport';
import PaymentSuccess from './pages/PaymentSuccess';
import PaymentCancel from './pages/PaymentCancel';

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
        <ErrorBoundary
          fallback={(err, reset) => (
            <div className="min-h-screen bg-primary-bg flex items-center justify-center p-4">
              <div className="max-w-md w-full text-center space-y-4" style={{ background: 'rgba(15,30,50,0.80)', border: '1px solid rgba(148,163,184,0.10)', borderRadius: '20px', padding: '40px' }}>
                <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
                  style={{ background: 'rgba(239,68,68,0.10)', border: '1px solid rgba(239,68,68,0.20)', color: '#f87171' }}>
                  <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <h2 className="text-xl font-black text-primary-text">Application Error</h2>
                <p className="text-secondary-text">Something went wrong. The error has been logged.</p>
                <details className="text-left text-xs font-mono p-4" style={{ background: 'rgba(10,22,40,0.60)', border: '1px solid rgba(148,163,184,0.08)', borderRadius: '10px', color: '#64748b', maxHeight: '200px', overflow: 'auto' }}>
                  <summary className="cursor-pointer mb-2">Error details</summary>
                  <pre className="whitespace-pre-wrap">{err?.message}</pre>
                </details>
                <button onClick={reset} className="px-6 py-2.5 rounded-xl font-bold text-sm transition-all w-full"
                  style={{ background: 'linear-gradient(135deg, #2dd4bf 0%, #22d3ee 100%)', color: '#07111f' }}>
                  Reload App
                </button>
              </div>
            </div>
          )}
        >
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

          {/* PayPal return/cancel routes (no sidebar layout, but require auth) */}
          <Route path="/projects/:projectId/payment/success" element={<RequireAuth><PaymentSuccess /></RequireAuth>} />
          <Route path="/projects/:projectId/payment/cancel" element={<RequireAuth><PaymentCancel /></RequireAuth>} />

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
        </ErrorBoundary>
      </BrowserRouter>
    </AuthProvider>
  );
}
