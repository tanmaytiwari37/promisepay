import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function TopBar() {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="h-20 bg-secondary-bg/60 backdrop-blur-md border-b border-border-card flex items-center justify-between px-8">
      {/* Search Input with Technical Style */}
      <div className="flex items-center bg-surface/80 border border-border-card focus-within:border-mint/50 rounded-xl px-4 py-2 w-96 max-w-full transition-all">
        <svg className="w-4 h-4 text-muted-text mr-3 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          type="text"
          placeholder="Search agreements, criteria, or transaction hashes..."
          className="bg-transparent text-primary-text text-xs placeholder-muted-text outline-none w-full font-sans"
        />
      </div>

      {/* Right Action Items */}
      <div className="flex items-center gap-4">
        {user?.role === 'customer' && (
          <button
            onClick={() => navigate('/create-agreement')}
            className="bg-gradient-to-r from-mint to-cyan-accent hover:opacity-95 text-primary-bg text-xs font-bold px-4 py-2.5 rounded-full transition-all shadow-md shadow-mint/15 flex items-center gap-2"
          >
            <span>+</span>
            <span>New Agreement</span>
          </button>
        )}

        <div className="flex items-center gap-2.5 pl-2 border-l border-border-card">
          <div className="w-9 h-9 rounded-full bg-mint/15 border border-mint/30 flex items-center justify-center text-mint text-xs font-bold font-mono">
            {user?.full_name?.[0] || user?.name?.[0] || user?.email?.[0] || 'U'}
          </div>
        </div>
      </div>
    </header>
  );
}
