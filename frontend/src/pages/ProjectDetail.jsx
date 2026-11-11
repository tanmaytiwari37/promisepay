import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
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

export default function ProjectDetail() {
  const { projectId } = useParams();
  const { user } = useAuth();

  const [project, setProject] = useState(null);
  const [agreement, setAgreement] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Assign freelancer modal/input state
  const [freelancerEmail, setFreelancerEmail] = useState('');
  const [showAssignModal, setShowAssignModal] = useState(false);

  // Load project & agreement data
  const loadProjectData = async () => {
    try {
      setError('');
      const proj = await fetchProject(projectId);
      setProject(proj);

      try {
        const agr = await fetchAgreement(projectId);
        setAgreement(agr);
      } catch {
        // Agreement may not be created yet, perfectly normal
        setAgreement(null);
      }
    } catch (err) {
      setError(err.message || 'Failed to load project details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProjectData();
  }, [projectId]);

  const isCustomer = user?.role === 'customer' || user?.id === project?.customer_id;
  const isFreelancer = user?.role === 'freelancer' || user?.id === project?.freelancer_id;

  // 1. Assign Freelancer
  const handleAssignFreelancer = async (e) => {
    e.preventDefault();
    if (!freelancerEmail) return;
    setActionLoading(true);
    setError('');
    try {
      await assignFreelancer(projectId, freelancerEmail);
      setSuccessMsg(`Freelancer ${freelancerEmail} assigned successfully!`);
      setShowAssignModal(false);
      setFreelancerEmail('');
      await loadProjectData();
    } catch (err) {
      setError(err.message || 'Failed to assign freelancer');
    } finally {
      setActionLoading(false);
    }
  };

  // 2. Generate AI Agreement
  const handleGenerateAgreement = async () => {
    setActionLoading(true);
    setError('');
    try {
      const generated = await generateAgreement(projectId);
      setAgreement(generated);
      setSuccessMsg('AI Agreement generated with deliverables and acceptance criteria!');
      await loadProjectData();
    } catch (err) {
      setError(err.message || 'Failed to generate agreement');
    } finally {
      setActionLoading(false);
    }
  };

  // 3. Submit For Approval (Move DRAFT to PENDING_APPROVAL)
  const handleSubmitForApproval = async () => {
    setActionLoading(true);
    setError('');
    try {
      await submitForApproval(projectId);
      setSuccessMsg('Project submitted for agreement review!');
      await loadProjectData();
    } catch (err) {
      setError(err.message || 'Failed to submit for approval');
    } finally {
      setActionLoading(false);
    }
  };

  // 4. Approve Agreement
  const handleApproveAgreement = async () => {
    setActionLoading(true);
    setError('');
    try {
      await approveAgreement(projectId);
      setSuccessMsg('Agreement approved!');
      await loadProjectData();
    } catch (err) {
      setError(err.message || 'Failed to approve agreement');
    } finally {
      setActionLoading(false);
    }
  };

  // 5. Authorize Payment (PayPal mock)
  const handleAuthorizePayment = async () => {
    setActionLoading(true);
    setError('');
    try {
      await createOrder(projectId);
      await authorizePayment(projectId);
      setSuccessMsg('PayPal payment authorized! Project is now IN PROGRESS.');
      await loadProjectData();
    } catch (err) {
      setError(err.message || 'Failed to authorize payment');
    } finally {
      setActionLoading(false);
    }
  };

  // 6. Customer Final Review / Approval
  const handleCustomerApproval = async () => {
    setActionLoading(true);
    setError('');
    try {
      await reviewProject(projectId, 'approve', 'Customer verified deliverables and approved work.');
      setSuccessMsg('Deliverables approved! You can now capture payment to release funds.');
      await loadProjectData();
    } catch (err) {
      setError(err.message || 'Customer approval failed');
    } finally {
      setActionLoading(false);
    }
  };

  // 7. Capture Payment
  const handleCapturePayment = async () => {
    setActionLoading(true);
    setError('');
    try {
      await capturePayment(projectId);
      setSuccessMsg('Payment successfully captured! Freelancer has been paid.');
      await loadProjectData();
    } catch (err) {
      setError(err.message || 'Failed to capture payment');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="py-24 text-center">
        <div className="w-8 h-8 border-2 border-mint border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
        <p className="text-secondary-text text-sm">Loading agreement space...</p>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="glass-card rounded-2xl p-10 text-center border border-border-card">
        <h2 className="text-xl font-bold text-primary-text mb-2">Agreement not found</h2>
        <p className="text-secondary-text text-sm mb-4">The agreement you are looking for does not exist or you do not have permission.</p>
        <Link to="/dashboard" className="text-mint hover:underline text-sm font-semibold">← Back to Dashboard</Link>
      </div>
    );
  }

  const status = project.status?.toUpperCase();

  return (
    <div className="max-w-6xl mx-auto space-y-7 font-sans">
      {/* Top Breadcrumb & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link to="/dashboard" className="text-muted-text hover:text-mint text-xs font-mono transition-colors">
            ← AGREEMENTS
          </Link>
          <span className="text-muted-text text-xs">/</span>
          <span className="text-primary-text font-bold text-sm truncate max-w-xs">{project.title}</span>
        </div>
        <StatusBadge status={project.status} />
      </div>

      {/* Alerts */}
      {error && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-center justify-between">
          <span>⚠️ {error}</span>
          <button onClick={() => setError('')} className="text-xs">✕</button>
        </div>
      )}

      {successMsg && (
        <div className="p-4 rounded-xl bg-mint/10 border border-mint/20 text-mint text-sm flex items-center justify-between">
          <span>✓ {successMsg}</span>
          <button onClick={() => setSuccessMsg('')} className="text-xs">✕</button>
        </div>
      )}

      {/* Main Project Overview Card */}
      <div className="glass-card rounded-2xl p-6 lg:p-8 border border-border-card">
        <div className="flex flex-col lg:flex-row justify-between lg:items-start gap-6">
          <div className="space-y-2 flex-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-mint uppercase tracking-wider">PROTOCOL AGREEMENT</span>
              <span className="text-xs text-muted-text">• ID #{project.id}</span>
            </div>
            <h1 className="text-2xl lg:text-3xl font-extrabold text-primary-text tracking-tight">
              {project.title}
            </h1>
            <p className="text-secondary-text text-sm leading-relaxed max-w-2xl">
              {project.description || 'No detailed scope description provided.'}
            </p>
          </div>

          <div className="flex flex-wrap lg:flex-col items-start lg:items-end gap-4 p-4 lg:p-0 rounded-xl bg-surface/40 lg:bg-transparent border lg:border-none border-border-card">
            <div>
              <div className="text-[11px] text-muted-text font-mono uppercase tracking-wider">Escrow Volume</div>
              <div className="text-2xl font-extrabold text-mint font-mono mt-0.5">
                ${Number(project.budget).toLocaleString()} <span className="text-xs font-normal text-muted-text">{project.currency || 'USD'}</span>
              </div>
            </div>
            <div>
              <div className="text-[11px] text-muted-text font-mono uppercase tracking-wider">Deadline</div>
              <div className="text-sm font-semibold text-primary-text font-mono mt-0.5">
                {project.deadline ? new Date(project.deadline).toLocaleDateString() : 'Flexible'}
              </div>
            </div>
          </div>
        </div>

        {/* Participant Info Banner */}
        <div className="mt-8 pt-6 border-t border-border-card grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-mint/15 text-mint font-bold text-xs flex items-center justify-center font-mono">
              C
            </div>
            <div>
              <div className="text-[11px] text-muted-text font-mono uppercase">Customer Party</div>
              <div className="text-sm font-semibold text-primary-text">
                User #{project.customer_id} {isCustomer && <span className="text-xs text-mint font-mono">(You)</span>}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-cyan-accent/15 text-cyan-accent font-bold text-xs flex items-center justify-center font-mono">
                F
              </div>
              <div>
                <div className="text-[11px] text-muted-text font-mono uppercase">Freelancer Party</div>
                <div className="text-sm font-semibold text-primary-text">
                  {project.freelancer_id ? (
                    <>User #{project.freelancer_id} {isFreelancer && <span className="text-xs text-cyan-accent font-mono">(You)</span>}</>
                  ) : (
                    <span className="text-muted-text italic">Unassigned</span>
                  )}
                </div>
              </div>
            </div>

            {!project.freelancer_id && isCustomer && (
              <button
                onClick={() => setShowAssignModal(true)}
                className="text-xs bg-surface hover:bg-surface-elevated border border-border-card text-mint px-3.5 py-1.5 rounded-lg font-bold transition-all"
              >
                + Assign Freelancer
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Interactive Workflow Action Center */}
      <div className="glass-card rounded-2xl p-6 border border-border-card">
        <h2 className="text-xs font-mono font-bold text-mint uppercase tracking-wider mb-4">
          Current Protocol Action
        </h2>

        {/* 1. DRAFT State */}
        {status === 'DRAFT' && (
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-surface/50 border border-border-card p-5 rounded-xl">
            <div>
              <h3 className="font-bold text-primary-text text-base">Step 1: Agreement Generation</h3>
              <p className="text-xs text-secondary-text mt-1 max-w-xl">
                {!project.freelancer_id
                  ? 'Assign a freelancer to collaborate, then generate the AI agreement with acceptance criteria.'
                  : !agreement
                  ? 'Generate an AI agreement containing structured deliverables and automated verification criteria.'
                  : 'Agreement generated! Submit it for participant approval.'}
              </p>
            </div>
            <div className="flex items-center gap-3">
              {!agreement ? (
                <button
                  onClick={handleGenerateAgreement}
                  disabled={actionLoading}
                  className="bg-gradient-to-r from-mint to-cyan-accent text-primary-bg px-6 py-2.5 rounded-full font-bold text-sm transition-all shadow-md shadow-mint/20"
                >
                  {actionLoading ? 'Generating...' : '✨ Generate AI Scope'}
                </button>
              ) : (
                isCustomer && (
                  <button
                    onClick={handleSubmitForApproval}
                    disabled={actionLoading}
                    className="bg-gradient-to-r from-mint to-cyan-accent text-primary-bg px-6 py-2.5 rounded-full font-bold text-sm transition-all shadow-md shadow-mint/20"
                  >
                    {actionLoading ? 'Submitting...' : 'Submit For Approval →'}
                  </button>
                )
              )}
            </div>
          </div>
        )}

        {/* 2. PENDING_APPROVAL State */}
        {status === 'PENDING_APPROVAL' && (
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-surface/50 border border-border-card p-5 rounded-xl">
            <div>
              <h3 className="font-bold text-primary-text text-base">Step 2: Sign Agreement Terms</h3>
              <p className="text-xs text-secondary-text mt-1 max-w-xl">
                Both customer and freelancer must approve the agreement terms before funds can be authorized into PayPal escrow.
              </p>
            </div>
            <button
              onClick={handleApproveAgreement}
              disabled={actionLoading}
              className="bg-gradient-to-r from-mint to-cyan-accent text-primary-bg px-6 py-2.5 rounded-full font-bold text-sm transition-all shadow-md shadow-mint/20"
            >
              {actionLoading ? 'Signing...' : '✓ Approve Agreement Terms'}
            </button>
          </div>
        )}

        {/* 3. AGREED State */}
        {status === 'AGREED' && (
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-surface/50 border border-border-card p-5 rounded-xl">
            <div>
              <h3 className="font-bold text-primary-text text-base">Step 3: Authorize Escrow Payment</h3>
              <p className="text-xs text-secondary-text mt-1 max-w-xl">
                {isCustomer
                  ? 'Agreement terms locked! Authorize the PayPal escrow payment to start the project. Funds remain safely in escrow until you approve final delivery.'
                  : 'Agreement terms locked! Waiting for the customer to authorize payment into escrow.'}
              </p>
            </div>
            {isCustomer && (
              <button
                onClick={handleAuthorizePayment}
                disabled={actionLoading}
                className="bg-gradient-to-r from-mint to-cyan-accent text-primary-bg px-6 py-2.5 rounded-full font-bold text-sm transition-all shadow-md shadow-mint/20 flex items-center gap-2"
              >
                {actionLoading ? 'Authorizing...' : '🔒 Authorize PayPal Escrow'}
              </button>
            )}
          </div>
        )}

        {/* 4. IN_PROGRESS / PAYMENT_AUTHORIZED State */}
        {(status === 'IN_PROGRESS' || status === 'PAYMENT_AUTHORIZED') && (
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-surface/50 border border-border-card p-5 rounded-xl">
            <div>
              <h3 className="font-bold text-primary-text text-base">Step 4: Active Work & Submission</h3>
              <p className="text-xs text-secondary-text mt-1 max-w-xl">
                Payment is securely held in escrow. The freelancer can now complete deliverables and submit evidence files.
              </p>
            </div>
            {isFreelancer ? (
              <Link
                to={`/project/${projectId}/submit`}
                className="bg-gradient-to-r from-mint to-cyan-accent text-primary-bg px-6 py-2.5 rounded-full font-bold text-sm transition-all shadow-md shadow-mint/20 flex items-center gap-2"
              >
                📤 Submit Deliverable Files
              </Link>
            ) : (
              <span className="text-xs font-mono bg-surface text-secondary-text px-4 py-2 rounded-lg border border-border-card">
                Waiting for freelancer submission
              </span>
            )}
          </div>
        )}

        {/* 5. SUBMITTED State */}
        {status === 'SUBMITTED' && (
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-surface/50 border border-border-card p-5 rounded-xl">
            <div>
              <h3 className="font-bold text-primary-text text-base">Step 5: Run AI Verification Audit</h3>
              <p className="text-xs text-secondary-text mt-1 max-w-xl">
                Deliverables submitted! Open the AI verification audit to evaluate evidence against acceptance criteria.
              </p>
            </div>
            <Link
              to={`/project/${projectId}/verify`}
              className="bg-gradient-to-r from-cyan-accent to-mint text-primary-bg px-6 py-2.5 rounded-full font-bold text-sm transition-all shadow-md shadow-cyan-accent/20 flex items-center gap-2"
            >
              🤖 Open AI Verification Audit →
            </Link>
          </div>
        )}

        {/* 6. UNDER_REVIEW State */}
        {status === 'UNDER_REVIEW' && (
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-surface/50 border border-border-card p-5 rounded-xl">
            <div>
              <h3 className="font-bold text-primary-text text-base">Step 6: Customer Final Approval</h3>
              <p className="text-xs text-secondary-text mt-1 max-w-xl">
                AI audit complete. Customer reviews the evidence and has final decision authority to approve or request changes.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Link
                to={`/project/${projectId}/verify`}
                className="bg-surface hover:bg-surface-elevated text-primary-text border border-border-card px-4 py-2.5 rounded-full text-xs font-bold"
              >
                View Audit Report
              </Link>
              {isCustomer && (
                <button
                  onClick={handleCustomerApproval}
                  disabled={actionLoading}
                  className="bg-gradient-to-r from-mint to-cyan-accent text-primary-bg px-6 py-2.5 rounded-full font-bold text-sm transition-all shadow-md shadow-mint/20"
                >
                  {actionLoading ? 'Approving...' : '✓ Approve Completed Work'}
                </button>
              )}
            </div>
          </div>
        )}

        {/* 7. APPROVED State */}
        {status === 'APPROVED' && (
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-surface/50 border border-border-card p-5 rounded-xl">
            <div>
              <h3 className="font-bold text-primary-text text-base">Step 7: Capture PayPal Payment</h3>
              <p className="text-xs text-secondary-text mt-1 max-w-xl">
                Deliverables officially approved! Customer can now trigger payment capture to release funds from escrow to the freelancer.
              </p>
            </div>
            {isCustomer && (
              <button
                onClick={handleCapturePayment}
                disabled={actionLoading}
                className="bg-gradient-to-r from-mint to-cyan-accent text-primary-bg px-7 py-3 rounded-full font-extrabold text-sm transition-all shadow-xl shadow-mint/25"
              >
                {actionLoading ? 'Capturing Funds...' : '💸 Capture & Release Payment'}
              </button>
            )}
          </div>
        )}

        {/* 8. PAID State */}
        {status === 'PAID' && (
          <div className="p-5 rounded-xl bg-mint/10 border border-mint/20 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-2xl">🎉</span>
              <div>
                <h3 className="font-bold text-mint text-base">Escrow Released & Project Completed</h3>
                <p className="text-xs text-secondary-text mt-0.5">
                  Payment of ${Number(project.budget).toLocaleString()} successfully captured via PayPal.
                </p>
              </div>
            </div>
            <Link
              to={`/project/${projectId}/verify`}
              className="text-xs text-mint hover:underline font-bold font-mono"
            >
              Audit Archive →
            </Link>
          </div>
        )}
      </div>

      {/* Agreement Deliverables & Criteria Display */}
      {agreement && (
        <div className="glass-card rounded-2xl p-6 lg:p-8 space-y-6 border border-border-card">
          <div className="flex items-center justify-between border-b border-border-card pb-4">
            <div>
              <h2 className="text-xl font-bold text-primary-text tracking-tight">Contractual Deliverables & Criteria</h2>
              <p className="text-xs text-muted-text font-mono mt-0.5">
                Version {agreement.version || 1} • AI Verified Architecture
              </p>
            </div>
            <span className="text-xs font-mono font-bold bg-mint/10 text-mint border border-mint/20 px-3 py-1 rounded-full">
              SECURED SCOPE
            </span>
          </div>

          {/* Deliverables List */}
          <div className="space-y-4">
            {agreement.deliverables && agreement.deliverables.map((del, idx) => (
              <div key={del.id || idx} className="bg-surface/40 border border-border-card rounded-xl p-5">
                <div className="flex items-start justify-between gap-4 mb-2">
                  <h3 className="font-bold text-primary-text text-base flex items-center gap-2.5">
                    <span className="text-xs font-mono w-6 h-6 rounded-lg bg-mint/15 text-mint flex items-center justify-center font-bold">
                      {idx + 1}
                    </span>
                    {del.title}
                  </h3>
                </div>
                <p className="text-xs text-secondary-text mb-4 ml-8 leading-relaxed">
                  {del.description}
                </p>

                {/* Criteria for this deliverable */}
                <div className="ml-8 space-y-2">
                  <div className="text-[10px] font-mono font-bold text-muted-text uppercase tracking-wider">
                    Acceptance Criteria:
                  </div>
                  {agreement.acceptance_criteria &&
                    agreement.acceptance_criteria
                      .filter(c => c.deliverable_id === del.id || !c.deliverable_id)
                      .map((crit, cIdx) => (
                        <div
                          key={crit.id || cIdx}
                          className="flex items-start gap-2.5 text-xs text-secondary-text bg-card-bg/80 p-3 rounded-lg border border-border-card"
                        >
                          <span className="text-mint font-bold mt-0.5">✓</span>
                          <span className="flex-1">{crit.criterion}</span>
                        </div>
                      ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal: Assign Freelancer */}
      {showAssignModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4">
          <div className="glass-card rounded-2xl p-7 max-w-md w-full shadow-2xl border border-border-subtle">
            <h3 className="text-lg font-bold text-primary-text mb-2">Assign Freelancer</h3>
            <p className="text-xs text-secondary-text mb-4">
              Enter the registered email of the freelancer to grant workspace and submission access.
            </p>
            <form onSubmit={handleAssignFreelancer} className="space-y-4">
              <input
                type="email"
                required
                placeholder="freelancer@demo.com"
                value={freelancerEmail}
                onChange={(e) => setFreelancerEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-surface border border-border-card text-primary-text placeholder-muted-text text-sm focus:outline-none focus:border-mint focus:ring-1 focus:ring-mint"
              />
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAssignModal(false)}
                  className="px-4 py-2 rounded-xl text-secondary-text hover:text-primary-text text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="bg-gradient-to-r from-mint to-cyan-accent text-primary-bg px-6 py-2.5 rounded-full text-xs font-bold transition-all shadow-md shadow-mint/20"
                >
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
