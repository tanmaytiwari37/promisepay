import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AgGridReact } from 'ag-grid-react';
import { AllCommunityModule, ModuleRegistry } from 'ag-grid-community';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import { useAuth } from '../context/AuthContext';
import {
  fetchProjects,
  fetchDashboardSummary,
  fetchPendingApprovals,
  fetchPayments,
  fetchAgreement,
  fetchReports,
} from '../api/services';
import StatusBadge from '../components/ui/StatusBadge';
import ErrorBoundary from '../components/ui/ErrorBoundary';

ModuleRegistry.registerModules([AllCommunityModule]);

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

const CARD_BASE = {
  background: 'rgba(15,30,50,0.70)',
  border: '1px solid rgba(148,163,184,0.09)',
  borderRadius: '16px',
  padding: '24px',
};

const GRID_STYLE = { height: 400, width: '100%', fontFamily: 'Inter, system-ui, sans-serif' };

// Safe status badge renderer for AG Grid
function StatusCellRenderer({ value }) {
  return <StatusBadge status={value} />;
}

// Currency formatter - handles null/undefined
function currencyFormatter(params) {
  if (params.value == null || params.value === '') return '—';
  const num = Number(params.value);
  if (isNaN(num)) return '—';
  return `$${num.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

// Date formatter - handles null/undefined/invalid
function dateFormatter(params) {
  if (!params.value) return '—';
  const d = new Date(params.value);
  return isNaN(d.getTime()) ? '—' : d.toLocaleDateString();
}

// Verdict badge renderer for deliverables
function VerdictCellRenderer({ value }) {
  const config = {
    completed: { label: 'Completed', dot: '#22c55e', bg: 'rgba(34,197,94,0.12)', text: '#4ade80', border: 'rgba(34,197,94,0.25)' },
    missing: { label: 'Missing', dot: '#ef4444', bg: 'rgba(239,68,68,0.10)', text: '#f87171', border: 'rgba(239,68,68,0.22)' },
    uncertain: { label: 'Uncertain', dot: '#f59e0b', bg: 'rgba(245,158,11,0.10)', text: '#fbbf24', border: 'rgba(245,158,11,0.22)' },
  };
  const key = (value || '').toLowerCase();
  const cfg = config[key] || { label: value || '—', dot: '#6b7280', bg: 'rgba(107,114,128,0.10)', text: '#9ca3af', border: 'rgba(107,114,128,0.18)' };
  return (
    <span
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold font-mono whitespace-nowrap"
      style={{ background: cfg.bg, color: cfg.text, border: `1px solid ${cfg.border}` }}
    >
      <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: cfg.dot }} />
      {cfg.label}
    </span>
  );
}

// Payment status badge
function PaymentStatusCellRenderer({ value }) {
  const config = {
    created: { label: 'Created', dot: '#6b7280', bg: 'rgba(107,114,128,0.12)', text: '#9ca3af', border: 'rgba(107,114,128,0.18)' },
    payment_authorized: { label: 'Authorized', dot: '#8b5cf6', bg: 'rgba(139,92,246,0.10)', text: '#a78bfa', border: 'rgba(139,92,246,0.22)' },
    authorized: { label: 'Authorized', dot: '#8b5cf6', bg: 'rgba(139,92,246,0.10)', text: '#a78bfa', border: 'rgba(139,92,246,0.22)' },
    paid: { label: 'Paid', dot: '#10b981', bg: 'rgba(16,185,129,0.12)', text: '#34d399', border: 'rgba(16,185,129,0.25)' },
    cancelled: { label: 'Cancelled', dot: '#6b7280', bg: 'rgba(107,114,128,0.08)', text: '#6b7280', border: 'rgba(107,114,128,0.15)' },
    failed: { label: 'Failed', dot: '#ef4444', bg: 'rgba(239,68,68,0.10)', text: '#f87171', border: 'rgba(239,68,68,0.22)' },
  };
  const key = (value || '').toLowerCase();
  const cfg = config[key] || { label: value || '—', dot: '#6b7280', bg: 'rgba(107,114,128,0.10)', text: '#9ca3af', border: 'rgba(107,114,128,0.18)' };
  return (
    <span
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold font-mono whitespace-nowrap"
      style={{ background: cfg.bg, color: cfg.text, border: `1px solid ${cfg.border}` }}
    >
      <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: cfg.dot }} />
      {cfg.label}
    </span>
  );
}

// Approval pending-from badge
function PendingFromCellRenderer({ value }) {
  if (!value) return <span className="text-xs text-muted-text">—</span>;
  const labels = { customer: 'Waiting on Customer', freelancer: 'Waiting on Freelancer', both: 'Waiting on Both' };
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold font-mono whitespace-nowrap"
      style={{ background: 'rgba(245,158,11,0.10)', color: '#fbbf24', border: '1px solid rgba(245,158,11,0.22)' }}>
      <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: '#f59e0b' }} />
      {labels[value] || value}
    </span>
  );
}

// Grid wrapper with error boundary
function GridPanel({ data, colDefs, emptyMsg, onRowClick }) {
  return (
    <ErrorBoundary
      fallback={(err, reset) => (
        <div className="rounded-2xl p-16 flex flex-col items-center justify-center text-center"
          style={{ background: 'rgba(15,30,50,0.50)', border: '2px dashed rgba(239,68,68,0.12)' }}>
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
            style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.15)' }}>
            <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="#f87171">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <div className="text-primary-text font-bold text-lg mb-1">Grid failed to load</div>
          <div className="text-secondary-text text-sm mb-4">{emptyMsg || 'Try refreshing the page.'}</div>
          <button onClick={reset} className="px-6 py-2.5 rounded-xl font-bold text-sm transition-all"
            style={{ background: 'linear-gradient(135deg, #2dd4bf 0%, #22d3ee 100%)', color: '#07111f' }}>
            Retry Grid
          </button>
        </div>
      )}
    >
      <div className="ag-theme-alpine" style={GRID_STYLE}>
        {data.length === 0 ? (
          <div className="rounded-2xl p-16 flex flex-col items-center justify-center text-center"
            style={{ background: 'rgba(15,30,50,0.50)', border: '2px dashed rgba(148,163,184,0.12)' }}>
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
              style={{ background: 'rgba(45,212,191,0.08)', border: '1px solid rgba(45,212,191,0.15)' }}>
              <svg className="w-7 h-7 text-mint" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div className="text-primary-text font-bold text-lg mb-1">No data</div>
            <div className="text-secondary-text text-sm">{emptyMsg}</div>
          </div>
        ) : (
          <AgGridReact
            pagination={true}
            paginationPageSize={10}
            paginationPageSizeSelector={[10, 20, 50]}
            defaultColDef={{
              resizable: true,
              suppressSizeToFit: true,
              filter: true,
              sortable: true,
            }}
            rowSelection="single"
            onRowClicked={onRowClick}
            rowData={data}
            columnDefs={colDefs}
          />
        )}
      </div>
    </ErrorBoundary>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [payments, setPayments] = useState([]);
  const [deliverables, setDeliverables] = useState([]);
  const [pendingApprovals, setPendingApprovals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('projects');
  const [searchText, setSearchText] = useState('');

  // Load all dashboard data
  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        setLoading(true);
        setError('');
        const [projRes, payRes, apprRes] = await Promise.allSettled([
          fetchProjects(),
          fetchPayments(),
          fetchPendingApprovals(),
        ]);
        if (!mounted) return;
        if (projRes.status === 'fulfilled') setProjects(projRes.value || []);
        else setError(projRes.reason?.message || 'Failed to load projects');
        if (payRes.status === 'fulfilled') setPayments(payRes.value || []);
        if (apprRes.status === 'fulfilled') setPendingApprovals(apprRes.value || []);
      } catch (err) {
        if (mounted) setError(err.message || 'An error occurred');
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => { mounted = false; };
  }, []);

  // Build deliverables grid data from projects + agreements + reports
  useEffect(() => {
    if (!projects.length) return;
    let mounted = true;
    const buildDeliverables = async () => {
      try {
        const rows = [];
        for (const proj of projects) {
          try {
            const agreement = await fetchAgreement(proj.id);
            if (!agreement?.deliverables || !Array.isArray(agreement.deliverables)) continue;
            const reports = await fetchReports(proj.id).catch(() => []);
            const latestReport = reports[0];
            const criteria = Array.isArray(agreement.acceptance_criteria) ? agreement.acceptance_criteria : [];
            const criteriaByDeliverable = {};
            criteria.forEach(c => {
              const did = c.deliverable_id || 'general';
              if (!criteriaByDeliverable[did]) criteriaByDeliverable[did] = [];
              criteriaByDeliverable[did].push(c);
            });
            agreement.deliverables.forEach((del, idx) => {
              const delKey = del.id || idx;
              const delCriteria = criteriaByDeliverable[delKey] || criteriaByDeliverable[idx] || criteriaByDeliverable['general'] || [];
              delCriteria.forEach((crit, ci) => {
                let verdict = '—';
                if (latestReport?.result?.criteria) {
                  const match = latestReport.result.criteria.find(c => c.criterion_id === crit.id || c.criterion === crit.criterion);
                  if (match) verdict = match.status;
                }
                rows.push({
                  id: `${proj.id}-${delKey}-${crit.id || ci}`,
                  project_id: proj.id,
                  project_title: proj.title,
                  project_status: proj.status,
                  deliverable_title: del.title,
                  deliverable_description: del.description,
                  criterion: crit.criterion,
                  criterion_id: crit.id,
                  verdict,
                  report_id: latestReport?.id,
                });
              });
              // If no criteria for this deliverable, still show it
              if (delCriteria.length === 0) {
                rows.push({
                  id: `${proj.id}-${delKey}-none`,
                  project_id: proj.id,
                  project_title: proj.title,
                  project_status: proj.status,
                  deliverable_title: del.title,
                  deliverable_description: del.description,
                  criterion: '—',
                  criterion_id: null,
                  verdict: '—',
                  report_id: latestReport?.id,
                });
              }
            });
          } catch {
            // Project may not have agreement yet, skip
          }
        }
        if (mounted) setDeliverables(rows);
      } catch (err) {
        if (mounted) console.error('Failed to build deliverables:', err);
      }
    };
    buildDeliverables();
    return () => { mounted = false; };
  }, [projects]);

  // Filter functions
  const filterData = useCallback((data, fields) => {
    if (!searchText) return data;
    const q = searchText.toLowerCase();
    return data.filter(item => fields.some(f => {
      const val = item[f];
      return val != null && String(val).toLowerCase().includes(q);
    }));
  }, [searchText]);

  const filteredDeliverables = useMemo(() => filterData(deliverables, ['project_title', 'deliverable_title', 'criterion', 'verdict']), [deliverables, filterData]);
  const filteredPayments = useMemo(() => filterData(payments, ['project_id', 'amount', 'status', 'paypal_order_id', 'authorization_id', 'capture_id']), [payments, filterData]);
  const filteredApprovals = useMemo(() => filterData(pendingApprovals, ['project_title', 'pending_from', 'overall_status']), [pendingApprovals, filterData]);
  const filteredProjects = useMemo(() => filterData(projects, ['title', 'description', 'freelancer_email', 'status']), [projects, filterData]);

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
      label: 'Total Protected',
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

  // Column definitions (must be before any early return for hooks rules)
  const projectColDefs = useMemo(() => [
    { field: 'title', headerName: 'Title', filter: 'agTextColumnFilter', sortable: true, flex: 1, minWidth: 200 },
    { field: 'freelancer_email', headerName: 'Freelancer', filter: 'agTextColumnFilter', sortable: true, minWidth: 180 },
    { field: 'budget', headerName: 'Amount', filter: 'agNumberColumnFilter', sortable: true, valueFormatter: currencyFormatter, minWidth: 120 },
    { field: 'deadline', headerName: 'Deadline', filter: 'agDateColumnFilter', sortable: true, valueFormatter: dateFormatter, minWidth: 130 },
    { field: 'status', headerName: 'Status', filter: 'agSetColumnFilter', sortable: true, cellRenderer: StatusCellRenderer, minWidth: 150 },
  ], []);

  const deliverableColDefs = useMemo(() => [
    { field: 'project_title', headerName: 'Project', filter: 'agTextColumnFilter', sortable: true, flex: 1, minWidth: 180 },
    { field: 'deliverable_title', headerName: 'Deliverable', filter: 'agTextColumnFilter', sortable: true, flex: 1, minWidth: 180 },
    { field: 'criterion', headerName: 'Criterion', filter: 'agTextColumnFilter', sortable: true, flex: 1, minWidth: 200 },
    { field: 'verdict', headerName: 'Verification', filter: 'agSetColumnFilter', sortable: true, cellRenderer: VerdictCellRenderer, minWidth: 150 },
  ], []);

  const paymentColDefs = useMemo(() => [
    { field: 'project_id', headerName: 'Project ID', filter: 'agNumberColumnFilter', sortable: true, minWidth: 100 },
    { field: 'amount', headerName: 'Amount', filter: 'agNumberColumnFilter', sortable: true, valueFormatter: currencyFormatter, minWidth: 120 },
    { field: 'status', headerName: 'Payment Status', filter: 'agSetColumnFilter', sortable: true, cellRenderer: PaymentStatusCellRenderer, minWidth: 150 },
    { field: 'paypal_order_id', headerName: 'PayPal Order ID', filter: 'agTextColumnFilter', sortable: true, minWidth: 180 },
    { field: 'authorization_id', headerName: 'Auth ID', filter: 'agTextColumnFilter', sortable: true, minWidth: 180 },
    { field: 'capture_id', headerName: 'Capture ID', filter: 'agTextColumnFilter', sortable: true, minWidth: 180 },
    { field: 'created_at', headerName: 'Date', filter: 'agDateColumnFilter', sortable: true, valueFormatter: dateFormatter, minWidth: 130 },
  ], []);

  const approvalColDefs = useMemo(() => [
    { field: 'project_title', headerName: 'Project', filter: 'agTextColumnFilter', sortable: true, flex: 1, minWidth: 200 },
    { field: 'approval_type', headerName: 'Type', filter: 'agSetColumnFilter', sortable: true, minWidth: 120 },
    { field: 'customer_approved', headerName: 'Customer ✓', filter: 'agSetColumnFilter', sortable: true, cellRenderer: ({ value }) => value ? '✓' : '✗', minWidth: 110 },
    { field: 'freelancer_approved', headerName: 'Freelancer ✓', filter: 'agSetColumnFilter', sortable: true, cellRenderer: ({ value }) => value ? '✓' : '✗', minWidth: 110 },
    { field: 'pending_from', headerName: 'Waiting On', filter: 'agSetColumnFilter', sortable: true, cellRenderer: PendingFromCellRenderer, minWidth: 160 },
    { field: 'overall_status', headerName: 'Overall', filter: 'agSetColumnFilter', sortable: true, cellRenderer: ({ value }) => <StatusBadge status={value} />, minWidth: 130 },
  ], []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="w-10 h-10 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: '#2dd4bf', borderTopColor: 'transparent' }} />
        <span className="text-secondary-text text-sm font-mono">Loading workspace...</span>
      </div>
    );
  }

  // Row click handlers
  const handleProjectRowClick = (params) => {
    if (params.data?.id) navigate(`/project/${params.data.id}`);
  };

  const handleDeliverableRowClick = (params) => {
    if (params.data?.project_id) navigate(`/project/${params.data.project_id}`);
  };

  const handlePaymentRowClick = (params) => {
    if (params.data?.project_id) navigate(`/project/${params.data.project_id}`);
  };

  const handleApprovalRowClick = (params) => {
    if (params.data?.project_id) navigate(`/project/${params.data.project_id}`);
  };

  // Search input
  const SearchBox = ({ onChange }) => (
    <input
      type="text"
      placeholder="Quick search…"
      value={searchText}
      onChange={(e) => onChange(e.target.value)}
      className="w-full sm:w-64 px-4 py-2.5 rounded-xl text-sm transition-all"
      style={{
        background: 'rgba(19,34,54,0.8)',
        border: '1px solid rgba(148,163,184,0.15)',
        color: '#f1f5f9',
        outline: 'none',
      }}
      onFocus={(e) => { e.target.style.borderColor = 'rgba(45,212,191,0.5)'; e.target.style.boxShadow = '0 0 0 3px rgba(45,212,191,0.08)'; }}
      onBlur={(e) => { e.target.style.borderColor = 'rgba(148,163,184,0.15)'; e.target.style.boxShadow = 'none'; }}
    />
  );

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <span className="w-2 h-2 rounded-full bg-mint animate-pulse" />
          <span className="text-[11px] font-mono text-mint uppercase tracking-widest">Payment Protection Active</span>
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
          <div key={m.label} style={CARD_BASE} className="hover:border-opacity-20 transition-all group">
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

      {/* Tabs */}
      <div className="flex p-1 rounded-xl" style={{ background: 'rgba(19,34,54,0.60)', border: '1px solid rgba(148,163,184,0.10)' }}>
        {[
          { id: 'projects', label: 'Projects', count: filteredProjects.length },
          { id: 'deliverables', label: 'Deliverables', count: filteredDeliverables.length },
          { id: 'payments', label: 'Payments', count: filteredPayments.length },
          { id: 'approvals', label: 'Approvals', count: filteredApprovals.length },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => { setActiveTab(tab.id); setSearchText(''); }}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all flex items-center gap-2 ${
              activeTab === tab.id
                ? 'bg-[rgba(45,212,191,0.12)] text-mint border border-[rgba(45,212,191,0.22)]'
                : 'text-[#4e6580] hover:text-secondary-text'
            }`}
          >
            {tab.label}
            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono"
              style={{
                background: activeTab === tab.id ? 'rgba(45,212,191,0.18)' : 'rgba(148,163,184,0.12)',
                color: activeTab === tab.id ? '#2dd4bf' : '#4e6580',
              }}
            >
              {tab.count}
            </span>
          </button>
        ))}
        <div className="flex-1" />
        <SearchBox onChange={setSearchText} />
      </div>

      {/* Tab Panels */}
      <div className="rounded-2xl" style={{ background: 'rgba(15,30,50,0.70)', border: '1px solid rgba(148,163,184,0.09)' }}>
        <div className="p-5 border-b" style={{ borderColor: 'rgba(148,163,184,0.09)' }}>
          <h2 className="text-lg font-black text-primary-text">
            {activeTab === 'projects' && (user?.role === 'customer' ? 'My Agreements' : 'My Projects')}
            {activeTab === 'deliverables' && 'Deliverables & Verification'}
            {activeTab === 'payments' && 'Payment History'}
            {activeTab === 'approvals' && 'Pending Approvals'}
          </h2>
        </div>
        <div className="p-5">
          {activeTab === 'projects' && (
            <GridPanel
              data={filteredProjects}
              colDefs={projectColDefs}
              emptyMsg="No projects found. Create your first agreement to get started."
              onRowClick={handleProjectRowClick}
            />
          )}
          {activeTab === 'deliverables' && (
            <GridPanel
              data={filteredDeliverables}
              colDefs={deliverableColDefs}
              emptyMsg="No deliverables yet. Agreements with criteria will appear here after AI verification runs."
              onRowClick={handleDeliverableRowClick}
            />
          )}
          {activeTab === 'payments' && (
            <GridPanel
              data={filteredPayments}
              colDefs={paymentColDefs}
              emptyMsg="No payments recorded. Authorize a PayPal payment to see history."
              onRowClick={handlePaymentRowClick}
            />
          )}
          {activeTab === 'approvals' && (
            <GridPanel
              data={filteredApprovals}
              colDefs={approvalColDefs}
              emptyMsg="No pending approvals. All agreements are either approved or not yet submitted."
              onRowClick={handleApprovalRowClick}
            />
          )}
        </div>
      </div>

      {/* Create New Agreement Card (only on Projects tab for customers) */}
      {activeTab === 'projects' && user?.role === 'customer' && (
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
  );
}