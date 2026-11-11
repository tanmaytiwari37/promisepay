import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { fetchProjects, fetchDashboardSummary } from '../api/services';
import StatusBadge from '../components/ui/StatusBadge';

function getProgressFromStatus(status) {
  switch (status?.toUpperCase()) {
    case 'DRAFT': return 10;
    case 'PENDING_APPROVAL': return 25;
    case 'AGREED': return 40;
    case 'PAYMENT_AUTHORIZED': return 55;
    case 'IN_PROGRESS': return 70;
    case 'SUBMITTED': return 82;
    case 'UNDER_REVIEW': return 90;
    case 'APPROVED': return 96;
    case 'PAID': return 100;
    case 'CANCELLED': return 0;
    default: return 50;
  }
}

const cardBase = {
  background: 'rgba(15,30,50,0.70)',
  border: '1px solid rgba(148,163,184,0.09)',
  borderRadius: '16px',
  padding: '24px',
};

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [viewMode, setViewMode] = useState('grid');

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        setLoading(true);
        const [proj] = await Promise.allSettled([
          fetchProjects(),
          fetchDashboardSummary(),
        ]);
        if (mounted) {
          if (proj.status === 'fulfilled') setProjects(proj.value || []);
          else setError(proj.reason?.message || 'Failed to load projects');
        }
      } catch (err) {
        if (mounted) setError(err.message || 'An error occurred');
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => { mounted = false; };
  }, []);

  const metrics = useMemo(() => {
    const total = projects.length;
    const active = projects.filter(p => !['PAID', 'CANCELLED', 'REJECTED'].includes(p.status?.toUpperCase())).length;
    const pending = projects.filter(p => ['SUBMITTED', 'UNDER_REVIEW', 'PENDING_APPROVAL'].includes(p.status?.toUpperCase())).length;
    const totalBudget = projects.reduce((s, p) => s + (Number(p.budget) || 0), 0);
    const completed = projects.filter(p => p.status?.toUpperCase() === 'PAID').length;
    return { total, active, pending, totalBudget, completed };
  }, [projects]);

  const firstName = user?.full_name?.split(' ')[0] || user?.name?.split(' ')[0] || 'there';

  const metricCards = [
    {
      label: 'Active Projects',
      value: loading ? '—' : metrics.active,
      sub: `${metrics.total} total`,
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
      ),
      accent: '#2dd4bf',
    },
    {
      label: 'Pending Review',
      value: loading ? '—' : metrics.pending,
      sub: 'Awaiting action',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      accent: '#f59e0b',
    },
    {
      label: 'Completed',
      value: loading ? '—' : metrics.completed,
      sub: 'Paid & delivered',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      accent: '#22c55e',
    },
    {
      label: 'Total Escrow',
      value: loading ? '—' : `$${metrics.totalBudget.toLocaleString()}`,
      sub: 'Across all projects',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
      ),
      accent: '#8b5cf6',
    },
  ];

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="w-10 h-10 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: '#2dd4bf', borderTopColor: 'transparent' }} />
        <span className="text-secondary-text text-sm font-mono">Loading workspace...</span>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <span className="w-2 h-2 rounded-full bg-mint animate-pulse" />
          <span className="text-[11px] font-mono text-mint uppercase tracking-widest">Secure Escrow Active</span>
        </div>
        <h1 className="text-3xl font-black text-primary-text tracking-tight">
          Good day, {firstName}.
        </h1>
        <p className="text-secondary-text text-sm mt-1.5">
          {user?.role === 'customer'
            ? "Here's the current state of your project agreements and verification audits."
            : "Here's your active deliverables, pending submissions, and verified earnings."}
        </p>
      </div>

      {error && (
        <div className="p-4 rounded-xl flex items-center justify-between text-sm"
          style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.18)', color: '#f87171' }}>
          <span>⚠ {error}</span>
          <button onClick={() => window.location.reload()} className="underline text-xs opacity-80">Retry</button>
        </div>
      )}

      {/* Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {metricCards.map((m) => (
          <div key={m.label} style={cardBase} className="hover:border-opacity-20 transition-all group">
            <div className="flex items-center justify-between mb-4">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center transition-all"
                style={{ background: `${m.accent}18`, border: `1px solid ${m.accent}28`, color: m.accent }}
              >
                {m.icon}
              </div>
              <div className="text-[11px] font-mono text-muted-text uppercase tracking-wider">{m.label}</div>
            </div>
            <div className="text-3xl font-black text-primary-text">{m.value}</div>
            <div className="text-xs text-muted-text mt-1 font-mono">{m.sub}</div>
          </div>
        ))}
      </div>

      {/* Projects section */}
      <div>
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-black text-primary-text">
            {user?.role === 'customer' ? 'My Agreements' : 'My Projects'}
          </h2>
          <div className="flex items-center gap-2">
            {/* View mode toggle */}
            <div className="flex p-1 rounded-xl" style={{ background: 'rgba(19,34,54,0.60)', border: '1px solid rgba(148,163,184,0.10)' }}>
              <button
                onClick={() => setViewMode('grid')}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
                style={viewMode === 'grid'
                  ? { background: 'rgba(45,212,191,0.12)', color: '#2dd4bf', border: '1px solid rgba(45,212,191,0.22)' }
                  : { color: '#4e6580' }}
              >
                Grid
              </button>
              <button
                onClick={() => setViewMode('table')}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
                style={viewMode === 'table'
                  ? { background: 'rgba(45,212,191,0.12)', color: '#2dd4bf', border: '1px solid rgba(45,212,191,0.22)' }
                  : { color: '#4e6580' }}
              >
                Table
              </button>
            </div>
          </div>
        </div>

        {projects.length === 0 ? (
          <div
            className="rounded-2xl p-16 flex flex-col items-center justify-center text-center"
            style={{ background: 'rgba(15,30,50,0.50)', border: '2px dashed rgba(148,163,184,0.12)' }}
          >
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
              style={{ background: 'rgba(45,212,191,0.08)', border: '1px solid rgba(45,212,191,0.15)' }}>
              <svg className="w-7 h-7 text-mint" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div className="text-primary-text font-bold text-lg mb-1">No agreements yet</div>
            <div className="text-secondary-text text-sm mb-6">
              {user?.role === 'customer'
                ? 'Create your first AI-powered agreement to get started.'
                : 'You will appear here when a customer assigns you to a project.'}
            </div>
            {user?.role === 'customer' && (
              <Link
                to="/create-agreement"
                className="px-6 py-3 rounded-full font-bold text-sm transition-all"
                style={{ background: 'linear-gradient(135deg, #2dd4bf 0%, #22d3ee 100%)', color: '#07111f' }}
              >
                Create Your First Agreement
              </Link>
            )}
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {projects.map((proj) => {
              const progress = getProgressFromStatus(proj.status);
              return (
                <div
                  key={proj.id}
                  onClick={() => navigate(`/project/${proj.id}`)}
                  className="rounded-2xl p-5 cursor-pointer transition-all group"
                  style={{
                    background: 'rgba(15,30,50,0.70)',
                    border: '1px solid rgba(148,163,184,0.09)',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(45,212,191,0.22)';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 8px 32px rgba(0,0,0,0.30)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(148,163,184,0.09)';
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm font-mono shrink-0"
                      style={{ background: 'rgba(45,212,191,0.10)', color: '#2dd4bf', border: '1px solid rgba(45,212,191,0.18)' }}
                    >
                      {proj.title?.[0]?.toUpperCase() || 'P'}
                    </div>
                    <StatusBadge status={proj.status} />
                  </div>

                  <div className="font-bold text-primary-text text-sm mb-1 group-hover:text-mint transition-colors line-clamp-1">
                    {proj.title}
                  </div>
                  <div className="text-xs text-muted-text mb-4 line-clamp-2">{proj.description}</div>

                  <div className="flex items-center justify-between text-xs mb-3" style={{ borderTop: '1px solid rgba(148,163,184,0.08)', paddingTop: '12px' }}>
                    <span className="text-secondary-text">Escrow</span>
                    <span className="font-black text-primary-text font-mono">
                      ${Number(proj.budget).toLocaleString()} <span className="text-muted-text font-normal text-[10px]">{proj.currency || 'USD'}</span>
                    </span>
                  </div>

                  <div>
                    <div className="flex justify-between text-[11px] font-mono mb-1.5">
                      <span className="text-muted-text">Progress</span>
                      <span style={{ color: '#2dd4bf' }}>{progress}%</span>
                    </div>
                    <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ background: '#07111f' }}>
                      <div
                        className="h-1.5 rounded-full transition-all duration-500"
                        style={{
                          width: `${progress}%`,
                          background: 'linear-gradient(90deg, #2dd4bf 0%, #22d3ee 100%)',
                        }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Create card */}
            {user?.role === 'customer' && (
              <div
                onClick={() => navigate('/create-agreement')}
                className="rounded-2xl p-6 flex flex-col items-center justify-center cursor-pointer transition-all group min-h-[200px]"
                style={{ border: '2px dashed rgba(148,163,184,0.12)', background: 'rgba(15,30,50,0.30)' }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'rgba(45,212,191,0.30)'; e.currentTarget.style.background = 'rgba(45,212,191,0.04)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'rgba(148,163,184,0.12)'; e.currentTarget.style.background = 'rgba(15,30,50,0.30)'; }}
              >
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center text-xl mb-3 transition-all"
                  style={{ background: 'rgba(45,212,191,0.10)', color: '#2dd4bf', border: '1px solid rgba(45,212,191,0.20)' }}
                >
                  +
                </div>
                <div className="font-bold text-sm text-secondary-text group-hover:text-mint transition-colors">
                  New Agreement
                </div>
                <div className="text-[11px] text-muted-text mt-1 font-mono">AI-Powered & Verified</div>
              </div>
            )}
          </div>
        ) : (
          /* Table view */
          <div
            className="rounded-2xl overflow-hidden"
            style={{ background: 'rgba(15,30,50,0.70)', border: '1px solid rgba(148,163,184,0.09)' }}
          >
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr style={{ background: 'rgba(19,34,54,0.60)', borderBottom: '1px solid rgba(148,163,184,0.09)' }}>
                    {['Agreement Title', 'Status', 'Escrow Value', 'Deadline', ''].map((h) => (
                      <th key={h} className="py-4 px-6 text-xs font-semibold uppercase tracking-wider font-mono text-muted-text">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {projects.map((proj) => (
                    <tr
                      key={proj.id}
                      onClick={() => navigate(`/project/${proj.id}`)}
                      className="cursor-pointer transition-colors"
                      style={{ borderBottom: '1px solid rgba(148,163,184,0.06)' }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(45,212,191,0.04)'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
                    >
                      <td className="py-4 px-6">
                        <div className="font-bold text-primary-text text-sm">{proj.title}</div>
                        <div className="text-xs text-muted-text truncate max-w-xs">{proj.description}</div>
                      </td>
                      <td className="py-4 px-6"><StatusBadge status={proj.status} /></td>
                      <td className="py-4 px-6 font-mono font-bold text-sm" style={{ color: '#2dd4bf' }}>
                        ${Number(proj.budget).toLocaleString()}
                      </td>
                      <td className="py-4 px-6 text-secondary-text text-xs font-mono">
                        {proj.deadline ? new Date(proj.deadline).toLocaleDateString() : 'Flexible'}
                      </td>
                      <td className="py-4 px-6 text-right">
                        <span className="text-xs font-bold text-mint hover:underline">Open →</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
