import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const inputStyle = {
  background: 'rgba(19,34,54,0.8)',
  border: '1px solid rgba(148,163,184,0.15)',
  color: '#f1f5f9',
  outline: 'none',
  width: '100%',
  padding: '12px 16px',
  borderRadius: '12px',
  fontSize: '14px',
  transition: 'all 0.15s ease',
};

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('customer');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { register: authRegister } = useAuth();

  const handleFocus = (e) => {
    e.target.style.borderColor = 'rgba(45,212,191,0.5)';
    e.target.style.boxShadow = '0 0 0 3px rgba(45,212,191,0.08)';
  };
  const handleBlur = (e) => {
    e.target.style.borderColor = 'rgba(148,163,184,0.15)';
    e.target.style.boxShadow = 'none';
  };

  const handleSubmit = async (e) => {
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
    <div
      className="min-h-screen bg-tech-grid flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden"
      style={{ backgroundColor: '#07111f' }}
    >
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
          <h1 className="text-2xl font-black text-primary-text tracking-tight">Create an Account</h1>
          <p className="text-secondary-text text-sm mt-1.5">Start agreeing and transacting with complete trust</p>
        </div>

        {/* Card */}
        <div className="glass-card rounded-2xl p-8 shadow-2xl shadow-black/60">
          {error && (
            <div className="mb-5 p-4 rounded-xl flex items-start gap-3 text-sm"
              style={{ background: 'rgba(239,68,68,0.10)', border: '1px solid rgba(239,68,68,0.20)', color: '#f87171' }}>
              <span className="shrink-0">⚠</span>
              <span className="flex-1">{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Role selector */}
            <div>
              <label className="block text-xs font-semibold text-secondary-text uppercase tracking-wider mb-2 font-mono">
                Select Your Role
              </label>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { value: 'customer', icon: '💼', label: 'Customer', sub: 'Fund & review deliverables' },
                  { value: 'freelancer', icon: '💻', label: 'Freelancer', sub: 'Submit work & get paid' },
                ].map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setRole(opt.value)}
                    className="p-4 rounded-xl text-left transition-all"
                    style={{
                      border: role === opt.value ? '1px solid rgba(45,212,191,0.5)' : '1px solid rgba(148,163,184,0.12)',
                      background: role === opt.value ? 'rgba(45,212,191,0.08)' : 'rgba(19,34,54,0.60)',
                    }}
                  >
                    <div className="text-xl mb-1.5">{opt.icon}</div>
                    <div className="text-xs font-bold" style={{ color: role === opt.value ? '#2dd4bf' : '#f1f5f9' }}>{opt.label}</div>
                    <div className="text-[11px] text-muted-text mt-0.5">{opt.sub}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Full Name */}
            <div>
              <label className="block text-xs font-semibold text-secondary-text uppercase tracking-wider mb-2 font-mono">Full Name</label>
              <input
                type="text" required placeholder="Alex Morgan"
                value={name} onChange={(e) => setName(e.target.value)}
                style={inputStyle} onFocus={handleFocus} onBlur={handleBlur}
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-semibold text-secondary-text uppercase tracking-wider mb-2 font-mono">Email Address</label>
              <input
                type="email" required placeholder="name@company.com"
                value={email} onChange={(e) => setEmail(e.target.value)}
                style={inputStyle} onFocus={handleFocus} onBlur={handleBlur}
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-semibold text-secondary-text uppercase tracking-wider mb-2 font-mono">Password</label>
              <input
                type="password" required placeholder="••••••••"
                value={password} onChange={(e) => setPassword(e.target.value)}
                style={inputStyle} onFocus={handleFocus} onBlur={handleBlur}
              />
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl font-black text-sm flex items-center justify-center gap-2 transition-all"
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
                  <span>Creating Account...</span>
                </>
              ) : 'Create Account'}
            </button>
          </form>

          <p className="mt-6 text-center text-xs text-secondary-text">
            Already have an account?{' '}
            <Link to="/login" className="text-mint hover:underline font-semibold">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
