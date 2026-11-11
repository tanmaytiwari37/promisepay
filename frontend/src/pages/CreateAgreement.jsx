import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { createProject, generateAgreement, assignFreelancer } from '../api/services';

const S = {
  page: { maxWidth: '768px', margin: '0 auto' },
  card: {
    background: 'rgba(15,30,50,0.80)',
    border: '1px solid rgba(148,163,184,0.10)',
    borderRadius: '20px',
    padding: '32px',
  },
  label: { fontSize: '11px', fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', fontFamily: 'monospace', display: 'block', marginBottom: '8px' },
  input: {
    width: '100%', padding: '12px 16px', borderRadius: '12px', fontSize: '14px',
    background: 'rgba(19,34,54,0.80)', border: '1px solid rgba(148,163,184,0.14)',
    color: '#f1f5f9', outline: 'none', transition: 'all 0.15s',
    fontFamily: 'Inter, sans-serif',
  },
  textarea: {
    width: '100%', padding: '12px 16px', borderRadius: '12px', fontSize: '14px',
    background: 'rgba(19,34,54,0.80)', border: '1px solid rgba(148,163,184,0.14)',
    color: '#f1f5f9', outline: 'none', resize: 'vertical', minHeight: '100px',
    fontFamily: 'Inter, sans-serif',
  },
  btn: {
    background: 'linear-gradient(135deg, #2dd4bf 0%, #22d3ee 100%)',
    color: '#07111f', fontWeight: '800', padding: '14px 24px', borderRadius: '12px',
    fontSize: '14px', border: 'none', cursor: 'pointer',
    boxShadow: '0 6px 24px rgba(45,212,191,0.25)',
    display: 'flex', alignItems: 'center', gap: '8px',
  },
  err: {
    background: 'rgba(239,68,68,0.10)', border: '1px solid rgba(239,68,68,0.20)',
    color: '#f87171', padding: '14px 16px', borderRadius: '12px', fontSize: '14px',
    display: 'flex', alignItems: 'flex-start', gap: '10px',
  },
};

function InputField({ label, children }) {
  return (
    <div>
      <label style={S.label}>{label}</label>
      {children}
    </div>
  );
}

export default function CreateAgreement() {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [budget, setBudget] = useState('');
  const [deadline, setDeadline] = useState('');
  const [freelancerEmail, setFreelancerEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [agreement, setAgreement] = useState(null);
  const [createdProjectId, setCreatedProjectId] = useState(null);

  const handleFocus = (e) => { e.target.style.borderColor = 'rgba(45,212,191,0.50)'; e.target.style.boxShadow = '0 0 0 3px rgba(45,212,191,0.07)'; };
  const handleBlur = (e) => { e.target.style.borderColor = 'rgba(148,163,184,0.14)'; e.target.style.boxShadow = 'none'; };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!title || !budget) { setError('Title and budget are required.'); return; }
    setLoading(true); setError('');
    try {
      const proj = await createProject({
        title, description: description || 'Project deliverable and acceptance agreement',
        budget: parseFloat(budget), currency: 'USD', deadline: deadline || undefined,
      });
      setCreatedProjectId(proj.id);
      if (freelancerEmail) {
        try { await assignFreelancer(proj.id, freelancerEmail); } catch {}
      }
      const agr = await generateAgreement(proj.id);
      setAgreement(agr);
    } catch (err) {
      setError(err.message || 'Failed to create project');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={S.page} className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <Link to="/dashboard" className="text-xs font-mono hover:underline" style={{ color: '#4e6580' }}>← AGREEMENTS</Link>
          <span style={{ color: '#4e6580', fontSize: '12px' }}>/</span>
          <span className="text-xs font-mono font-semibold" style={{ color: '#2dd4bf' }}>NEW</span>
        </div>
        <h1 className="text-2xl font-black text-primary-text tracking-tight">Create Agreement Protocol</h1>
        <p className="text-sm mt-1" style={{ color: '#94a3b8' }}>
          Define requirements. AI generates explicit milestones, deliverables, and verifiable criteria.
        </p>
      </div>

      {error && (
        <div style={S.err}>
          <span>⚠</span>
          <span>{error}</span>
        </div>
      )}

      {!agreement ? (
        <div style={S.card}>
          <form onSubmit={handleCreate} className="space-y-5">
            <InputField label="Agreement Title *">
              <input
                type="text" required placeholder="e.g. Website Redesign & Development"
                value={title} onChange={(e) => setTitle(e.target.value)}
                style={S.input} onFocus={handleFocus} onBlur={handleBlur}
              />
            </InputField>

            <InputField label="Project Description">
              <textarea
                placeholder="Describe the project scope, expected outcomes, and key requirements in detail..."
                value={description} onChange={(e) => setDescription(e.target.value)}
                style={S.textarea} onFocus={handleFocus} onBlur={handleBlur}
              />
              <p className="text-xs mt-1.5 font-mono" style={{ color: '#4e6580' }}>
                More detail → better AI-generated agreement criteria
              </p>
            </InputField>

            <div className="grid grid-cols-2 gap-4">
              <InputField label="Budget (USD) *">
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold" style={{ color: '#94a3b8' }}>$</span>
                  <input
                    type="number" required min="1" placeholder="5000"
                    value={budget} onChange={(e) => setBudget(e.target.value)}
                    style={{ ...S.input, paddingLeft: '28px' }} onFocus={handleFocus} onBlur={handleBlur}
                  />
                </div>
              </InputField>

              <InputField label="Deadline (Optional)">
                <input
                  type="date"
                  value={deadline} onChange={(e) => setDeadline(e.target.value)}
                  style={{ ...S.input, colorScheme: 'dark' }} onFocus={handleFocus} onBlur={handleBlur}
                />
              </InputField>
            </div>

            <InputField label="Assign Freelancer (Optional)">
              <input
                type="email" placeholder="freelancer@example.com"
                value={freelancerEmail} onChange={(e) => setFreelancerEmail(e.target.value)}
                style={S.input} onFocus={handleFocus} onBlur={handleBlur}
              />
              <p className="text-xs mt-1.5 font-mono" style={{ color: '#4e6580' }}>You can also assign a freelancer later from the project workspace.</p>
            </InputField>

            <div className="pt-2">
              <button type="submit" disabled={loading} style={{ ...S.btn, opacity: loading ? 0.7 : 1, cursor: loading ? 'not-allowed' : 'pointer', width: '100%', justifyContent: 'center' }}>
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    Generating AI Agreement...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    Generate AI Agreement
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      ) : (
        /* Agreement preview */
        <div className="space-y-5">
          <div style={{ background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.20)', borderRadius: '12px', padding: '14px 18px', color: '#4ade80', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px', fontWeight: '600' }}>
            <span>✓</span>
            <span>AI Agreement generated successfully for project #{createdProjectId}</span>
          </div>

          <div style={S.card}>
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(45,212,191,0.12)', border: '1px solid rgba(45,212,191,0.22)' }}>
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ color: '#2dd4bf' }}>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div>
                <div className="text-base font-black text-primary-text">AI-Generated Agreement</div>
                <div className="text-xs font-mono" style={{ color: '#94a3b8' }}>Review the generated deliverables and verification criteria</div>
              </div>
            </div>

            <div className="space-y-5">
              {agreement.deliverables && (
                <div>
                  <label style={S.label}>Deliverables</label>
                  <div style={{ background: 'rgba(19,34,54,0.60)', borderRadius: '12px', padding: '16px', border: '1px solid rgba(148,163,184,0.10)' }}>
                    <pre className="text-sm whitespace-pre-wrap font-sans" style={{ color: '#f1f5f9', margin: 0 }}>
                      {typeof agreement.deliverables === 'string'
                        ? agreement.deliverables
                        : JSON.stringify(agreement.deliverables, null, 2)}
                    </pre>
                  </div>
                </div>
              )}

              {agreement.criteria && (
                <div>
                  <label style={S.label}>Verification Criteria</label>
                  <div style={{ background: 'rgba(19,34,54,0.60)', borderRadius: '12px', padding: '16px', border: '1px solid rgba(148,163,184,0.10)' }}>
                    <pre className="text-sm whitespace-pre-wrap font-sans" style={{ color: '#f1f5f9', margin: 0 }}>
                      {typeof agreement.criteria === 'string'
                        ? agreement.criteria
                        : JSON.stringify(agreement.criteria, null, 2)}
                    </pre>
                  </div>
                </div>
              )}

              {!agreement.deliverables && !agreement.criteria && agreement.content && (
                <div>
                  <label style={S.label}>Agreement Content</label>
                  <div style={{ background: 'rgba(19,34,54,0.60)', borderRadius: '12px', padding: '16px', border: '1px solid rgba(148,163,184,0.10)' }}>
                    <pre className="text-sm whitespace-pre-wrap font-sans" style={{ color: '#f1f5f9', margin: 0 }}>
                      {typeof agreement.content === 'string'
                        ? agreement.content
                        : JSON.stringify(agreement, null, 2)}
                    </pre>
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-3 mt-6 pt-5" style={{ borderTop: '1px solid rgba(148,163,184,0.09)' }}>
              <button
                onClick={() => navigate(`/project/${createdProjectId}`)}
                style={S.btn}
              >
                Open Project Workspace →
              </button>
              <button
                onClick={() => navigate('/dashboard')}
                style={{ ...S.btn, background: 'rgba(19,34,54,0.80)', color: '#94a3b8', boxShadow: 'none', border: '1px solid rgba(148,163,184,0.14)' }}
              >
                Back to Dashboard
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
