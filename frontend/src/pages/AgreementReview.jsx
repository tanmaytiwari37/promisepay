import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchProject, approveAgreement, createOrder, authorizePayment, capturePayment } from '../api/services';
import { useAuth } from '../context/AuthContext';
import StatusBadge from '../components/ui/StatusBadge';

export default function AgreementReview() {
  const { projectId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    if (!projectId) {
      navigate('/dashboard');
      return;
    }
    const load = async () => {
      try {
        const data = await fetchProject(projectId);
        setProject(data);
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [projectId, navigate]);

  const handleApprove = async () => {
    setActionLoading(true);
    try {
      await approveAgreement(projectId);
      const refreshed = await fetchProject(projectId);
      setProject(refreshed);
    } catch (e) {
      setError(e.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handlePay = async () => {
    setActionLoading(true);
    try {
      await createOrder(projectId);
      await authorizePayment(projectId);
      await capturePayment(projectId);
      const refreshed = await fetchProject(projectId);
      setProject(refreshed);
    } catch (e) {
      setError(e.message);
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen font-mono text-sm" style={{ color: '#94a3b8' }}>
        Loading agreement...
      </div>
    );
  }

  if (error) {
    return (
      <div
        className="p-6 rounded-2xl max-w-xl mx-auto mt-12"
        style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#f87171' }}
      >
        Error: {error}
      </div>
    );
  }

  if (!project) return null;

  const isCustomer = user?.role === 'customer';

  return (
    <div
      className="max-w-3xl mx-auto mt-8 p-8 rounded-2xl text-primary-text font-sans"
      style={{
        background: 'rgba(15,30,50,0.8)',
        border: '1px solid rgba(148,163,184,0.1)',
      }}
    >
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-black tracking-tight">Agreement Review</h2>
        <StatusBadge status={project.status} />
      </div>
      <p className="text-sm mb-4" style={{ color: '#94a3b8' }}>
        <strong>Agreement Title:</strong> {project.title}
      </p>

      {project.agreement && (
        <div
          className="mt-4 p-4 rounded-xl"
          style={{ background: 'rgba(19,34,54,0.6)', border: '1px solid rgba(148,163,184,0.08)' }}
        >
          <h3 className="font-mono text-xs uppercase font-bold mb-2" style={{ color: '#2dd4bf' }}>
            Scope & Deliverables
          </h3>
          <pre
            className="p-3 rounded-lg overflow-auto whitespace-pre-wrap text-xs font-mono"
            style={{ background: 'rgba(10,22,40,0.8)', color: '#94a3b8', border: '1px solid rgba(148,163,184,0.08)' }}
          >
            {JSON.stringify(project.agreement, null, 2)}
          </pre>
        </div>
      )}

      <div className="mt-6 flex items-center gap-3">
        {isCustomer && project.status === 'AGREED' && (
          <button
            onClick={handleApprove}
            disabled={actionLoading}
            className="px-6 py-2.5 rounded-full text-xs font-bold transition-all shadow-md"
            style={{
              background: 'linear-gradient(135deg, #2dd4bf 0%, #22d3ee 100%)',
              color: '#07111f',
            }}
          >
            {actionLoading ? 'Processing...' : 'Approve Agreement'}
          </button>
        )}
        {isCustomer && project.status === 'APPROVED' && (
          <button
            onClick={handlePay}
            disabled={actionLoading}
            className="px-6 py-2.5 rounded-full text-xs font-bold transition-all shadow-md"
            style={{
              background: 'linear-gradient(135deg, #2dd4bf 0%, #22d3ee 100%)',
              color: '#07111f',
            }}
          >
            {actionLoading ? 'Processing...' : 'Capture Payment'}
          </button>
        )}
        <button
          onClick={() => navigate(`/project/${projectId}`)}
          className="px-5 py-2.5 rounded-full text-xs font-semibold"
          style={{
            background: 'rgba(19,34,54,0.6)',
            color: '#94a3b8',
            border: '1px solid rgba(148,163,184,0.12)',
          }}
        >
          Go to Project Space →
        </button>
      </div>
    </div>
  );
}
