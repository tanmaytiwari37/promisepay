import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  fetchProject,
  fetchAgreement,
  generateAgreement,
  approveAgreement,
  assignFreelancer,
  submitForApproval,
  createOrder,
  authorizePayment,
  capturePayment,
  reviewProject,
} from '../api/services';
import StatusBadge from '../components/ui/StatusBadge';

// Shared style tokens (moved outside component for reuse)
const C = {
  card: {
    background: 'rgba(15,30,50,0.80)',
    border: '1px solid rgba(148,163,184,0.10)',
    borderRadius: '20px',
    padding: '28px',
  },
  innerCard: {
    background: 'rgba(19,34,54,0.60)',
    border: '1px solid rgba(148,163,184,0.09)',
    borderRadius: '14px',
    padding: '20px',
  },
  btn: {
    background: 'linear-gradient(135deg, #2dd4bf 0%, #22d3ee 100%)',
    color: '#07111f', fontWeight: '800', padding: '12px 22px', borderRadius: '12px',
    fontSize: '13px', border: 'none', cursor: 'pointer',
    boxShadow: '0 4px 20px rgba(45,212,191,0.22)',
    display: 'inline-flex', alignItems: 'center', gap: '8px', transition: 'all 0.15s',
  },
  btnOutline: {
    background: 'rgba(19,34,54,0.60)', border: '1px solid rgba(148,163,184,0.15)',
    color: '#94a3b8', fontWeight: '700', padding: '11px 22px', borderRadius: '12px',
    fontSize: '13px', cursor: 'pointer',
    display: 'inline-flex', alignItems: 'center', gap: '8px',
  },
  btnDanger: {
    background: 'rgba(239,68,68,0.10)', border: '1px solid rgba(239,68,68,0.22)',
    color: '#f87171', fontWeight: '700', padding: '11px 22px', borderRadius: '12px',
    fontSize: '13px', cursor: 'pointer',
    display: 'inline-flex', alignItems: 'center', gap: '8px',
  },
  btnSuccess: {
    background: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.25)',
    color: '#4ade80', fontWeight: '800', padding: '12px 22px', borderRadius: '12px',
    fontSize: '13px', cursor: 'pointer',
    display: 'inline-flex', alignItems: 'center', gap: '8px',
  },
  inputStyle: {
    width: '100%', padding: '12px 16px', borderRadius: '12px', fontSize: '14px',
    background: 'rgba(19,34,54,0.80)', border: '1px solid rgba(148,163,184,0.14)',
    color: '#f1f5f9', outline: 'none', fontFamily: 'Inter, sans-serif',
  },
  label: { fontSize: '10px', fontWeight: '700', color: '#4e6580', textTransform: 'uppercase', letterSpacing: '0.08em', fontFamily: 'monospace' },
};

