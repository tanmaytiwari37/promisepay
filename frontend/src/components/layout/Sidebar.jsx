import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function Sidebar() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const isCustomer = user?.role === 'customer';

  const navLinks = [
    {
      to: '/dashboard',
      label: 'Overview',
      icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h4a1 1 0 011 1v5a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h4a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM14 5a1 1 0 011-1h4a1 1 0 011 1v3a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM14 12a1 1 0 011-1h4a1 1 0 011 1v8a1 1 0 01-1 1h-4a1 1 0 01-1-1v-8z" />
        </svg>
      ),
    },
    {
      to: '/projects',
      label: 'My Agreements',
      icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
    },
    ...(isCustomer
      ? [{
          to: '/create-agreement',
          label: 'Create Agreement',
          icon: (
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          ),
        }]
      : []),
    {
      to: '/reports',
      label: 'Verifications',
      icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
        </svg>
      ),
    },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside
      className="w-64 flex flex-col min-h-screen"
      style={{ backgroundColor: '#060e1a', borderRight: '1px solid rgba(148,163,184,0.08)' }}
    >
      {/* Brand */}
      <div className="p-5 flex items-center gap-3" style={{ borderBottom: '1px solid rgba(148,163,184,0.08)' }}>
        <Link to="/dashboard" className="flex items-center gap-3 group">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center font-black text-sm shadow-lg group-hover:scale-105 transition-transform"
            style={{ background: 'linear-gradient(135deg, #2dd4bf 0%, #22d3ee 100%)', color: '#07111f', boxShadow: '0 4px 16px rgba(45,212,191,0.20)' }}
          >
            PP
          </div>
          <div>
            <div className="text-sm font-black tracking-tight text-primary-text font-mono">
              PROMISE<span className="text-mint">PAY</span>
            </div>
            <div className="text-[10px] text-muted-text font-mono uppercase tracking-widest">
              {isCustomer ? 'Customer Portal' : 'Freelancer Portal'}
            </div>
          </div>
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-4 space-y-1">
        <div className="px-3 py-2 text-[10px] font-mono uppercase tracking-widest text-muted-text">
          Navigation
        </div>
        {navLinks.map((link) => {
          const isActive = location.pathname === link.to ||
            (link.to === '/projects' && location.pathname.startsWith('/project/'));
          return (
            <Link
              key={link.to}
              to={link.to}
              className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200"
              style={{
                background: isActive ? 'rgba(45,212,191,0.10)' : 'transparent',
                color: isActive ? '#2dd4bf' : '#94a3b8',
                border: isActive ? '1px solid rgba(45,212,191,0.22)' : '1px solid transparent',
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  e.currentTarget.style.background = 'rgba(148,163,184,0.06)';
                  e.currentTarget.style.color = '#f1f5f9';
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.color = '#94a3b8';
                }
              }}
            >
              <span className={isActive ? 'text-mint' : 'text-muted-text'}>{link.icon}</span>
              <span>{link.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* User + Logout */}
      <div className="p-4 space-y-2" style={{ borderTop: '1px solid rgba(148,163,184,0.08)' }}>
        <div
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl"
          style={{ background: 'rgba(19,34,54,0.60)', border: '1px solid rgba(148,163,184,0.08)' }}
        >
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-black font-mono shrink-0"
            style={{ background: 'rgba(45,212,191,0.15)', color: '#2dd4bf', border: '1px solid rgba(45,212,191,0.25)' }}
          >
            {(user?.full_name?.[0] || user?.name?.[0] || user?.email?.[0] || 'U').toUpperCase()}
          </div>
          <div className="truncate flex-1 min-w-0">
            <div className="text-primary-text text-xs font-bold truncate">
              {user?.full_name || user?.name || user?.email}
            </div>
            <div className="text-[11px] font-mono capitalize" style={{ color: '#2dd4bf' }}>
              ● {user?.role || 'Member'}
            </div>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all w-full text-muted-text"
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(239,68,68,0.08)';
            e.currentTarget.style.color = '#f87171';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'transparent';
            e.currentTarget.style.color = '#4e6580';
          }}
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
