import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { submitWork, fetchProject } from '../api/services';

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
    <div className="max-w-2xl mx-auto space-y-6 font-sans">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <Link to={`/project/${projectId}`} className="text-xs font-mono text-muted-text hover:text-mint transition-colors">
            ← AGREEMENT SPACE
          </Link>
          <span className="text-muted-text text-xs">/</span>
          <span className="text-xs font-mono text-mint font-medium">SUBMIT DELIVERABLES</span>
        </div>
        <h1 className="text-2xl font-extrabold text-primary-text tracking-tight">
          Deliverable Evidence Submission
        </h1>
        {project && (
          <p className="text-secondary-text text-sm mt-0.5">
            Agreement: <span className="text-primary-text font-bold">{project.title}</span>
          </p>
        )}
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-start gap-2.5">
          <span>⚠️</span>
          <span className="flex-1">{error}</span>
        </div>
      )}

      {success && (
        <div className="p-4 rounded-xl bg-mint/10 border border-mint/20 text-mint text-sm flex items-center gap-2.5">
          <span>✓</span>
          <span>Deliverables submitted! Redirecting to workspace for audit...</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="glass-card rounded-2xl p-8 space-y-6 border border-border-card">
        {/* Drag and Drop Area */}
        <div>
          <label className="block text-xs font-semibold text-secondary-text uppercase tracking-wider mb-2 font-mono">
            Evidence / Proof-of-Work File *
          </label>

          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all ${
              dragActive
                ? 'border-mint bg-mint/10'
                : file
                ? 'border-mint/60 bg-surface/60'
                : 'border-border-card bg-surface/30 hover:border-mint/40'
            }`}
          >
            {file ? (
              <div className="flex items-center justify-between bg-card-bg p-4 rounded-xl border border-border-card max-w-md mx-auto">
                <div className="flex items-center gap-3 truncate">
                  <span className="text-2xl">📄</span>
                  <div className="text-left truncate">
                    <div className="text-xs font-bold text-primary-text truncate font-mono">{file.name}</div>
                    <div className="text-[11px] text-muted-text font-mono">{(file.size / 1024).toFixed(1)} KB</div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setFile(null)}
                  className="text-xs font-bold text-red-400 hover:text-red-300 px-3 py-1"
                >
                  Remove
                </button>
              </div>
            ) : (
              <div>
                <div className="w-12 h-12 rounded-xl bg-surface border border-border-card flex items-center justify-center text-mint text-2xl mx-auto mb-3">
                  📤
                </div>
                <div className="text-sm font-bold text-primary-text mb-1">
                  Drag and drop archive or evidence file
                </div>
                <div className="text-xs text-muted-text mb-4 font-mono">
                  Supported: ZIP, PDF, PNG, JPG, MD, TXT (Max 10MB)
                </div>
                <label className="inline-block bg-gradient-to-r from-mint to-cyan-accent text-primary-bg px-5 py-2 rounded-full text-xs font-extrabold cursor-pointer transition-all shadow-md shadow-mint/15">
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
          <label className="block text-xs font-semibold text-secondary-text uppercase tracking-wider mb-2 font-mono">
            Submission Notes & Verification Context
          </label>
          <textarea
            rows={4}
            placeholder="Explain how each acceptance criterion has been met, provide test urls, deployment links, or execution logs."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full px-4 py-3 rounded-xl bg-surface border border-border-card text-primary-text placeholder-muted-text text-sm focus:outline-none focus:border-mint focus:ring-1 focus:ring-mint resize-y"
          />
        </div>

        {/* Advisory rule reminder */}
        <div className="p-4 rounded-xl bg-surface/60 border border-border-card text-xs text-secondary-text flex items-start gap-3">
          <span className="text-base text-mint">⚖️</span>
          <span>
            Upon submission, status updates to <strong className="text-primary-text font-mono">SUBMITTED</strong>. The AI verification engine will audit the file against the agreed criteria before customer review.
          </span>
        </div>

        <div className="flex items-center gap-3 pt-2">
          <button
            type="submit"
            disabled={loading || !file}
            className="flex-1 bg-gradient-to-r from-mint to-cyan-accent text-primary-bg font-extrabold py-3.5 px-6 rounded-full text-sm transition-all shadow-lg shadow-mint/20 flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-primary-bg border-t-transparent rounded-full animate-spin"></div>
                <span>Uploading Deliverables...</span>
              </>
            ) : (
              '📤 Upload & Request AI Audit'
            )}
          </button>
          <button
            type="button"
            onClick={() => navigate(`/project/${projectId}`)}
            className="px-6 py-3.5 rounded-full bg-surface hover:bg-surface-elevated border border-border-card text-secondary-text hover:text-primary-text text-xs font-bold"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
