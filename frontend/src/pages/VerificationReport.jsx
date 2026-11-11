import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { verifyProject, fetchReports, fetchProject, reviewProject } from '../api/services';
import { useAuth } from '../context/AuthContext';
import StatusBadge from '../components/ui/StatusBadge';

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
    color: '#07111f',
    fontWeight: '800',
    padding: '12px 24px',
    borderRadius: '12px',
    fontSize: '13px',
    border: 'none',
    cursor: 'pointer',
    boxShadow: '0 4px 20px rgba(45,212,191,0.22)',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
  },
  btnOutline: {
    background: 'rgba(19,34,54,0.60)',
    border: '1px solid rgba(148,163,184,0.15)',
    color: '#94a3b8',
    fontWeight: '700',
    padding: '11px 22px',
    borderRadius: '12px',
    fontSize: '13px',
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
};

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

        try {
          const reports = await fetchReports(projectId);
          if (reports && reports.length > 0) {
            if (isMounted) setReport(reports[reports.length - 1]);
            return;
          }
        } catch {
          // Fall through to verifyProject
        }

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
        <span
          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold"
          style={{ background: 'rgba(45,212,191,0.12)', color: '#2dd4bf', border: '1px solid rgba(45,212,191,0.25)' }}
        >
          <span className="w-1.5 h-1.5 rounded-full" style={{ background: '#2dd4bf' }} />
          Completed
        </span>
      );
    }
    if (s === 'missing' || s === 'failed' || s === 'unmet') {
      return (
        <span
          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold"
          style={{ background: 'rgba(239,68,68,0.12)', color: '#f87171', border: '1px solid rgba(239,68,68,0.25)' }}
        >
          <span className="w-1.5 h-1.5 rounded-full" style={{ background: '#f87171' }} />
          Missing
        </span>
      );
    }
    if (s === 'uncertain' || s === 'partial' || s === 'warning') {
      return (
        <span
          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold"
          style={{ background: 'rgba(245,158,11,0.12)', color: '#fbbf24', border: '1px solid rgba(245,158,11,0.25)' }}
        >
          <span className="w-1.5 h-1.5 rounded-full" style={{ background: '#fbbf24' }} />
          Uncertain
        </span>
      );
    }
    return (
      <span
        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold"
        style={{ background: 'rgba(59,130,246,0.12)', color: '#60a5fa', border: '1px solid rgba(59,130,246,0.25)' }}
      >
        <span className="w-1.5 h-1.5 rounded-full" style={{ background: '#60a5fa' }} />
        Informational
      </span>
    );
  };

  if (loading) {
    return (
      <div className="py-24 text-center max-w-xl mx-auto space-y-4">
        <div className="w-10 h-10 border-2 border-t-transparent rounded-full animate-spin mx-auto"
          style={{ borderColor: '#2dd4bf', borderTopColor: 'transparent' }} />
        <h3 className="text-lg font-bold text-primary-text">Analyzing Deliverable Evidence...</h3>
        <p className="text-xs font-mono" style={{ color: '#94a3b8' }}>
          Executing automated criteria tests. AI operates as an impartial advisory auditor.
        </p>
      </div>
    );
  }

  const isCustomer = user?.role === 'customer' || user?.id === project?.customer_id;
  const verificationDetails = report?.verification;

  return (
    <div className="max-w-4xl mx-auto space-y-7">
      {/* Breadcrumb & Navigation */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs font-mono">
          <Link to={`/project/${projectId}`} style={{ color: '#4e6580' }} className="hover:text-mint transition-colors">
            ← AGREEMENT SPACE
          </Link>
          <span style={{ color: '#4e6580' }}>/</span>
          <span style={{ color: '#2dd4bf' }}>AI AUDIT REPORT</span>
        </div>
        <StatusBadge status={project?.status} />
      </div>

      {/* Header Banner */}
      <div>
        <h1 className="text-2xl font-black text-primary-text tracking-tight">
          AI Deliverable Verification Audit
        </h1>
        <p className="text-sm mt-1" style={{ color: '#94a3b8' }}>
          Objective automated evaluation of submitted proof against contractual acceptance criteria.
        </p>
      </div>

      {error && (
        <div style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.20)', borderRadius: '12px', padding: '14px 18px', color: '#f87171', fontSize: '14px' }}>
          ⚠ {error}
        </div>
      )}

      {approvalSuccess && (
        <div style={{ background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.22)', borderRadius: '12px', padding: '14px 18px', color: '#4ade80', fontSize: '14px' }}>
          ✓ Deliverables approved! Returning to project space...
        </div>
      )}

      {/* AI Governance Advisory Disclaimer */}
      <div
        className="rounded-2xl p-5 flex items-start gap-4 text-xs leading-relaxed"
        style={{
          background: 'rgba(19,34,54,0.6)',
          border: '1px solid rgba(148,163,184,0.12)',
          color: '#94a3b8',
        }}
      >
        <span className="text-xl" style={{ color: '#2dd4bf' }}>⚖️</span>
        <div>
          <strong className="text-primary-text font-mono uppercase tracking-wider block mb-0.5">
            PromisePay Governance Charter Notice
          </strong>
          This verification audit is strictly <span style={{ color: '#2dd4bf' }} className="font-semibold">advisory</span>. In accordance with PromisePay governance, artificial intelligence cannot independently authorize or capture escrowed funds. The customer holds exclusive approval authority.
        </div>
      </div>

      {/* Overall Summary */}
      {verificationDetails?.overall_summary && (
        <div style={C.card} className="space-y-2">
          <h2 className="text-xs font-mono font-bold uppercase tracking-wider" style={{ color: '#2dd4bf' }}>
            Executive Summary
          </h2>
          <p className="text-sm leading-relaxed text-primary-text">
            {verificationDetails.overall_summary}
          </p>
        </div>
      )}

      {/* Acceptance Criteria Breakdown */}
      <div style={C.card} className="space-y-5">
        <div className="flex items-center justify-between pb-4" style={{ borderBottom: '1px solid rgba(148,163,184,0.09)' }}>
          <h2 className="text-base font-bold text-primary-text tracking-tight">Contractual Criteria Breakdown</h2>
          <span className="text-xs font-mono" style={{ color: '#4e6580' }}>
            {verificationDetails?.criteria?.length || 0} Test Items
          </span>
        </div>

        {verificationDetails?.criteria && verificationDetails.criteria.length > 0 ? (
          <div className="space-y-4">
            {verificationDetails.criteria.map((item, idx) => (
              <div
                key={item.criterion_id || idx}
                style={C.innerCard}
                className="space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="font-bold text-primary-text text-sm flex items-center gap-2.5">
                    <span className="text-xs font-mono" style={{ color: '#4e6580' }}>#{idx + 1}</span>
                    <span>{item.criterion_id || `Criterion ${idx + 1}`}</span>
                  </div>
                  <div>{getStatusBadge(item.status)}</div>
                </div>

                {item.reasoning && (
                  <div className="text-xs" style={{ color: '#94a3b8' }}>
                    <span className="font-mono font-medium" style={{ color: '#4e6580' }}>Analysis: </span>
                    {item.reasoning}
                  </div>
                )}

                {item.evidence && (
                  <div
                    className="p-3 rounded-lg text-xs font-mono overflow-x-auto"
                    style={{
                      background: 'rgba(10,22,40,0.8)',
                      border: '1px solid rgba(148,163,184,0.08)',
                      color: '#94a3b8',
                    }}
                  >
                    <span className="block mb-1 font-bold" style={{ color: '#2dd4bf' }}>Quoted Evidence:</span>
                    "{item.evidence}"
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div
            className="p-6 text-center text-xs font-mono rounded-xl"
            style={{ background: 'rgba(19,34,54,0.4)', color: '#4e6580' }}
          >
            No specific criteria details available in this report payload.
          </div>
        )}

        {/* Improvement Suggestions */}
        {verificationDetails?.improvement_suggestions && verificationDetails.improvement_suggestions.length > 0 && (
          <div className="pt-4 space-y-2" style={{ borderTop: '1px solid rgba(148,163,184,0.09)' }}>
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider" style={{ color: '#22d3ee' }}>
              Auditor Recommendations
            </h3>
            <ul className="list-disc list-inside text-xs space-y-1" style={{ color: '#94a3b8' }}>
              {verificationDetails.improvement_suggestions.map((sug, i) => (
                <li key={i}>{sug}</li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Customer Final Decision Action Section */}
      {isCustomer && (
        <div
          style={{
            ...C.card,
            border: '1px solid rgba(45,212,191,0.25)',
          }}
          className="flex flex-col sm:flex-row items-center justify-between gap-5"
        >
          <div className="space-y-1 text-center sm:text-left">
            <h3 className="text-base font-bold text-primary-text">Accept & Approve Deliverables?</h3>
            <p className="text-xs max-w-lg" style={{ color: '#94a3b8' }}>
              Approving confirms work meets contractual standards and unlocks payment capture in the project workspace.
            </p>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              onClick={handleCustomerApproval}
              disabled={actionLoading || approvalSuccess}
              style={{
                ...C.btn,
                opacity: actionLoading || approvalSuccess ? 0.6 : 1,
                cursor: actionLoading || approvalSuccess ? 'not-allowed' : 'pointer',
              }}
              className="w-full sm:w-auto"
            >
              {actionLoading ? 'Approving...' : '✓ Approve Deliverables'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
