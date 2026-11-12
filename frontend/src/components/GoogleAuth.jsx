import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginWithGoogle } from '../api/auth';
import { useAuth } from '../context/AuthContext';
import apiClient from '../api/client';

export default function GoogleAuth({ role = 'customer', className = '' }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { loginWithToken } = useAuth();

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError('');

    try {
      // 1. Sign in with Firebase (opens Google popup)
      const { idToken } = await loginWithGoogle();

      // 2. Send Firebase ID token to backend to get our JWT
      const response = await apiClient('/auth/google', {
        method: 'POST',
        body: JSON.stringify({ id_token: idToken, role }),
      });

      // 3. Store our JWT and load user profile
      await loginWithToken(response.access_token);

      // 4. Redirect to dashboard
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Google sign-in failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={className}>
      <button
        type="button"
        onClick={handleGoogleLogin}
        disabled={loading}
        className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200"
        style={{
          background: loading ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.06)',
          border: '1px solid rgba(148,163,184,0.15)',
          color: '#f1f5f9',
          cursor: loading ? 'not-allowed' : 'pointer',
        }}
        onMouseEnter={(e) => {
          if (!loading) {
            e.currentTarget.style.background = 'rgba(255,255,255,0.12)';
            e.currentTarget.style.borderColor = 'rgba(148,163,184,0.25)';
          }
        }}
        onMouseLeave={(e) => {
          if (!loading) {
            e.currentTarget.style.background = 'rgba(255,255,255,0.06)';
            e.currentTarget.style.borderColor = 'rgba(148,163,184,0.15)';
          }
        }}
      >
        {/* Google logo (official colors) */}
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          className="shrink-0"
          aria-hidden="true"
        >
          <path
            fill="#4285F4"
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
          />
          <path
            fill="#34A853"
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          />
          <path
            fill="#FBBC05"
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
          />
          <path
            fill="#EA4335"
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
          />
        </svg>
        <span>{loading ? 'Signing in...' : 'Continue with Google'}</span>
      </button>

      {error && (
        <div className="mt-3 p-3 rounded-xl text-sm text-red-300"
          style={{ background: 'rgba(239,68,68,0.10)', border: '1px solid rgba(239,68,68,0.20)' }}>
        {error}
      </div>
      )}
    </div>
  );
}