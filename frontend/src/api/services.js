import apiClient from './client';

// ── Auth ──────────────────────────────────────────────────────
export const login = (email, password) =>
  apiClient('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) });

export const register = (name, email, password, role) =>
  apiClient('/auth/register', { method: 'POST', body: JSON.stringify({ email, password, name, role }) });

export const fetchMe = () => apiClient('/auth/me');

// ── Projects ──────────────────────────────────────────────────
export const fetchProjects = () => apiClient('/projects');

export const fetchProject = (projectId) => apiClient(`/projects/${projectId}`);

export const createProject = (data) =>
  apiClient('/projects', { method: 'POST', body: JSON.stringify(data) });

export const assignFreelancer = (projectId, email) =>
  apiClient(`/projects/${projectId}/assign-freelancer`, { method: 'POST', body: JSON.stringify({ email }) });

export const submitForApproval = (projectId) =>
  apiClient(`/projects/${projectId}/submit-for-approval`, { method: 'POST' });

// ── Agreements ────────────────────────────────────────────────
export const fetchAgreement = (projectId) =>
  apiClient(`/projects/${projectId}/agreement`);

export const generateAgreement = (projectId) =>
  apiClient(`/projects/${projectId}/agreement/generate`, { method: 'POST' });

export const approveAgreement = (projectId) =>
  apiClient(`/projects/${projectId}/agreement/approve`, { method: 'POST' });

// ── Submissions ───────────────────────────────────────────────
export const fetchSubmissions = (projectId) =>
  apiClient(`/projects/${projectId}/submissions`);

export const submitWork = (projectId, formData) =>
  apiClient(`/projects/${projectId}/submissions`, {
    method: 'POST',
    body: formData,
    // Don't set Content-Type — let browser set multipart boundary
  });

// ── AI Verification ───────────────────────────────────────────
export const verifyProject = (projectId) =>
  apiClient(`/projects/${projectId}/verify`, { method: 'POST' });

export const fetchReports = (projectId) =>
  apiClient(`/projects/${projectId}/reports`);

// ── Customer Review ───────────────────────────────────────────
export const reviewProject = (projectId, decision, comment) =>
  apiClient(`/projects/${projectId}/review`, {
    method: 'POST',
    body: JSON.stringify({ decision, comment }),
  });

// ── Payments ──────────────────────────────────────────────────
export const createOrder = (projectId) =>
  apiClient(`/projects/${projectId}/payment/create-order`, { method: 'POST' });

export const authorizePayment = (projectId) =>
  apiClient(`/projects/${projectId}/payment/authorize`, { method: 'POST' });

export const capturePayment = (projectId) =>
  apiClient(`/projects/${projectId}/payment/capture`, { method: 'POST' });

export const cancelPayment = (projectId) =>
  apiClient(`/projects/${projectId}/payment/cancel`, { method: 'POST' });

export const fetchPayments = () => apiClient('/payments');

// ── Dashboard ─────────────────────────────────────────────────
export const fetchDashboardSummary = () => apiClient('/dashboard/summary');

export const fetchPendingApprovals = (status) =>
  apiClient(`/dashboard/pending-approvals${status ? `?status=${status}` : ''}`);
