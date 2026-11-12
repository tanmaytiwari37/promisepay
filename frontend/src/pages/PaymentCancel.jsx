import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

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
};

export default function PaymentCancel() {
  const { projectId } = useParams();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-primary-bg flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center space-y-4" style={{ background: 'rgba(15,30,50,0.80)', border: '1px solid rgba(148,163,184,0.10)', borderRadius: '20px', padding: '40px' }}>
        <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
          style={{ background: 'rgba(245,158,11,0.10)', border: '1px solid rgba(245,158,11,0.20)' }}>
          <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="#f59e0b">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h2 className="text-xl font-black text-primary-text">Payment Cancelled</h2>
        <p className="text-secondary-text">
          You cancelled the PayPal payment authorization. No payment was processed.
          The project remains in <span className="font-bold" style={{ color: '#f59e0b' }}>AGREED</span> status.
        </p>
        <div className="flex justify-center gap-3 mt-6">
          <button onClick={() => navigate(`/project/${projectId}`)} style={C.btn}>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
            Back to Project
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