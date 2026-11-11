import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { verifyProject, fetchReports, fetchProject, reviewProject } from '../api/services';
import { useAuth } from '../context/AuthContext';
import StatusBadge from '../components/ui/StatusBadge';

export default function VerificationReport() {
  const { projectId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [project, setProject] = useState(null);
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');
  const [approvalSuccess, setApprovalSuccess] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const loadVerificationData = async () => {
      try {
        setLoading(true);
        setError('');

        const proj = await fetchProject(projectId);
        if (isMounted) setProject(proj);

        // First check if an existing report is saved
        try {
          const reports = await fetchReports(projectId);
          if (reports && reports.length > 0) {
            if (isMounted) setReport(reports[reports.length - 1]);
            return;
          }
        } catch {
          // Fall through to run verification
        }

        // Trigger verify endpoint to generate/fetch report
        const verifyData = await verifyProject(projectId);
        if (isMounted) setReport(verifyData);
      } catch (err) {
        if (isMounted) setError(err.message || 'Failed to retrieve AI verification audit.');
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    if (projectId) {
      loadVerificationData();
    }
    return () => { isMounted = false; };
  }, [projectId]);

  // Handle Customer Final Approval
  const handleCustomerApproval = async () => {
    setActionLoading(true);
    setError('');
    try {
      await reviewProject(projectId, 'approve', 'Customer reviewed AI verification report and approved deliverables.');
      setApprovalSuccess(true);
      setTimeout(() => {
        navigate(`/project/${projectId}`);
      }, 1500);
    } catch (err) {
      setError(err.message || 'Approval action failed');
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const s = status?.toLowerCase();
    if (s === 'completed' || s === 'passed' || s === 'met') {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold bg-mint/15 text-mint border border-mint/30">
          <span className="w-1.5 h-1.5 rounded-full bg-mint"></span>
          Completed
        </span>
      );
    }
    if (s === 'missing' || s === 'failed' || s === 'unmet') {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold bg-red-500/15 text-red-400 border border-red-500/30">
          <span className="w-1.5 h-1.5 rounded-full bg-red-400"></span>
          Missing
        </span>
      );
    }
    if (s === 'uncertain' || s === 'partial' || s === 'warning') {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
          Uncertain
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold bg-blue-500/15 text-blue-300 border border-blue-500/30">
        <span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span>
        Informational
      </span>
    );
  };

  if (loading) {
    return (
      <div className="py-24 text-center max-w-xl mx-auto space-y-4 font-sans">
        <div className="w-10 h-10 border-2 border-mint border-t-transparent rounded-full animate-spin mx-auto"></div>
        <h3 className="text-lg font-bold text-primary-text">Analyzing Deliverable Evidence...</h3>
        <p className="text-xs text-secondary-text font-mono">
          Executing automated criteria tests. AI operates as an impartial advisory auditor.
        </p>
      </div>
    );
  }

  const isCustomer = user?.role === 'customer' || user?.id === project?.customer_id;
  const verificationDetails = report?.verification;

  return (
    <div className="max-w-4xl mx-auto space-y-7 font-sans">
      {/* Breadcrumb & Navigation */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Link to={`/project/${projectId}`} className="text-xs font-mono text-muted-text hover:text-mint transition-colors">
            ← AGREEMENT SPACE
          </Link>
          <span className="text-muted-text text-xs">/</span>
          <span className="text-xs font-mono text-mint font-medium">AI AUDIT REPORT</span>
        </div>
        {project && <StatusBadge status={project.status} />}
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-start gap-2.5">
          <span>⚠️</span>
          <span className="flex-1">{error}</span>
        </div>
      )}

      {approvalSuccess && (
        <div className="p-4 rounded-xl bg-mint/10 border border-mint/20 text-mint text-sm flex items-center gap-2.5">
          <span>✓</span>
          <span>Customer approval recorded! Returning to workspace for payment capture...</span>
        </div>
      )}

      {/* Main Audit Header Card */}
      <div className="glass-card rounded-2xl p-8 border border-border-card space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-surface border border-mint/30 flex items-center justify-center text-3xl text-mint shadow-lg shadow-mint/10">
              🤖
            </div>
            <div>
              <div className="text-xs font-mono text-mint uppercase tracking-wider">OFFICIAL AUDIT REPORT</div>
              <h1 className="text-2xl font-extrabold text-primary-text tracking-tight mt-0.5">
                AI Deliverables Verification
              </h1>
              <p className="text-xs text-secondary-text font-mono mt-0.5">
                Report #{report?.report_id || 1} • {report?.created_at ? new Date(report.created_at).toLocaleString() : 'Recent'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold px-3 py-1.5 rounded-full bg-mint/15 text-mint border border-mint/30">
              ● Evidence Evaluated
            </span>
          </div>
        </div>

        {/* Advisory rule notification box */}
        <div className="p-4 rounded-xl bg-surface/80 border border-border-card text-xs text-secondary-text leading-relaxed">
          <strong className="text-primary-text font-semibold flex items-center gap-1.5 mb-1 font-mono">
            <span>⚖️</span> GOVERNANCE CHARTER:
          </strong>
          This verification audit is <span className="text-mint font-semibold">strictly advisory</span>. In accordance with PromisePay governance, artificial intelligence cannot independently authorize or capture escrowed funds. The customer holds exclusive approval authority.
        </div>
      </div>

      {/* Overall Summary */}
      {verificationDetails?.overall_summary && (
        <div className="glass-card rounded-2xl p-6 border border-border-card space-y-2">
          <h2 className="text-xs font-mono font-bold text-mint uppercase tracking-wider">
            Executive Summary
          </h2>
          <p className="text-sm text-primary-text leading-relaxed font-sans">
            {verificationDetails.overall_summary}
          </p>
        </div>
      )}

      {/* Acceptance Criteria Breakdown */}
      <div className="glass-card rounded-2xl p-6 lg:p-8 space-y-5 border border-border-card">
        <div className="flex items-center justify-between border-b border-border-card pb-4">
          <h2 className="text-base font-bold text-primary-text tracking-tight">Contractual Criteria Breakdown</h2>
          <span className="text-xs font-mono text-muted-text">
            {verificationDetails?.criteria?.length || 0} Test Items
          </span>
        </div>

        {verificationDetails?.criteria && verificationDetails.criteria.length > 0 ? (
          <div className="space-y-4">
            {verificationDetails.criteria.map((item, idx) => (
              <div
                key={item.criterion_id || idx}
                className="bg-surface/40 border border-border-card rounded-xl p-5 space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="font-bold text-primary-text text-sm flex items-center gap-2.5">
                    <span className="text-xs font-mono text-muted-text">#{idx + 1}</span>
                    <span>{item.criterion_id || `Criterion ${idx + 1}`}</span>
                  </div>
                  <div>{getStatusBadge(item.status)}</div>
                </div>

                {item.reasoning && (
                  <div className="text-xs text-secondary-text">
                    <span className="text-muted-text font-mono font-medium">Analysis: </span>
                    {item.reasoning}
                  </div>
                )}

                {item.evidence && (
                  <div className="bg-card-bg/90 p-3 rounded-lg border border-border-card text-xs text-secondary-text font-mono overflow-x-auto">
                    <span className="text-mint block mb-1 font-bold">Quoted Evidence:</span>
                    "{item.evidence}"
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="p-6 text-center text-xs text-muted-text bg-surface/30 rounded-xl font-mono">
            No specific criteria details available in this report payload.
          </div>
        )}

        {/* Improvement Suggestions */}
        {verificationDetails?.improvement_suggestions && verificationDetails.improvement_suggestions.length > 0 && (
          <div className="pt-4 border-t border-border-card space-y-2">
            <h3 className="text-xs font-mono font-bold text-cyan-accent uppercase tracking-wider">
              Auditor Recommendations
            </h3>
            <ul className="list-disc list-inside text-xs text-secondary-text space-y-1 font-sans">
              {verificationDetails.improvement_suggestions.map((sug, i) => (
                <li key={i}>{sug}</li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Customer Final Decision Action Section */}
      {isCustomer && (
        <div className="glass-card rounded-2xl p-7 border border-mint/30 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-5 bg-gradient-to-r from-card-bg to-surface">
          <div className="space-y-1 text-center sm:text-left">
            <h3 className="text-base font-bold text-primary-text">Accept & Approve Deliverables?</h3>
            <p className="text-xs text-secondary-text max-w-lg">
              Approving confirms work meets contractual standards and unlocks payment capture in the project workspace.
            </p>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              onClick={handleCustomerApproval}
              disabled={actionLoading || approvalSuccess}
              className="w-full sm:w-auto bg-gradient-to-r from-mint to-cyan-accent text-primary-bg font-extrabold py-3.5 px-8 rounded-full text-sm transition-all shadow-xl shadow-mint/25 disabled:opacity-50"
            >
              {actionLoading ? 'Approving...' : '✓ Approve Deliverables'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
