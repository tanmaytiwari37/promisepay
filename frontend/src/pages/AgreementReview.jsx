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

  if (loading) return <div className="flex justify-center items-center h-screen text-primary-text font-mono">Loading agreement...</div>;
  if (error) return <div className="text-red-400 p-6 glass-card rounded-xl">Error: {error}</div>;
  if (!project) return null;

  const isCustomer = user?.role === 'customer';

  return (
    <div className="max-w-3xl mx-auto mt-8 p-8 glass-card rounded-2xl border border-border-card text-primary-text font-sans">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-extrabold tracking-tight">Agreement Review</h2>
        <StatusBadge status={project.status} />
      </div>
      <p className="text-sm text-secondary-text mb-4"><strong>Agreement Title:</strong> {project.title}</p>
      
      {project.agreement && (
        <div className="mt-4 p-4 rounded-xl bg-surface/50 border border-border-card">
          <h3 className="font-mono text-xs uppercase text-mint font-bold mb-2">Scope & Deliverables</h3>
          <pre className="bg-card-bg p-3 rounded-lg overflow-auto whitespace-pre-wrap text-xs text-secondary-text font-mono border border-border-card">{JSON.stringify(project.agreement, null, 2)}</pre>
        </div>
      )}

      <div className="mt-6 flex items-center gap-3">
        {isCustomer && project.status === 'AGREED' && (
          <button onClick={handleApprove} disabled={actionLoading} className="px-6 py-2.5 bg-gradient-to-r from-mint to-cyan-accent text-primary-bg font-bold rounded-full text-xs transition-all shadow-md">
            {actionLoading ? 'Processing...' : 'Approve Agreement'}
          </button>
        )}
        {isCustomer && project.status === 'APPROVED' && (
          <button onClick={handlePay} disabled={actionLoading} className="px-6 py-2.5 bg-gradient-to-r from-mint to-cyan-accent text-primary-bg font-bold rounded-full text-xs transition-all shadow-md">
            {actionLoading ? 'Processing...' : 'Capture Payment'}
          </button>
        )}
        <button onClick={() => navigate(`/project/${projectId}`)} className="px-5 py-2.5 bg-surface text-secondary-text hover:text-primary-text rounded-full text-xs font-semibold border border-border-card">
          Go to Project Space →
        </button>
      </div>
    </div>
  );
}
