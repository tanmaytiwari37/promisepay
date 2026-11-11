import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('customer');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { register: authRegister } = useAuth();

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    if (!name || !email || !password) {
      setError('Please fill in all fields.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await authRegister(name, email, password, role);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.');
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
          <h1 className="text-2xl font-extrabold text-primary-text tracking-tight">Create an Account</h1>
          <p className="text-secondary-text text-sm mt-1">Start agreeing and transacting with complete trust</p>
        </div>

        {/* Card */}
        <div className="glass-card rounded-2xl p-8 shadow-2xl border border-border-subtle">
          {error && (
            <div className="mb-5 p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-start gap-2.5">
              <span className="text-base leading-none">⚠️</span>
              <span className="flex-1">{error}</span>
            </div>
          )}

          <form onSubmit={handleRegisterSubmit} className="space-y-4">
            {/* Role Selection */}
            <div>
              <label className="block text-xs font-semibold text-secondary-text uppercase tracking-wider mb-2 font-mono">
                Select Your Role
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setRole('customer')}
                  className={`p-3.5 rounded-xl border text-left transition-all ${
                    role === 'customer'
                      ? 'border-mint bg-mint/10 text-mint'
                      : 'border-border-card bg-surface/60 text-secondary-text hover:text-primary-text'
                  }`}
                >
                  <div className="text-lg mb-1">💼</div>
                  <div className="text-xs font-bold">Customer</div>
                  <div className="text-[11px] text-muted-text mt-0.5">Fund & review deliverables</div>
                </button>

                <button
                  type="button"
                  onClick={() => setRole('freelancer')}
                  className={`p-3.5 rounded-xl border text-left transition-all ${
                    role === 'freelancer'
                      ? 'border-mint bg-mint/10 text-mint'
                      : 'border-border-card bg-surface/60 text-secondary-text hover:text-primary-text'
                  }`}
                >
                  <div className="text-lg mb-1">💻</div>
                  <div className="text-xs font-bold">Freelancer</div>
                  <div className="text-[11px] text-muted-text mt-0.5">Submit work & get paid</div>
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-secondary-text uppercase tracking-wider mb-1.5 font-mono">
                Full Name
              </label>
              <input
                type="text"
                required
                placeholder="Alex Morgan"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-surface border border-border-card text-primary-text placeholder-muted-text text-sm focus:outline-none focus:border-mint focus:ring-1 focus:ring-mint transition-all"
              />
            </div>

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
              <label className="block text-xs font-semibold text-secondary-text uppercase tracking-wider mb-1.5 font-mono">
                Password
              </label>
              <input
                type="password"
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
                  <span>Creating Account...</span>
                </>
              ) : (
                'Create Account'
              )}
            </button>
          </form>

          {/* Login Link */}
          <p className="mt-6 text-center text-xs text-secondary-text">
            Already have an account?{' '}
            <Link to="/login" className="text-mint hover:underline font-semibold">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
