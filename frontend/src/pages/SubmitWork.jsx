import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { submitWork, fetchProject } from '../api/services';

const S = {
  card: {
    background: 'rgba(15,30,50,0.80)',
    border: '1px solid rgba(148,163,184,0.10)',
    borderRadius: '20px',
    padding: '32px',
  },
  label: {
    fontSize: '11px',
    fontWeight: '700',
    color: '#94a3b8',
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
    fontFamily: 'monospace',
    display: 'block',
    marginBottom: '8px',
  },
  textarea: {
    width: '100%',
    padding: '12px 16px',
    borderRadius: '12px',
    fontSize: '14px',
    background: 'rgba(19,34,54,0.80)',
    border: '1px solid rgba(148,163,184,0.14)',
    color: '#f1f5f9',
    outline: 'none',
    resize: 'vertical',
    minHeight: '110px',
    fontFamily: 'Inter, sans-serif',
  },
  btn: {
    background: 'linear-gradient(135deg, #2dd4bf 0%, #22d3ee 100%)',
    color: '#07111f',
    fontWeight: '800',
    padding: '14px 24px',
    borderRadius: '12px',
    fontSize: '14px',
    border: 'none',
    cursor: 'pointer',
    boxShadow: '0 6px 24px rgba(45,212,191,0.25)',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    transition: 'all 0.15s ease',
  },
  btnOutline: {
    background: 'rgba(19,34,54,0.60)',
    border: '1px solid rgba(148,163,184,0.15)',
    color: '#94a3b8',
    fontWeight: '700',
    padding: '13px 22px',
    borderRadius: '12px',
    fontSize: '13px',
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  err: {
    background: 'rgba(239,68,68,0.10)',
    border: '1px solid rgba(239,68,68,0.20)',
    color: '#f87171',
    padding: '14px 16px',
    borderRadius: '12px',
    fontSize: '14px',
    display: 'flex',
    alignItems: 'flex-start',
    gap: '10px',
  },
  success: {
    background: 'rgba(34,197,94,0.10)',
    border: '1px solid rgba(34,197,94,0.20)',
    color: '#4ade80',
    padding: '14px 16px',
    borderRadius: '12px',
    fontSize: '14px',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
};

export default function SubmitWork() {
  const { projectId } = useParams();
  const navigate = useNavigate();

  const [project, setProject] = useState(null);
  const [file, setFile] = useState(null);
  const [notes, setNotes] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (projectId) {
      fetchProject(projectId)
        .then(setProject)
        .catch(err => setError(err.message));
    }
  }, [projectId]);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const validateAndSetFile = (selectedFile) => {
    if (!selectedFile) return;
    if (selectedFile.size > 10 * 1024 * 1024) {
      setError('File size exceeds the 10MB limit.');
      return;
    }
    const allowed = ['pdf', 'txt', 'md', 'png', 'jpg', 'jpeg', 'zip'];
    const ext = selectedFile.name.split('.').pop()?.toLowerCase();
    if (!allowed.includes(ext)) {
      setError(`Invalid file format (.${ext}). Supported: pdf, txt, md, png, jpg, zip.`);
      return;
    }
    setError('');
    setFile(selectedFile);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setError('Please select or drop an evidence deliverable file.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('file', file);
      if (notes) formData.append('notes', notes);

      await submitWork(projectId, formData);
      setSuccess(true);
      setTimeout(() => {
        navigate(`/project/${projectId}`);
      }, 1500);
    } catch (err) {
      setError(err.message || 'Submission failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-2 text-xs font-mono">
          <Link to={`/project/${projectId}`} style={{ color: '#4e6580' }} className="hover:text-mint transition-colors">
            ← AGREEMENT SPACE
          </Link>
          <span style={{ color: '#4e6580' }}>/</span>
          <span style={{ color: '#2dd4bf' }}>SUBMIT DELIVERABLES</span>
        </div>
        <h1 className="text-2xl font-black text-primary-text tracking-tight">
          Deliverable Evidence Submission
        </h1>
        {project && (
          <p className="text-sm mt-1" style={{ color: '#94a3b8' }}>
            Agreement: <span className="text-primary-text font-bold">{project.title}</span>
          </p>
        )}
      </div>

      {error && (
        <div style={S.err}>
          <span>⚠</span>
          <span className="flex-1">{error}</span>
        </div>
      )}

      {success && (
        <div style={S.success}>
          <span>✓</span>
          <span>Deliverables submitted! Redirecting to workspace for audit...</span>
        </div>
      )}

      <form onSubmit={handleSubmit} style={S.card} className="space-y-6">
        {/* Drag and Drop Area */}
        <div>
          <label style={S.label}>
            Evidence / Proof-of-Work File *
          </label>

          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            className="rounded-2xl p-8 text-center transition-all"
            style={{
              border: dragActive
                ? '2px dashed #2dd4bf'
                : file
                ? '2px dashed rgba(45,212,191,0.6)'
                : '2px dashed rgba(148,163,184,0.18)',
              background: dragActive
                ? 'rgba(45,212,191,0.08)'
                : file
                ? 'rgba(19,34,54,0.7)'
                : 'rgba(19,34,54,0.3)',
            }}
          >
            {file ? (
              <div
                className="flex items-center justify-between p-4 rounded-xl max-w-md mx-auto"
                style={{
                  background: 'rgba(15,30,50,0.9)',
                  border: '1px solid rgba(148,163,184,0.12)',
                }}
              >
                <div className="flex items-center gap-3 truncate">
                  <span className="text-2xl">📄</span>
                  <div className="text-left truncate">
                    <div className="text-xs font-bold text-primary-text truncate font-mono">{file.name}</div>
                    <div className="text-[11px] font-mono" style={{ color: '#4e6580' }}>
                      {(file.size / 1024).toFixed(1)} KB
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setFile(null)}
                  className="text-xs font-bold px-3 py-1 hover:underline"
                  style={{ color: '#f87171' }}
                >
                  Remove
                </button>
              </div>
            ) : (
              <div>
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl mx-auto mb-3"
                  style={{
                    background: 'rgba(45,212,191,0.12)',
                    color: '#2dd4bf',
                    border: '1px solid rgba(45,212,191,0.22)',
                  }}
                >
                  📤
                </div>
                <div className="text-sm font-bold text-primary-text mb-1">
                  Drag and drop archive or evidence file
                </div>
                <div className="text-xs font-mono mb-4" style={{ color: '#4e6580' }}>
                  Supported: ZIP, PDF, PNG, JPG, MD, TXT (Max 10MB)
                </div>
                <label
                  style={S.btn}
                  className="px-5 py-2 rounded-full text-xs cursor-pointer"
                >
                  Browse Files
                  <input
                    type="file"
                    className="hidden"
                    onChange={handleFileChange}
                    accept=".zip,.pdf,.txt,.md,.png,.jpg,.jpeg"
                  />
                </label>
              </div>
            )}
          </div>
        </div>

        {/* Submission Notes */}
        <div>
          <label style={S.label}>
            Submission Notes & Verification Context
          </label>
          <textarea
            rows={4}
            placeholder="Explain how each acceptance criterion has been met, provide test urls, deployment links, or execution logs."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            style={S.textarea}
            onFocus={(e) => {
              e.target.style.borderColor = 'rgba(45,212,191,0.5)';
              e.target.style.boxShadow = '0 0 0 3px rgba(45,212,191,0.07)';
            }}
            onBlur={(e) => {
              e.target.style.borderColor = 'rgba(148,163,184,0.14)';
              e.target.style.boxShadow = 'none';
            }}
          />
        </div>

        {/* Advisory rule reminder */}
        <div
          className="p-4 rounded-xl text-xs flex items-start gap-3"
          style={{
            background: 'rgba(19,34,54,0.6)',
            border: '1px solid rgba(148,163,184,0.10)',
            color: '#94a3b8',
          }}
        >
          <span className="text-base" style={{ color: '#2dd4bf' }}>⚖️</span>
          <span>
            Upon submission, status updates to <strong className="text-primary-text font-mono">SUBMITTED</strong>. The AI verification engine will audit the file against the agreed criteria before customer review.
          </span>
        </div>

        <div className="flex items-center gap-3 pt-2">
          <button
            type="submit"
            disabled={loading || !file}
            style={{
              ...S.btn,
              flex: 1,
              opacity: loading || !file ? 0.5 : 1,
              cursor: loading || !file ? 'not-allowed' : 'pointer',
            }}
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                <span>Uploading Deliverables...</span>
              </>
            ) : (
              '📤 Upload & Request AI Audit'
            )}
          </button>
          <button
            type="button"
            onClick={() => navigate(`/project/${projectId}`)}
            style={S.btnOutline}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
