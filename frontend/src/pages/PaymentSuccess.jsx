import React, { useEffect, useState } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { createOrder, authorizePayment, fetchProject } from '../api/services';

// Shared style tokens
const C = {
  card: {
    background: 'rgba(15,30,50,0.80)',
    border: '1px solid rgba(148,163,184,0.10)',
    borderRadius: '20px',
    padding: '28px',
  },
  btn: {
    background: 'linear-gradient(135deg, #2dd4bf 0%, #22d3ee 100%)',
    color: '#07111f', fontWeight: '800', padding: '12px 22px', borderRadius: '12px',
    fontSize: '13px', border: 'none', cursor: 'pointer',
    boxShadow: '0 4px 20px rgba(45,212,191,0.22)',
    display: 'inline-flex', alignItems: 'center', gap: '8px', transition: 'all 0.15s',
  },
  btnOutline: {
    background: 'rgba(19,34,54,0.60)', border: '1px solid rgba(148,163,184,0.15)',
    color: '#94a3b8', fontWeight: '700', padding: '11px 22px', borderRadius: '12px',
    fontSize: '13px', cursor: 'pointer',
    display: 'inline-flex', alignItems: 'center', gap: '8px',
  },
  label: { fontSize: '10px', fontWeight: '700', color: '#4e6580', textTransform: 'uppercase', letterSpacing: '0.08em', fontFamily: 'monospace' },
};

export default function PaymentSuccess() {
  const { projectId } = useParams();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [status, setStatus] = useState('loading'); // loading, success, error
  const [message, setMessage] = useState('');
  const [project, setProject] = useState(null);
  const [orderId, setOrderId] = useState(null);

  const token = searchParams.get('token'); // PayPal order ID from return URL

  useEffect(() => {
    const handlePaymentReturn = async () => {
      if (!token) {
        setStatus('error');
        setMessage('No PayPal order token found in return URL. Payment may have been cancelled.');
        return;
      }

      try {
        // Store the order ID for authorization
        setOrderId(token);

        // Try to authorize the payment
        await authorizePayment(projectId);
        setStatus('success');
        setMessage('Payment authorized successfully! The project is now IN PROGRESS.');

        // Reload project to get updated status
        const proj = await fetchProject(projectId);
        setProject(proj);
      } catch (err) {
        setStatus('error');
        setMessage(err.message || 'Failed to authorize payment. Please try again from the project page.');
        console.error('Payment authorization error:', err);
      }
    };

    handlePaymentReturn();
  }, [projectId, token]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-primary-bg flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center space-y-4" style={{ background: 'rgba(15,30,50,0.80)', border: '1px solid rgba(148,163,184,0.10)', borderRadius: '20px', padding: '40px' }}>
          <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
            style={{ background: 'rgba(45,212,191,0.10)', border: '1px solid rgba(45,212,191,0.20)' }}>
            <svg className="w-8 h-8 animate-spin" fill="none" viewBox="0 0 24 24" stroke="#2dd4bf">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </div>
          <h2 className="text-xl font-black text-primary-text">Processing Payment...</h2>
          <p className="text-secondary-text">Completing PayPal authorization. Please wait.</p>
        </div>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="min-h-screen bg-primary-bg flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center space-y-4" style={{ background: 'rgba(15,30,50,0.80)', border: '1px solid rgba(148,163,184,0.10)', borderRadius: '20px', padding: '40px' }}>
          <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
            style={{ background: 'rgba(239,68,68,0.10)', border: '1px solid rgba(239,68,68,0.20)' }}>
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="#f87171">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h2 className="text-xl font-black text-primary-text">Authorization Failed</h2>
          <p className="text-secondary-text">{message}</p>
          <div className="flex justify-center gap-3 mt-4">
            <button onClick={() => navigate(`/project/${projectId}`)} style={C.btn}>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
              Back to Project
            </button>
            <button onClick={() => navigate('/dashboard')} style={C.btnOutline}>
              Go to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Success state
  return (
    <div className="min-h-screen bg-primary-bg flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center space-y-4" style={{ background: 'rgba(15,30,50,0.80)', border: '1px solid rgba(148,163,184,0.10)', borderRadius: '20px', padding: '40px' }}>
        <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
          style={{ background: 'rgba(34,197,94,0.10)', border: '1px solid rgba(34,197,94,0.20)' }}>
          <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="#4ade80">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-xl font-black text-primary-text">Payment Authorized</h2>
        <p className="text-secondary-text">{message}</p>
        {project && (
          <div style={C.card} className="text-left space-y-3">
            <div className="flex items-center justify-between">
              <span style={C.label}>Project</span>
              <span className="font-bold text-primary-text">{project.title}</span>
            </div>
            <div className="flex items-center justify-between">
              <span style={C.label}>Status</span>
              <span className="font-bold" style={{ color: '#4ade80' }}>{project.status}</span>
            </div>
            <div className="flex items-center justify-between">
              <span style={C.label}>Budget</span>
              <span className="font-bold" style={{ color: '#2dd4bf' }}>${Number(project.budget || 0).toLocaleString()} {project.currency || 'USD'}</span>
            </div>
          </div>
        )}
        <div className="flex justify-center gap-3 mt-4">
          <button onClick={() => navigate(`/project/${projectId}`)} style={C.btn}>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>
            View Project
          </button>
          <button onClick={() => navigate('/dashboard')} style={C.btnOutline}>
            Dashboard
          </button>
        </div>
        <p className="text-xs font-mono" style={{ color: '#4e6580' }}>PayPal Sandbox Test Transaction — No Real Money Moved</p>
      </div>
    </div>
  );
}