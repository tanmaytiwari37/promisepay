import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function TopBar() {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <header
      className="h-[68px] flex items-center justify-between px-6 shrink-0"
      style={{
        background: 'rgba(10,22,40,0.70)',
        backdropFilter: 'blur(16px)',
        borderBottom: '1px solid rgba(148,163,184,0.08)',
      }}
    >
      {/* Search */}
      <div
        className="flex items-center gap-3 px-4 py-2.5 rounded-xl w-96 max-w-full transition-all"
        style={{ background: 'rgba(19,34,54,0.70)', border: '1px solid rgba(148,163,184,0.10)' }}
        onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'rgba(45,212,191,0.25)'; }}
        onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'rgba(148,163,184,0.10)'; }}
      >
        <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ color: '#4e6580' }}>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          type="text"
          placeholder="Search agreements, criteria, or transactions..."
          className="text-xs w-full"
          style={{ background: 'transparent', border: 'none', outline: 'none', color: '#f1f5f9' }}
        />
      </div>

      {/* Right */}
      <div className="flex items-center gap-4">
        {user?.role === 'customer' && (
          <button
            onClick={() => navigate('/create-agreement')}
            className="flex items-center gap-2 text-xs font-bold px-4 py-2.5 rounded-full transition-all"
            style={{
              background: 'linear-gradient(135deg, #2dd4bf 0%, #22d3ee 100%)',
              color: '#07111f',
              boxShadow: '0 4px 20px rgba(45,212,191,0.22)',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.opacity = '0.90'; e.currentTarget.style.transform = 'scale(1.03)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.transform = 'scale(1)'; }}
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" />
            </svg>
            New Agreement
          </button>
        )}

        <div
          className="flex items-center gap-2.5 pl-4"
          style={{ borderLeft: '1px solid rgba(148,163,184,0.10)' }}
        >
          <div
            className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-black font-mono"
            style={{
              background: 'rgba(45,212,191,0.12)',
              color: '#2dd4bf',
              border: '1px solid rgba(45,212,191,0.22)',
            }}
          >
            {(user?.full_name?.[0] || user?.name?.[0] || user?.email?.[0] || 'U').toUpperCase()}
          </div>
          <div className="hidden sm:block">
            <div className="text-xs font-bold text-primary-text">
              {user?.full_name || user?.name || user?.email?.split('@')[0]}
            </div>
            <div className="text-[10px] font-mono capitalize" style={{ color: '#2dd4bf' }}>
              {user?.role || 'Member'}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
