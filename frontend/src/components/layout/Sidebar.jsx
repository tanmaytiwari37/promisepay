import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function Sidebar() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const isCustomer = user?.role === 'customer';

  const navLinks = [
    { to: '/dashboard', label: 'Overview', icon: '📊' },
    { to: '/projects', label: 'My Agreements', icon: '📁' },
    ...(isCustomer ? [{ to: '/create-agreement', label: 'Create Agreement', icon: '✨' }] : []),
    { to: '/reports', label: 'Verifications', icon: '🤖' },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside className="w-64 bg-sidebar flex flex-col border-r border-border-card min-h-screen font-sans">
      {/* Brand Header */}
      <div className="p-6 border-b border-border-card flex items-center justify-between">
        <Link to="/dashboard" className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-mint to-cyan-accent flex items-center justify-center text-primary-bg font-extrabold text-sm shadow-md shadow-mint/20">
            PP
          </div>
          <div>
            <div className="text-primary-text font-bold text-sm tracking-tight font-mono">
              PROMISE<span className="text-mint">PAY</span>
            </div>
            <div className="text-muted-text text-[11px] font-mono uppercase tracking-wider">
              {isCustomer ? 'Customer Portal' : 'Freelancer Portal'}
            </div>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1.5">
        <div className="px-3 py-1.5 text-[10px] font-mono uppercase tracking-widest text-muted-text">
          Main Navigation
        </div>
        {navLinks.map((link) => {
          const isActive = location.pathname === link.to ||
            (link.to === '/projects' && location.pathname.startsWith('/project/'));
          return (
            <Link
              key={link.to}
              to={link.to}
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
                isActive
                  ? 'bg-gradient-to-r from-mint/15 to-cyan-accent/15 text-mint border border-mint/30 shadow-sm'
                  : 'text-secondary-text hover:bg-surface hover:text-primary-text border border-transparent'
              }`}
            >
              <span className="text-base">{link.icon}</span>
              <span>{link.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* User Profile & Logout Bottom Section */}
      <div className="p-4 border-t border-border-card space-y-2">
        <div className="flex items-center gap-3 px-3 py-2 rounded-xl bg-surface/50 border border-border-card">
          <div className="w-8 h-8 rounded-full bg-mint/20 text-mint font-bold text-xs flex items-center justify-center font-mono">
            {user?.full_name?.[0] || user?.name?.[0] || user?.email?.[0] || 'U'}
          </div>
          <div className="truncate flex-1">
            <div className="text-primary-text text-xs font-bold truncate">
              {user?.full_name || user?.name || user?.email}
            </div>
            <div className="text-mint text-[11px] font-mono capitalize">
              ● {user?.role || 'Member'}
            </div>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3.5 py-2 rounded-xl text-xs font-semibold text-muted-text hover:text-red-400 hover:bg-red-500/10 transition-all w-full"
        >
          <span>🚪</span>
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