export default function ProjectDetail() {
  const { projectId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [project, setProject] = useState(null);
  const [agreement, setAgreement] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [freelancerEmail, setFreelancerEmail] = useState('');
  const [showAssignModal, setShowAssignModal] = useState(false);

  const loadProjectData = async () => {
    try {
      setError('');
      const proj = await fetchProject(projectId);
      setProject(proj);
      try {
        const agr = await fetchAgreement(projectId);
        setAgreement(agr);
      } catch { setAgreement(null); }
    } catch (err) {
      setError(err.message || 'Failed to load project details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadProjectData(); }, [projectId]);

  const isCustomer = user?.role === 'customer' || user?.id === project?.customer_id;
  const isFreelancer = user?.role === 'freelancer' || user?.id === project?.freelancer_id;
  const status = project?.status?.toUpperCase();

  const doAction = async (fn, successText) => {
    setActionLoading(true); setError(''); setSuccessMsg('');
    try { await fn(); setSuccessMsg(successText); await loadProjectData(); }
    catch (err) { setError(err.message || 'Action failed'); }
    finally { setActionLoading(false); }
  };

  const handleAssignFreelancer = async (e) => {
    e.preventDefault();
    if (!freelancerEmail) return;
    await doAction(async () => {
      await assignFreelancer(projectId, freelancerEmail);
      setShowAssignModal(false); setFreelancerEmail('');
    }, `Freelancer ${freelancerEmail} assigned!`);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="w-10 h-10 rounded-full border-2 border-t-transparent animate-spin"
          style={{ borderColor: '#2dd4bf', borderTopColor: 'transparent' }} />
        <span className="text-sm font-mono" style={{ color: '#94a3b8' }}>Loading workspace...</span>
      </div>
    );
  }

  if (error && !project) {
    return (
      <div className="max-w-2xl mx-auto space-y-4">
        <div style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.20)', borderRadius: '14px', padding: '20px', color: '#f87171' }}>
          ⚠ {error}
        </div>
        <Link to="/dashboard" className="text-sm font-bold text-mint hover:underline">← Back to Dashboard</Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Breadcrumb + Title */}
      <div>
        <div className="flex items-center gap-2 mb-2 text-xs font-mono">
          <Link to="/dashboard" style={{ color: '#4e6580' }} className="hover:text-mint transition-colors">← DASHBOARD</Link>
          <span style={{ color: '#4e6580' }}>/</span>
          <span style={{ color: '#2dd4bf' }}>PROJECT #{projectId}</span>
        </div>
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-primary-text tracking-tight">{project?.title}</h1>
            <p className="text-sm mt-1" style={{ color: '#94a3b8' }}>{project?.description}</p>
          </div>
          <StatusBadge status={project?.status} />
        </div>
      </div>

      {/* Alerts */}
      {error && (
        <div style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.20)', borderRadius: '12px', padding: '14px 18px', color: '#f87171', fontSize: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>⚠ {error}</span>
          <button onClick={() => setError('')} style={{ background: 'none', border: 'none', color: '#f87171', cursor: 'pointer', fontSize: '16px' }}>×</button>
        </div>
      )}
      {successMsg && (
        <div style={{ background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.22)', borderRadius: '12px', padding: '14px 18px', color: '#4ade80', fontSize: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>✓ {successMsg}</span>
          <button onClick={() => setSuccessMsg('')} style={{ background: 'none', border: 'none', color: '#4ade80', cursor: 'pointer', fontSize: '16px' }}>×</button>
        </div>
      )}

      {/* Project Info Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: 'Escrow Amount', value: `$${Number(project?.budget || 0).toLocaleString()} ${project?.currency || 'USD'}`, accent: '#2dd4bf' },
          { label: 'Deadline', value: project?.deadline ? new Date(project.deadline).toLocaleDateString() : 'Flexible', accent: '#f59e0b' },
          { label: 'Freelancer', value: project?.freelancer_email || project?.freelancer?.email || 'Not assigned', accent: '#8b5cf6' },
        ].map((m) => (
          <div key={m.label} style={C.card}>
            <div style={C.label}>{m.label}</div>
            <div className="text-base font-black mt-2" style={{ color: m.accent }}>{m.value}</div>
          </div>
        ))}
      </div>

      {/* Action Center */}
      <div style={C.card}>
        <div className="flex items-center gap-2 mb-5" style={{ borderBottom: '1px solid rgba(148,163,184,0.09)', paddingBottom: '18px' }}>
          <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: 'rgba(45,212,191,0.10)', border: '1px solid rgba(45,212,191,0.20)' }}>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="#2dd4bf">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <div>
            <div className="font-black text-primary-text text-base">Action Center</div>
            <div className="text-xs font-mono" style={{ color: '#4e6580' }}>Available actions for current status: {project?.status}</div>
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          {/* Customer: Assign Freelancer */}
          {isCustomer && !project?.freelancer_id && !['PAID', 'CANCELLED'].includes(status) && (
            <button onClick={() => setShowAssignModal(true)} style={C.btnOutline}>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" /></svg>
              Assign Freelancer
            </button>
          )}

          {/* Customer: Generate AI Agreement */}
          {isCustomer && !agreement && status === 'DRAFT' && (
            <button onClick={() => doAction(() => generateAgreement(projectId), 'AI Agreement generated!')} disabled={actionLoading} style={C.btn}>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>
              {actionLoading ? 'Generating...' : 'Generate AI Agreement'}
            </button>
          )}

          {/* Customer: Submit for Approval */}
          {isCustomer && agreement && status === 'DRAFT' && (
            <button onClick={() => doAction(() => submitForApproval(projectId), 'Submitted for approval!')} disabled={actionLoading} style={C.btn}>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
              {actionLoading ? 'Submitting...' : 'Submit for Approval'}
            </button>
          )}

          {/* Customer: Approve Agreement */}
          {isCustomer && status === 'PENDING_APPROVAL' && (
            <button onClick={() => doAction(() => approveAgreement(projectId), 'Agreement approved!')} disabled={actionLoading} style={C.btnSuccess}>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              {actionLoading ? 'Approving...' : 'Approve Agreement'}
            </button>
          )}

          {/* Freelancer: Approve Agreement */}
          {isFreelancer && status === 'PENDING_APPROVAL' && (
            <button onClick={() => doAction(() => approveAgreement(projectId), 'Agreement approved!')} disabled={actionLoading} style={C.btnSuccess}>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              {actionLoading ? 'Approving...' : 'Approve Agreement'}
            </button>
          )}

          {/* Customer: Authorize Payment */}
          {isCustomer && status === 'AGREED' && (
            <button
              onClick={async () => {
                setActionLoading(true);
                setError('');
                try {
                  const order = await createOrder(projectId);
                  if (order.approval_url) {
                    // Redirect to PayPal for customer approval
                    window.location.href = order.approval_url;
                  } else {
                    setError('No approval URL returned from PayPal. Try again or check mock mode.');
                  }
                } catch (err) {
                  setError(err.message || 'Failed to create PayPal order');
                } finally {
                  setActionLoading(false);
                }
              }}
              disabled={actionLoading}
              style={C.btn}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>
              {actionLoading ? 'Redirecting...' : 'Authorize PayPal Payment'}
            </button>
          )}

          {/* Freelancer: Submit Work */}
          {isFreelancer && ['PAYMENT_AUTHORIZED', 'IN_PROGRESS'].includes(status) && (
            <button onClick={() => navigate(`/project/${projectId}/submit`)} style={C.btn}>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>
              Submit Deliverables
            </button>
          )}

          {/* Customer: Run AI Verification */}
          {isCustomer && ['SUBMITTED', 'UNDER_REVIEW'].includes(status) && (
            <button onClick={() => navigate(`/project/${projectId}/verify`)} style={C.btn}>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>
              Run AI Verification
            </button>
          )}

          {/* Customer: Approve & Capture */}
          {isCustomer && status === 'APPROVED' && (
            <>
              <button
                onClick={() => doAction(() => capturePayment(projectId), 'Payment captured! Funds released to freelancer.')}
                disabled={actionLoading}
                style={C.btnSuccess}
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                {actionLoading ? 'Processing...' : '🔒 Capture Payment (Release Funds)'}
              </button>
              <button
                onClick={() => doAction(() => reviewProject(projectId, 'reject', 'Customer rejected — requesting revision.'), 'Revision requested.')}
                disabled={actionLoading}
                style={C.btnDanger}
              >
                Request Revision
              </button>
            </>
          )}

          {/* Customer: Final approval after UNDER_REVIEW */}
          {isCustomer && status === 'UNDER_REVIEW' && (
            <button
              onClick={() => doAction(() => reviewProject(projectId, 'approve', 'Customer verified deliverables.'), 'Deliverables approved!')}
              disabled={actionLoading}
              style={C.btnSuccess}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
              {actionLoading ? 'Approving...' : 'Approve Deliverables'}
            </button>
          )}

          {/* View Verification Report */}
          {['SUBMITTED', 'UNDER_REVIEW', 'APPROVED', 'PAID'].includes(status) && (
            <Link
              to={`/project/${projectId}/verify`}
              style={C.btnOutline}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
              View Verification Report
            </Link>
          )}
        </div>

        {actionLoading && (
          <div className="flex items-center gap-3 mt-4 pt-4" style={{ borderTop: '1px solid rgba(148,163,184,0.09)' }}>
            <div className="w-4 h-4 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: '#2dd4bf', borderTopColor: 'transparent' }} />
            <span className="text-sm font-mono" style={{ color: '#94a3b8' }}>Processing...</span>
          </div>
        )}
      </div>

      {/* Agreement Display */}
      {agreement && (
        <div style={C.card} className="space-y-5">
          <div className="flex items-center justify-between" style={{ borderBottom: '1px solid rgba(148,163,184,0.09)', paddingBottom: '16px' }}>
            <div>
              <h2 className="text-lg font-black text-primary-text">Contractual Deliverables & Criteria</h2>
              <p className="text-xs font-mono mt-0.5" style={{ color: '#4e6580' }}>Version {agreement.version || 1} • AI-Generated Scope</p>
            </div>
            <span className="text-xs font-mono font-bold px-3 py-1 rounded-full" style={{ background: 'rgba(45,212,191,0.10)', color: '#2dd4bf', border: '1px solid rgba(45,212,191,0.22)' }}>
              SECURED
            </span>
          </div>

          {/* Deliverables */}
          {Array.isArray(agreement.deliverables) && agreement.deliverables.map((del, idx) => (
            <div key={del.id || idx} style={C.innerCard}>
              <div className="flex items-start gap-3 mb-3">
                <span className="w-6 h-6 rounded-lg flex items-center justify-center text-xs font-black font-mono shrink-0" style={{ background: 'rgba(45,212,191,0.12)', color: '#2dd4bf' }}>{idx + 1}</span>
                <div>
                  <div className="font-bold text-primary-text text-sm">{del.title}</div>
                  <div className="text-xs mt-0.5" style={{ color: '#94a3b8' }}>{del.description}</div>
                </div>
              </div>
              {Array.isArray(agreement.acceptance_criteria) && (
                <div className="ml-9 space-y-2">
                  <div style={{ ...C.label, marginBottom: '8px' }}>Acceptance Criteria</div>
                  {agreement.acceptance_criteria
                    .filter(c => c.deliverable_id === del.id || !c.deliverable_id)
                    .map((crit, ci) => (
                      <div key={crit.id || ci} className="flex items-start gap-2 text-xs" style={{ background: 'rgba(10,22,40,0.60)', border: '1px solid rgba(148,163,184,0.08)', borderRadius: '10px', padding: '10px 14px' }}>
                        <span style={{ color: '#2dd4bf', fontWeight: '700', marginTop: '1px' }}>✓</span>
                        <span style={{ color: '#94a3b8' }}>{crit.criterion}</span>
                      </div>
                    ))}
                </div>
              )}
            </div>
          ))}

          {/* Fallback: raw agreement content */}
          {!Array.isArray(agreement.deliverables) && (
            <div style={C.innerCard}>
              <pre className="text-xs whitespace-pre-wrap font-sans" style={{ color: '#94a3b8', margin: 0 }}>
                {typeof agreement === 'object' ? JSON.stringify(agreement, null, 2) : String(agreement)}
              </pre>
            </div>
          )}
        </div>
      )}

      {/* Assign Freelancer Modal */}
      {showAssignModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.80)', backdropFilter: 'blur(12px)' }}>
          <div style={{ ...C.card, maxWidth: '480px', width: '100%', boxShadow: '0 24px 80px rgba(0,0,0,0.60)' }}>
            <h3 className="text-lg font-black text-primary-text mb-1">Assign Freelancer</h3>
            <p className="text-xs mb-5" style={{ color: '#94a3b8' }}>
              Enter the registered email of the freelancer to grant workspace and submission access.
            </p>
            <form onSubmit={handleAssignFreelancer} className="space-y-4">
              <input
                type="email" required placeholder="freelancer@example.com"
                value={freelancerEmail} onChange={(e) => setFreelancerEmail(e.target.value)}
                style={C.inputStyle}
                onFocus={(e) => { e.target.style.borderColor = 'rgba(45,212,191,0.5)'; }}
                onBlur={(e) => { e.target.style.borderColor = 'rgba(148,163,184,0.14)'; }}
              />
              <div className="flex justify-end gap-3">
                <button type="button" onClick={() => setShowAssignModal(false)} style={C.btnOutline}>Cancel</button>
                <button type="submit" disabled={actionLoading} style={C.btn}>
                  {actionLoading ? 'Assigning...' : 'Confirm Assignment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
