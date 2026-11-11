import React from 'react';
import { Link } from 'react-router-dom';

export default function Landing() {
  return (
    <div className="min-h-screen bg-primary-bg text-primary-text bg-tech-grid relative overflow-hidden font-sans">
      {/* Ambient glow orbs */}
      <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-cyan-accent/8 rounded-full blur-[160px] pointer-events-none" />
      <div className="absolute top-20 right-0 w-[500px] h-[500px] bg-mint/8 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-info/5 rounded-full blur-[120px] pointer-events-none" />

      {/* Top accent line */}
      <div className="w-full h-px bg-gradient-to-r from-transparent via-mint/30 to-transparent" />

      {/* ── NAVBAR ── */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-primary-bg/80 border-b border-border-card">
        <div className="max-w-7xl mx-auto px-6 h-[72px] flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-mint to-cyan-accent flex items-center justify-center text-primary-bg font-black text-sm shadow-lg shadow-mint/20 group-hover:scale-105 transition-transform">
              PP
            </div>
            <span className="text-lg font-black tracking-tight text-primary-text">
              PROMISE<span className="text-mint">PAY</span>
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-secondary-text">
            <a href="#solutions" className="hover:text-mint transition-colors duration-200">Solutions</a>
            <a href="#how-it-works" className="hover:text-mint transition-colors duration-200">How It Works</a>
            <a href="#features" className="hover:text-mint transition-colors duration-200">Features</a>
            <a href="#governance" className="hover:text-mint transition-colors duration-200">Security</a>
          </nav>

          <div className="flex items-center gap-3">
            <Link to="/login" className="text-sm font-medium text-secondary-text hover:text-primary-text transition-colors px-4 py-2">
              Log in
            </Link>
            <Link
              to="/register"
              className="px-5 py-2.5 rounded-full bg-gradient-to-r from-mint to-cyan-accent text-primary-bg font-bold text-sm shadow-lg shadow-mint/20 hover:shadow-mint/35 hover:scale-[1.03] transition-all duration-200"
            >
              Get Started
            </Link>
          </div>
        </div>
      </header>

      {/* ── HERO SECTION ── */}
      <section className="relative pt-20 pb-32 md:pt-28 md:pb-40 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">

          {/* Left column */}
          <div className="lg:col-span-6 space-y-8 z-10">
            <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-surface border border-border-subtle text-xs font-mono text-mint tracking-wider">
              <span className="w-2 h-2 rounded-full bg-mint animate-pulse" />
              AI-POWERED AGREEMENT & ESCROW PROTOCOL
            </div>

            <h1 className="text-5xl sm:text-6xl md:text-7xl font-black tracking-tight leading-[1.06] text-primary-text">
              Your Work.<br />
              <span className="text-gradient-cyan">Smart. Secure.</span>
            </h1>

            <p className="text-base sm:text-lg text-secondary-text max-w-xl leading-relaxed">
              Modern freelance contracting with AI-driven deliverables verification,
              zero hidden disputes, and full customer-controlled payment transparency.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2">
              <Link
                to="/register"
                className="inline-flex items-center gap-3 px-8 py-4 rounded-full bg-gradient-to-r from-mint to-cyan-accent text-primary-bg font-bold text-sm tracking-wide shadow-xl shadow-mint/25 hover:shadow-mint/40 hover:scale-[1.03] transition-all duration-200"
              >
                Get Started
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </Link>
              <Link
                to="/login"
                className="inline-flex items-center gap-2 px-6 py-4 rounded-full border border-border text-sm font-medium text-primary-text hover:border-mint hover:text-mint transition-all duration-200"
              >
                Sign In
              </Link>
            </div>

            {/* Stats row */}
            <div className="flex items-center gap-6 pt-4">
              <div className="glass-card rounded-2xl px-5 py-3.5 border border-border-card">
                <div className="text-2xl font-black text-primary-text">$1M+</div>
                <div className="text-[11px] text-secondary-text font-mono uppercase tracking-wider mt-0.5">Secured Escrow</div>
              </div>
              <div className="glass-card rounded-2xl px-5 py-3.5 border border-border-card">
                <div className="text-2xl font-black text-primary-text">100+</div>
                <div className="text-[11px] text-secondary-text font-mono uppercase tracking-wider mt-0.5">Active Users</div>
              </div>
              <div className="glass-card rounded-2xl px-5 py-3.5 border border-border-card">
                <div className="text-2xl font-black text-primary-text">99.9%</div>
                <div className="text-[11px] text-secondary-text font-mono uppercase tracking-wider mt-0.5">Uptime SLA</div>
              </div>
            </div>
          </div>

          {/* Right column — visual dashboard mock */}
          <div className="lg:col-span-6 relative z-10">
            <div className="relative mx-auto max-w-md">
              {/* Main card */}
              <div className="glass-card rounded-3xl p-6 border border-border-subtle shadow-2xl shadow-black/50">
                <div className="flex items-center justify-between mb-5">
                  <div>
                    <div className="text-xs font-mono text-muted-text uppercase tracking-widest mb-1">Active Agreement</div>
                    <div className="text-base font-bold text-primary-text">Website Redesign & Development</div>
                  </div>
                  <div className="px-3 py-1 rounded-full bg-success/15 border border-success/25 text-success text-[11px] font-bold font-mono">
                    IN PROGRESS
                  </div>
                </div>

                <div className="space-y-3 mb-5">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-secondary-text">Escrow Amount</span>
                    <span className="font-mono font-black text-primary-text text-base">$12,500</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-secondary-text">Workflow Progress</span>
                    <span className="font-mono text-mint font-bold">75%</span>
                  </div>
                  <div className="w-full bg-primary-bg rounded-full h-2 overflow-hidden">
                    <div className="bg-gradient-to-r from-mint to-cyan-accent h-2 rounded-full" style={{ width: '75%' }} />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2.5">
                  {['Agreement ✓', 'Payment ✓', 'AI Verify ⟳'].map((step, i) => (
                    <div key={i} className={`p-2.5 rounded-xl text-center text-[11px] font-mono font-bold border ${
                      i < 2
                        ? 'bg-mint/10 border-mint/25 text-mint'
                        : 'bg-surface border-border-card text-secondary-text'
                    }`}>
                      {step}
                    </div>
                  ))}
                </div>
              </div>

              {/* Floating notification card */}
              <div className="absolute -top-5 -right-5 glass-card rounded-2xl px-4 py-3 border border-border-card shadow-xl shadow-black/40 flex items-center gap-3 w-56">
                <div className="w-8 h-8 rounded-xl bg-success/15 border border-success/25 flex items-center justify-center text-success text-sm">✓</div>
                <div>
                  <div className="text-xs font-bold text-primary-text">AI Verified</div>
                  <div className="text-[10px] text-muted-text font-mono">All 5 criteria passed</div>
                </div>
              </div>

              {/* Floating payment card */}
              <div className="absolute -bottom-5 -left-5 glass-card rounded-2xl px-4 py-3 border border-border-card shadow-xl shadow-black/40 flex items-center gap-3 w-52">
                <div className="w-8 h-8 rounded-xl bg-info/15 border border-info/25 flex items-center justify-center text-info text-sm">🔒</div>
                <div>
                  <div className="text-xs font-bold text-primary-text">Escrow Secured</div>
                  <div className="text-[10px] text-muted-text font-mono">PayPal Protected</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section id="how-it-works" className="py-24 border-t border-border-card relative">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-surface border border-border-card text-xs font-mono text-mint mb-4">
              HOW IT WORKS
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-primary-text tracking-tight">
              Three Steps to Secure Collaboration
            </h2>
            <p className="text-secondary-text mt-3 max-w-xl mx-auto text-sm">
              From agreement to payment — every step is verified, protected, and transparent.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                step: '01',
                icon: '📋',
                title: 'Create AI Agreement',
                desc: 'Define deliverables and budget. Our AI generates a detailed contract with verifiable criteria automatically.',
              },
              {
                step: '02',
                icon: '🤖',
                title: 'AI Verifies Delivery',
                desc: 'When work is submitted, our AI engine audits every deliverable against agreed criteria with a full report.',
              },
              {
                step: '03',
                icon: '💸',
                title: 'Customer Approves Payment',
                desc: "Only you can release escrow. The AI never captures payments autonomously — your approval is always required.",
              },
            ].map((item) => (
              <div key={item.step} className="glass-card rounded-2xl p-7 border border-border-card hover:border-mint/30 transition-all duration-300 group">
                <div className="flex items-start justify-between mb-5">
                  <div className="w-12 h-12 rounded-2xl bg-surface flex items-center justify-center text-2xl group-hover:bg-mint/10 transition-colors">
                    {item.icon}
                  </div>
                  <span className="text-4xl font-black text-muted-text/40 font-mono">{item.step}</span>
                </div>
                <h3 className="text-base font-bold text-primary-text mb-2 group-hover:text-mint transition-colors">{item.title}</h3>
                <p className="text-secondary-text text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section id="features" className="py-24 border-t border-border-card bg-secondary-bg/40 relative">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-surface border border-border-card text-xs font-mono text-mint mb-4">
              FEATURES
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-primary-text tracking-tight">
              Everything You Need to Work With Confidence
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              { icon: '🧠', title: 'AI Agreement Generator', desc: 'Natural language agreement drafting powered by GPT-4. Define scope, milestones, and verification criteria instantly.' },
              { icon: '🔍', title: 'Deliverable Verification', desc: 'Automated AI audit of submitted work against agreed criteria. Detailed pass/fail report generated for every submission.' },
              { icon: '🔐', title: 'PayPal Escrow', desc: 'Funds are authorized and held in secure escrow. Payment is only captured after customer final approval.' },
              { icon: '📊', title: 'Real-Time Dashboard', desc: 'Full visibility into all projects, payment status, and verification reports from one unified workspace.' },
              { icon: '⚖️', title: 'Human-Controlled Payments', desc: "AI is advisory only. The customer has the final word on every payment — no autonomous fund releases, ever." },
              { icon: '📁', title: 'File Upload & Audit Trail', desc: 'Secure deliverable upload with permanent audit log. Every file, timestamp, and decision is recorded immutably.' },
            ].map((f) => (
              <div key={f.title} className="glass-card rounded-2xl p-6 border border-border-card hover:border-mint/25 transition-all duration-300 group">
                <div className="w-11 h-11 rounded-xl bg-surface border border-border-card flex items-center justify-center text-xl mb-4 group-hover:border-mint/30 group-hover:bg-mint/5 transition-all">
                  {f.icon}
                </div>
                <h3 className="text-sm font-bold text-primary-text mb-2 group-hover:text-mint transition-colors">{f.title}</h3>
                <p className="text-secondary-text text-xs leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── GOVERNANCE ── */}
      <section id="governance" className="py-24 border-t border-border-card relative">
        <div className="max-w-4xl mx-auto px-6 text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-mint/10 border border-mint/20 text-xs font-mono text-mint">
            ⚖️ CORE GOVERNANCE CHARTER
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-primary-text">
            AI is Advisory. You Have the Final Word.
          </h2>
          <p className="text-secondary-text text-sm sm:text-base leading-relaxed max-w-2xl mx-auto">
            PromisePay is built on a non-negotiable principle: Artificial Intelligence verifies facts and validates deliverables,
            but human agreement governs transactions. Funds are never captured without customer consent.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-6 text-left max-w-2xl mx-auto">
            {[
              { title: 'No Autonomous Captures', desc: 'Payment release requires authenticated customer approval.' },
              { title: 'Audited Evidence Trails', desc: 'Every upload, test, and criterion is permanently logged.' },
              { title: 'Transparent AI Reports', desc: 'Full verification report shown before any payment decision.' },
              { title: 'Dispute Protection', desc: 'Customer can reject AI recommendations and request changes.' },
            ].map((item) => (
              <div key={item.title} className="p-4 rounded-xl glass-card border border-border-card flex items-start gap-3">
                <span className="text-mint text-base mt-0.5">✓</span>
                <div>
                  <div className="text-sm font-bold text-primary-text">{item.title}</div>
                  <div className="text-xs text-secondary-text mt-0.5">{item.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ── */}
      <section className="py-24 border-t border-border-card text-center px-6 relative">
        <div className="absolute inset-0 bg-gradient-to-t from-secondary-bg/40 to-transparent pointer-events-none" />
        <div className="max-w-3xl mx-auto space-y-6 relative z-10">
          <h2 className="text-4xl sm:text-5xl font-black text-primary-text tracking-tight">
            Make Every Agreement Count.
          </h2>
          <p className="text-secondary-text text-base max-w-xl mx-auto">
            Experience the peace of mind of AI-verified deliverables and customer-controlled escrow payments.
          </p>
          <div className="pt-4">
            <Link
              to="/register"
              className="inline-flex items-center gap-3 px-10 py-4 rounded-full bg-gradient-to-r from-mint to-cyan-accent text-primary-bg font-black text-sm tracking-wide shadow-xl shadow-mint/25 hover:scale-[1.03] hover:shadow-mint/40 transition-all duration-200"
            >
              Start Building Trust
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="border-t border-border-card py-10 bg-primary-bg">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-6 text-xs text-secondary-text">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-mint to-cyan-accent flex items-center justify-center text-primary-bg font-black text-xs">
              PP
            </div>
            <span className="text-primary-text font-bold text-sm tracking-tight">PromisePay</span>
          </div>
          <div className="text-muted-text">
            © 2026 PromisePay. Secured by PayPal Escrow Protocol.
          </div>
          <div className="flex items-center gap-6">
            <Link to="/login" className="hover:text-mint transition-colors">Sign In</Link>
            <Link to="/register" className="hover:text-mint transition-colors">Register</Link>
            <a href="#governance" className="hover:text-mint transition-colors">Security</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
