import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { createProject, generateAgreement, assignFreelancer } from '../api/services';

export default function CreateAgreement() {
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [budget, setBudget] = useState('');
  const [currency] = useState('USD');
  const [deadline, setDeadline] = useState('');
  const [freelancerEmail, setFreelancerEmail] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [agreement, setAgreement] = useState(null);
  const [createdProjectId, setCreatedProjectId] = useState(null);

  const handleCreateAndGenerate = async (e) => {
    e.preventDefault();
    if (!title || !budget) {
      setError('Title and budget are required.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const payload = {
        title,
        description: description || 'Project deliverable and acceptance agreement',
        budget: parseFloat(budget),
        currency,
        deadline: deadline || undefined,
      };

      const proj = await createProject(payload);
      setCreatedProjectId(proj.id);

      if (freelancerEmail) {
        try {
          await assignFreelancer(proj.id, freelancerEmail);
        } catch (assignErr) {
          console.warn('Freelancer assignment note:', assignErr.message);
        }
      }

      const agr = await generateAgreement(proj.id);
      setAgreement(agr);
    } catch (err) {
      setError(err.message || 'Failed to create project and generate agreement');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 font-sans">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link to="/dashboard" className="text-xs font-mono text-muted-text hover:text-mint transition-colors">
              ← AGREEMENTS
            </Link>
            <span className="text-muted-text text-xs">/</span>
            <span className="text-xs font-mono text-mint font-medium">NEW AGREEMENT</span>
          </div>
          <h1 className="text-2xl font-extrabold text-primary-text tracking-tight">
            Create Agreement Protocol
          </h1>
          <p className="text-secondary-text text-sm mt-0.5">
            Define requirements. AI generates explicit milestones, deliverables, and verifiable criteria.
          </p>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-start gap-2.5">
          <span>⚠️</span>
          <span>{error}</span>
        </div>
      )}

      {!agreement ? (
        <form onSubmit={handleCreateAndGenerate} className="glass-card rounded-2xl p-8 space-y-6 border border-border-card">
          <div className="flex items-center gap-2 pb-3 border-b border-border-card">
            <span className="text-xs font-mono uppercase text-mint font-bold">1. Agreement Scope</span>
          </div>

          <div>
            <label className="block text-xs font-semibold text-secondary-text uppercase tracking-wider mb-2 font-mono">
              Project Title *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. NextGen Web3 Gateway & API Integration"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-surface border border-border-card text-primary-text placeholder-muted-text text-sm focus:outline-none focus:border-mint focus:ring-1 focus:ring-mint"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-secondary-text uppercase tracking-wider mb-2 font-mono">
              Requirements & Scope Description
            </label>
            <textarea
              rows={4}
              placeholder="Describe technical requirements, deliverables, standards, and milestones. The AI engine parses these into machine-verifiable criteria."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-surface border border-border-card text-primary-text placeholder-muted-text text-sm focus:outline-none focus:border-mint focus:ring-1 focus:ring-mint resize-y"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-secondary-text uppercase tracking-wider mb-2 font-mono">
                Escrow Budget (USD) *
              </label>
              <div className="relative">
                <span className="absolute left-4 top-3 text-muted-text text-sm font-mono">$</span>
                <input
                  type="number"
                  step="0.01"
                  required
                  placeholder="1200.00"
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                  className="w-full pl-9 pr-4 py-3 rounded-xl bg-surface border border-border-card text-primary-text placeholder-muted-text text-sm font-mono focus:outline-none focus:border-mint focus:ring-1 focus:ring-mint"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-secondary-text uppercase tracking-wider mb-2 font-mono">
                Target Deadline
              </label>
              <input
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-surface border border-border-card text-primary-text placeholder-muted-text text-sm font-mono focus:outline-none focus:border-mint focus:ring-1 focus:ring-mint"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-secondary-text uppercase tracking-wider mb-2 font-mono">
              Assign Freelancer Email (Optional)
            </label>
            <input
              type="email"
              placeholder="freelancer@demo.com"
              value={freelancerEmail}
              onChange={(e) => setFreelancerEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-surface border border-border-card text-primary-text placeholder-muted-text text-sm focus:outline-none focus:border-mint focus:ring-1 focus:ring-mint"
            />
            <p className="text-[11px] text-muted-text mt-1.5 font-mono">
              You can also assign or invite a freelancer after agreement creation.
            </p>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-mint to-cyan-accent hover:opacity-95 text-primary-bg font-extrabold py-3.5 px-6 rounded-full text-sm transition-all duration-200 shadow-xl shadow-mint/20 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-primary-bg border-t-transparent rounded-full animate-spin"></div>
                  <span>Generating AI Deliverables & Audit Criteria...</span>
                </>
              ) : (
                '✨ Generate Agreement & Scope'
              )}
            </button>
          </div>
        </form>
      ) : (
        /* Agreement Generated Success & Preview */
        <div className="glass-card rounded-2xl p-8 space-y-6 border border-border-card">
          <div className="flex items-center gap-3 p-4 rounded-xl bg-mint/10 border border-mint/20">
            <span className="text-2xl">🎉</span>
            <div>
              <h3 className="font-bold text-mint text-sm">Agreement Protocol Initialized!</h3>
              <p className="text-xs text-secondary-text mt-0.5">
                AI has outlined structured milestones and objective acceptance tests.
              </p>
            </div>
          </div>

          {/* Deliverables summary */}
          <div className="space-y-4">
            <h4 className="font-bold text-primary-text text-base">Generated Scope</h4>

            {agreement.deliverables && agreement.deliverables.map((del, i) => (
              <div key={del.id || i} className="bg-surface/50 border border-border-card rounded-xl p-5 space-y-2">
                <div className="font-semibold text-primary-text text-sm flex items-center gap-2">
                  <span className="text-xs font-mono bg-mint/20 text-mint px-2 py-0.5 rounded">
                    #{i + 1}
                  </span>
                  {del.title}
                </div>
                <p className="text-xs text-secondary-text pl-7 leading-relaxed">{del.description}</p>

                {/* Criteria */}
                {agreement.acceptance_criteria && (
                  <div className="pl-7 pt-2 space-y-2">
                    <div className="text-[10px] font-mono font-bold text-muted-text uppercase">Verification Tests:</div>
                    {agreement.acceptance_criteria
                      .filter(c => c.deliverable_id === del.id || !c.deliverable_id)
                      .map((c, ci) => (
                        <div key={ci} className="text-xs text-secondary-text flex items-center gap-2 bg-card-bg/60 p-2.5 rounded-lg border border-border-card">
                          <span className="text-mint font-bold">✓</span>
                          <span>{c.criterion}</span>
                        </div>
                      ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="flex items-center gap-3 pt-3">
            <button
              onClick={() => navigate(`/project/${createdProjectId}`)}
              className="flex-1 bg-gradient-to-r from-mint to-cyan-accent text-primary-bg font-bold py-3.5 px-6 rounded-full text-sm transition-all shadow-md shadow-mint/20 text-center"
            >
              Enter Agreement Space →
            </button>
            <button
              onClick={() => navigate('/dashboard')}
              className="px-6 py-3.5 rounded-full bg-surface hover:bg-surface-elevated border border-border-card text-secondary-text hover:text-primary-text text-xs font-bold transition-all"
            >
              Dashboard
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
