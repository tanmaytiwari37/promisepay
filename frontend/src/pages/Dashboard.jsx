import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { fetchProjects, fetchDashboardSummary } from '../api/services';
import StatusBadge from '../components/ui/StatusBadge';

// Helper to calculate progress percentage from status
function getProgressFromStatus(status) {
  switch (status?.toUpperCase()) {
    case 'DRAFT': return 15;
    case 'PENDING_APPROVAL': return 30;
    case 'AGREED': return 45;
    case 'PAYMENT_AUTHORIZED': return 60;
    case 'IN_PROGRESS': return 75;
    case 'SUBMITTED': return 85;
    case 'UNDER_REVIEW': return 90;
    case 'APPROVED': return 95;
    case 'PAID': return 100;
    case 'CANCELLED': return 0;
    default: return 50;
  }
}

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'table'

  useEffect(() => {
    let mounted = true;
    const loadDashboardData = async () => {
      try {
        setLoading(true);
        const [projectsData] = await Promise.allSettled([
          fetchProjects(),
          fetchDashboardSummary(),
        ]);

        if (mounted) {
          if (projectsData.status === 'fulfilled') {
            setProjects(projectsData.value || []);
          } else {
            setError(projectsData.reason?.message || 'Failed to load projects');
          }
        }
      } catch (err) {
        if (mounted) setError(err.message || 'An error occurred loading dashboard');
      } finally {
        if (mounted) setLoading(false);
      }
    };

    loadDashboardData();
    return () => { mounted = false; };
  }, []);

  // Compute metrics from actual data
  const metrics = useMemo(() => {
    const total = projects.length;
    const active = projects.filter(p => !['PAID', 'CANCELLED', 'REJECTED'].includes(p.status?.toUpperCase())).length;
    const pendingReview = projects.filter(p => ['SUBMITTED', 'UNDER_REVIEW', 'PENDING_APPROVAL'].includes(p.status?.toUpperCase())).length;
    const totalBudget = projects.reduce((sum, p) => sum + (Number(p.budget) || 0), 0);
    const completed = projects.filter(p => p.status?.toUpperCase() === 'PAID').length;

    return { total, active, pendingReview, totalBudget, completed };
  }, [projects]);

  const firstName = user?.full_name?.split(' ')[0] || user?.name?.split(' ')[0] || 'there';

  return (
    <div className="space-y-8 max-w-7xl mx-auto font-sans">
      {/* Header Greeting */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="w-2 h-2 rounded-full bg-mint animate-pulse"></span>
            <span className="text-[11px] font-mono text-mint uppercase tracking-wider">SECURE ESCROW ACTIVE</span>
          </div>
          <h1 className="text-3xl font-extrabold text-primary-text tracking-tight">
            Good day, {firstName}.
          </h1>
          <p className="text-secondary-text text-sm mt-1">
            {user?.role === 'customer'
              ? "Here's the current state of your project agreements and deliverable verification audits."
              : "Here's your active deliverables, pending submissions, and verified earnings."}
          </p>
        </div>

        {user?.role === 'customer' && (
          <Link
            to="/create-agreement"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-mint to-cyan-accent hover:opacity-95 text-primary-bg px-6 py-3 rounded-full font-bold text-sm transition-all shadow-lg shadow-mint/20"
          >
            <span>+</span>
            <span>Create Agreement</span>
          </Link>
        )}
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-center justify-between">
          <span>⚠️ {error}</span>
          <button onClick={() => window.location.reload()} className="underline text-xs">Retry</button>
        </div>
      )}

      {/* Metric Cards (Reference glass aesthetic) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Active Projects */}
        <div className="glass-card rounded-2xl p-6 border border-border-card">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-mint/10 border border-mint/20 flex items-center justify-center text-mint text-lg">
              📁
            </div>
            <span className="text-[10px] font-mono font-bold text-mint bg-mint/10 border border-mint/20 px-2 py-0.5 rounded-full">
              ACTIVE
            </span>
          </div>
          <div className="text-xs text-secondary-text font-mono uppercase tracking-wider">Active Agreements</div>
          <div className="text-3xl font-extrabold text-primary-text mt-1 font-mono">
            {loading ? '-' : metrics.active}
          </div>
        </div>

        {/* Pending Reviews */}
        <div className="glass-card rounded-2xl p-6 border border-border-card">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-accent/10 border border-cyan-accent/20 flex items-center justify-center text-cyan-accent text-lg">
              🤖
            </div>
            <span className="text-[10px] font-mono font-bold text-cyan-accent bg-cyan-accent/10 border border-cyan-accent/20 px-2 py-0.5 rounded-full">
              AUDIT
            </span>
          </div>
          <div className="text-xs text-secondary-text font-mono uppercase tracking-wider">Pending Audits</div>
          <div className="text-3xl font-extrabold text-primary-text mt-1 font-mono">
            {loading ? '-' : metrics.pendingReview}
          </div>
        </div>

        {/* Volume / Total Escrow */}
        <div className="glass-card rounded-2xl p-6 border border-border-card">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 text-lg">
              💳
            </div>
            <span className="text-[10px] font-mono font-bold text-blue-400 bg-blue-500/10 border border-blue-500/20 px-2 py-0.5 rounded-full">
              VOLUME
            </span>
          </div>
          <div className="text-xs text-secondary-text font-mono uppercase tracking-wider">
            {user?.role === 'customer' ? 'Total Escrow Budget' : 'Earnings Potential'}
          </div>
          <div className="text-3xl font-extrabold text-primary-text mt-1 font-mono">
            {loading ? '-' : `$${metrics.totalBudget.toLocaleString()}`}
          </div>
        </div>

        {/* Completed Projects */}
        <div className="glass-card rounded-2xl p-6 border border-border-card">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-emerald/10 border border-emerald/20 flex items-center justify-center text-emerald text-lg">
              🏆
            </div>
            <span className="text-[10px] font-mono font-bold text-emerald bg-emerald/10 border border-emerald/20 px-2 py-0.5 rounded-full">
              PAID
            </span>
          </div>
          <div className="text-xs text-secondary-text font-mono uppercase tracking-wider">Completed & Paid</div>
          <div className="text-3xl font-extrabold text-primary-text mt-1 font-mono">
            {loading ? '-' : metrics.completed}
          </div>
        </div>
      </div>

      {/* Agreements Section */}
      <div>
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-bold text-primary-text tracking-tight">Active Agreements</h2>
            <span className="text-xs font-mono bg-surface border border-border-card text-secondary-text px-2.5 py-1 rounded-full font-medium">
              {projects.length} Total
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 px-3 rounded-lg text-xs font-semibold transition-all ${viewMode === 'grid' ? 'bg-surface border border-mint/40 text-mint' : 'text-muted-text hover:text-primary-text'}`}
            >
              ⊞ Grid
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-2 px-3 rounded-lg text-xs font-semibold transition-all ${viewMode === 'table' ? 'bg-surface border border-mint/40 text-mint' : 'text-muted-text hover:text-primary-text'}`}
            >
              ☰ Table
            </button>
          </div>
        </div>

        {loading ? (
          <div className="py-20 text-center">
            <div className="w-8 h-8 border-2 border-mint border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
            <p className="text-secondary-text text-sm">Loading agreements...</p>
          </div>
        ) : projects.length === 0 ? (
          <div className="glass-card rounded-2xl p-12 text-center border border-border-card">
            <div className="w-14 h-14 rounded-2xl bg-surface border border-border-card flex items-center justify-center text-2xl mx-auto mb-4 text-mint">
              📂
            </div>
            <h3 className="text-lg font-bold text-primary-text mb-1">No agreements found</h3>
            <p className="text-secondary-text text-sm max-w-sm mx-auto mb-6">
              {user?.role === 'customer'
                ? 'Create your first project agreement to define deliverables and lock funds in secure escrow.'
                : 'You have not been assigned to any project agreements yet.'}
            </p>
            {user?.role === 'customer' && (
              <Link
                to="/create-agreement"
                className="inline-flex items-center gap-2 bg-gradient-to-r from-mint to-cyan-accent text-primary-bg px-6 py-3 rounded-full font-bold text-sm shadow-lg shadow-mint/20"
              >
                Create First Agreement
              </Link>
            )}
          </div>
        ) : viewMode === 'grid' ? (
          /* Grid View */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {projects.map((proj) => {
              const progress = getProgressFromStatus(proj.status);
              return (
                <div
                  key={proj.id}
                  onClick={() => navigate(`/project/${proj.id}`)}
                  className="glass-card border border-border-card hover:border-mint/50 rounded-2xl p-6 cursor-pointer transition-all duration-200 hover:-translate-y-1 hover:shadow-xl flex flex-col justify-between group"
                >
                  <div>
                    {/* Header: Title + Status */}
                    <div className="flex items-start justify-between gap-3 mb-4">
                      <div className="w-10 h-10 rounded-xl bg-surface border border-border-card group-hover:border-mint/30 text-mint flex items-center justify-center text-lg transition-colors">
                        📁
                      </div>
                      <StatusBadge status={proj.status} />
                    </div>

                    <h3 className="font-bold text-primary-text text-base group-hover:text-mint transition-colors line-clamp-1">
                      {proj.title}
                    </h3>
                    <p className="text-secondary-text text-xs line-clamp-2 mt-1 mb-5">
                      {proj.description || 'No detailed scope provided.'}
                    </p>
                  </div>

                  <div>
                    {/* Budget & Deadline */}
                    <div className="flex items-center justify-between text-xs mb-3 pt-3 border-t border-border-card">
                      <span className="text-secondary-text">Escrow:</span>
                      <span className="font-bold text-primary-text font-mono text-sm">
                        ${Number(proj.budget).toLocaleString()} <span className="text-[10px] text-muted-text font-normal">{proj.currency || 'USD'}</span>
                      </span>
                    </div>

                    {/* Progress Bar */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-[11px] text-muted-text font-mono">
                        <span>Workflow Progress</span>
                        <span className="text-mint">{progress}%</span>
                      </div>
                      <div className="w-full bg-primary-bg rounded-full h-1.5 overflow-hidden">
                        <div
                          className="bg-gradient-to-r from-mint to-cyan-accent h-1.5 rounded-full transition-all duration-500"
                          style={{ width: `${progress}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Dashed Create Card */}
            {user?.role === 'customer' && (
              <div
                onClick={() => navigate('/create-agreement')}
                className="border-2 border-dashed border-border-card hover:border-mint/50 bg-surface/20 hover:bg-surface/40 rounded-2xl p-8 flex flex-col items-center justify-center cursor-pointer transition-all group min-h-[220px]"
              >
                <div className="w-12 h-12 rounded-full bg-surface group-hover:bg-mint group-hover:text-primary-bg text-mint flex items-center justify-center text-xl transition-all mb-3 shadow-md">
                  +
                </div>
                <div className="font-bold text-primary-text text-sm group-hover:text-mint transition-colors">
                  Create New Agreement
                </div>
                <div className="text-xs text-muted-text mt-1 text-center font-mono">
                  AI-Powered Deliverables & Verification
                </div>
              </div>
            )}
          </div>
        ) : (
          /* Table View */
          <div className="glass-card rounded-2xl overflow-hidden border border-border-card">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-border-card bg-surface/50 text-secondary-text text-xs uppercase tracking-wider font-mono">
                    <th className="py-4 px-6 font-semibold">Agreement Title</th>
                    <th className="py-4 px-6 font-semibold">Status</th>
                    <th className="py-4 px-6 font-semibold">Escrow Value</th>
                    <th className="py-4 px-6 font-semibold">Deadline</th>
                    <th className="py-4 px-6 font-semibold text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-card text-primary-text">
                  {projects.map((proj) => (
                    <tr
                      key={proj.id}
                      onClick={() => navigate(`/project/${proj.id}`)}
                      className="hover:bg-surface/40 cursor-pointer transition-colors"
                    >
                      <td className="py-4 px-6">
                        <div className="font-bold text-primary-text group-hover:text-mint">{proj.title}</div>
                        <div className="text-xs text-muted-text truncate max-w-xs">{proj.description}</div>
                      </td>
                      <td className="py-4 px-6">
                        <StatusBadge status={proj.status} />
                      </td>
                      <td className="py-4 px-6 font-mono font-bold text-mint">
                        ${Number(proj.budget).toLocaleString()}
                      </td>
                      <td className="py-4 px-6 text-secondary-text text-xs font-mono">
                        {proj.deadline ? new Date(proj.deadline).toLocaleDateString() : 'Flexible'}
                      </td>
                      <td className="py-4 px-6 text-right">
                        <span className="text-xs font-bold text-mint hover:underline">
                          Open Space →
                        </span>
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
