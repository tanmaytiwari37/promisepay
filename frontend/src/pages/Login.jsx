import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import GoogleAuth from '../components/GoogleAuth';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login: authLogin } = useAuth();

  const handleLoginSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!email || !password) {
      setError('Please provide both email and password.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await authLogin(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const executeDemoLogin = async (role) => {
    setLoading(true);
    setError('');
    const creds = role === 'customer'
      ? { email: 'customer@demo.com', password: 'demo1234' }
      : { email: 'freelancer@demo.com', password: 'demo1234' };
    setEmail(creds.email);
    setPassword(creds.password);
    try {
      await authLogin(creds.email, creds.password);
      navigate('/dashboard');
    } catch (innerErr) {
      setError(innerErr.message || 'Demo login failed — ensure the backend is running.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen bg-tech-grid flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden"
      style={{ backgroundColor: '#07111f' }}
    >
      {/* Ambient glows */}
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] rounded-full blur-[150px] pointer-events-none" style={{ background: 'rgba(45,212,191,0.07)' }} />
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] rounded-full blur-[130px] pointer-events-none" style={{ background: 'rgba(34,211,238,0.06)' }} />

      <div className="w-full max-w-md relative z-10">
        {/* Branding */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-3 mb-4 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-mint to-cyan-accent flex items-center justify-center text-primary-bg font-black text-sm shadow-lg shadow-mint/20 group-hover:scale-105 transition-transform">
              PP
            </div>
            <span className="text-2xl font-black tracking-tight text-primary-text font-mono">
              PROMISE<span className="text-mint">PAY</span>
            </span>
          </Link>
          <h1 className="text-2xl font-black text-primary-text tracking-tight">Access Your Workspace</h1>
          <p className="text-secondary-text text-sm mt-1.5">Sign in to manage agreements, audits, and payments</p>
        </div>

        {/* Card */}
        <div className="glass-card rounded-2xl p-8 shadow-2xl shadow-black/60">
          {error && (
            <div className="mb-5 p-4 rounded-xl flex items-start gap-3 text-sm"
              style={{ background: 'rgba(239,68,68,0.10)', border: '1px solid rgba(239,68,68,0.20)', color: '#f87171' }}>
              <span className="text-base leading-none shrink-0">⚠</span>
              <span className="flex-1">{error}</span>
            </div>
          )}

          <form onSubmit={handleLoginSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label className="block text-xs font-semibold text-secondary-text uppercase tracking-wider mb-2 font-mono">
                Email Address
              </label>
              <input
                type="email"
                required
                placeholder="name@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-xl text-sm transition-all"
                style={{
                  background: 'rgba(19,34,54,0.8)',
                  border: '1px solid rgba(148,163,184,0.15)',
                  color: '#f1f5f9',
                  outline: 'none',
                }}
                onFocus={(e) => { e.target.style.borderColor = 'rgba(45,212,191,0.5)'; e.target.style.boxShadow = '0 0 0 3px rgba(45,212,191,0.08)'; }}
                onBlur={(e) => { e.target.style.borderColor = 'rgba(148,163,184,0.15)'; e.target.style.boxShadow = 'none'; }}
              />
            </div>

            {/* Password */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-xs font-semibold text-secondary-text uppercase tracking-wider font-mono">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-xs text-muted-text hover:text-mint transition-colors"
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-xl text-sm transition-all"
                style={{
                  background: 'rgba(19,34,54,0.8)',
                  border: '1px solid rgba(148,163,184,0.15)',
                  color: '#f1f5f9',
                  outline: 'none',
                }}
                onFocus={(e) => { e.target.style.borderColor = 'rgba(45,212,191,0.5)'; e.target.style.boxShadow = '0 0 0 3px rgba(45,212,191,0.08)'; }}
                onBlur={(e) => { e.target.style.borderColor = 'rgba(148,163,184,0.15)'; e.target.style.boxShadow = 'none'; }}
              />
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3.5 px-4 rounded-xl font-black text-sm transition-all duration-200 flex items-center justify-center gap-2"
              style={{
                background: loading ? 'rgba(45,212,191,0.5)' : 'linear-gradient(135deg, #2dd4bf 0%, #22d3ee 100%)',
                color: '#07111f',
                boxShadow: '0 8px 32px -6px rgba(45,212,191,0.30)',
                cursor: loading ? 'not-allowed' : 'pointer',
              }}
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  <span>Authenticating...</span>
                </>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          {/* Google Sign In */}
          <div className="my-6">
            <div className="relative mb-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t" style={{ borderColor: 'rgba(148,163,184,0.12)' }} />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-primary-bg/80 text-muted-text" style={{ backgroundColor: '#07111f' }}>Or continue with</span>
              </div>
            </div>
            <GoogleAuth role="customer" />
          </div>

          {/* Divider */}
          <div className="relative my-6 flex items-center">
            <div className="flex-1 border-t" style={{ borderColor: 'rgba(148,163,184,0.12)' }} />
            <span className="px-4 text-xs font-mono uppercase tracking-wider text-muted-text" style={{ background: 'transparent' }}>
              1-Click Demo Sandbox
            </span>
            <div className="flex-1 border-t" style={{ borderColor: 'rgba(148,163,184,0.12)' }} />
          </div>

          {/* Demo buttons */}
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => executeDemoLogin('customer')}
              disabled={loading}
              className="p-4 rounded-xl text-left transition-all group"
              style={{ background: 'rgba(19,34,54,0.60)', border: '1px solid rgba(148,163,184,0.12)' }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'rgba(45,212,191,0.35)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'rgba(148,163,184,0.12)'; }}
            >
              <div className="text-xs font-bold text-primary-text flex items-center gap-1.5 mb-0.5">
                <span>💼</span> Customer Demo (Riya Sharma)
              </div>
              <div className="text-[11px] text-muted-text font-mono truncate">customer@demo.com</div>
            </button>

            <button
              type="button"
              onClick={() => executeDemoLogin('freelancer')}
              disabled={loading}
              className="p-4 rounded-xl text-left transition-all group"
              style={{ background: 'rgba(19,34,54,0.60)', border: '1px solid rgba(148,163,184,0.12)' }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'rgba(45,212,191,0.35)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'rgba(148,163,184,0.12)'; }}
            >
              <div className="text-xs font-bold text-primary-text flex items-center gap-1.5 mb-0.5">
                <span>💻</span> Freelancer Demo (Arjun Mehta)
              </div>
              <div className="text-[11px] text-muted-text font-mono truncate">freelancer@demo.com</div>
            </button>
          </div>

          <p className="mt-6 text-center text-xs text-secondary-text">
            Need an account?{' '}
            <Link to="/register" className="text-mint hover:underline font-semibold">
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
