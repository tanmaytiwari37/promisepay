import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

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
      ? { email: 'client@example.com', password: 'securepassword123' }
      : { email: 'freelancer@demo.com', password: 'demo1234' };
    
    setEmail(creds.email);
    setPassword(creds.password);
    try {
      await authLogin(creds.email, creds.password);
      navigate('/dashboard');
    } catch {
      // Fallback try customer@demo.com
      try {
        const altCreds = role === 'customer'
          ? { email: 'customer@demo.com', password: 'demo1234' }
          : { email: 'freelancer@demo.com', password: 'demo1234' };
        await authLogin(altCreds.email, altCreds.password);
        navigate('/dashboard');
      } catch (innerErr) {
        setError(innerErr.message || 'Demo login failed');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-primary-bg bg-tech-grid flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden font-sans">
      {/* Decorative ambient background glows */}
      <div className="absolute top-1/4 left-1/3 w-96 h-96 bg-mint/10 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/3 w-96 h-96 bg-cyan-accent/10 rounded-full blur-[140px] pointer-events-none"></div>

      <div className="w-full max-w-md relative z-10">
        {/* Header Branding */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-3 mb-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-mint to-cyan-accent flex items-center justify-center text-primary-bg font-extrabold text-base shadow-lg shadow-mint/20 group-hover:scale-105 transition-transform">
              PP
            </div>
            <span className="text-2xl font-bold tracking-tight text-primary-text font-mono">
              PROMISE<span className="text-mint">PAY</span>
            </span>
          </Link>
          <h1 className="text-2xl font-extrabold text-primary-text tracking-tight">Access Your Workspace</h1>
          <p className="text-secondary-text text-sm mt-1">Sign in to manage agreements, audits, and payments</p>
        </div>

        {/* Card */}
        <div className="glass-card rounded-2xl p-8 shadow-2xl border border-border-subtle">
          {error && (
            <div className="mb-5 p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-start gap-2.5">
              <span className="text-base leading-none">⚠️</span>
              <span className="flex-1">{error}</span>
            </div>
          )}

          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-secondary-text uppercase tracking-wider mb-1.5 font-mono">
                Email Address
              </label>
              <input
                type="email"
                required
                placeholder="name@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-surface border border-border-card text-primary-text placeholder-muted-text text-sm focus:outline-none focus:border-mint focus:ring-1 focus:ring-mint transition-all"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5">
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
                className="w-full px-4 py-3 rounded-xl bg-surface border border-border-card text-primary-text placeholder-muted-text text-sm focus:outline-none focus:border-mint focus:ring-1 focus:ring-mint transition-all"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 bg-gradient-to-r from-mint to-cyan-accent hover:opacity-95 text-primary-bg font-extrabold py-3.5 px-4 rounded-xl text-sm transition-all duration-200 shadow-lg shadow-mint/20 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-primary-bg border-t-transparent rounded-full animate-spin"></div>
                  <span>Authenticating...</span>
                </>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-6 text-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border-card"></div>
            </div>
            <span className="relative px-3 bg-card-bg text-xs font-mono uppercase tracking-wider text-muted-text">
              1-Click Demo Sandbox
            </span>
          </div>

          {/* Quick Demo Access Buttons */}
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => executeDemoLogin('customer')}
              disabled={loading}
              className="p-3.5 rounded-xl bg-surface/80 hover:bg-surface border border-border-card text-left transition-all hover:border-mint/50 group"
            >
              <div className="text-xs font-bold text-primary-text group-hover:text-mint flex items-center gap-1.5">
                <span>💼</span> Customer Demo
              </div>
              <div className="text-[11px] text-muted-text mt-0.5 font-mono truncate">client@example.com</div>
            </button>

            <button
              type="button"
              onClick={() => executeDemoLogin('freelancer')}
              disabled={loading}
              className="p-3.5 rounded-xl bg-surface/80 hover:bg-surface border border-border-card text-left transition-all hover:border-mint/50 group"
            >
              <div className="text-xs font-bold text-primary-text group-hover:text-mint flex items-center gap-1.5">
                <span>💻</span> Freelancer Demo
              </div>
              <div className="text-[11px] text-muted-text mt-0.5 font-mono truncate">freelancer@demo.com</div>
            </button>
          </div>

          {/* Register Link */}
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
