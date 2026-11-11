import React from 'react';
import { Link } from 'react-router-dom';

export default function Landing() {
  return (
    <div className="min-h-screen bg-primary-bg text-primary-text bg-tech-grid relative overflow-hidden font-sans selection:bg-mint selection:text-primary-bg">
      {/* Ambient background glow orbs */}
      <div className="absolute top-12 left-1/4 w-[500px] h-[500px] bg-cyan-accent/10 rounded-full blur-[140px] pointer-events-none"></div>
      <div className="absolute top-36 right-10 w-[600px] h-[600px] bg-mint/10 rounded-full blur-[160px] pointer-events-none"></div>
      <div className="absolute bottom-20 left-1/3 w-[700px] h-[700px] bg-blue-900/15 rounded-full blur-[180px] pointer-events-none"></div>

      {/* Decorative Technical Top Accent Line */}
      <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-mint/40 to-transparent"></div>

      {/* Modern Fintech Navbar */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-primary-bg/70 border-b border-border-card">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="relative">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-mint to-cyan-accent flex items-center justify-center text-primary-bg font-extrabold text-sm shadow-lg shadow-mint/20 group-hover:scale-105 transition-transform duration-300">
                PP
              </div>
              <div className="absolute -inset-1 rounded-xl bg-mint/30 blur-sm opacity-0 group-hover:opacity-100 transition-opacity"></div>
            </div>
            <span className="text-xl font-bold tracking-tight text-primary-text font-mono">
              PROMISE<span className="text-mint">PAY</span>
            </span>
          </Link>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-9 text-sm font-medium text-secondary-text">
            <a href="#solutions" className="hover:text-mint transition-colors">Solutions</a>
            <a href="#how-it-works" className="hover:text-mint transition-colors">How It Works</a>
            <a href="#features" className="hover:text-mint transition-colors">Features</a>
            <a href="#governance" className="hover:text-mint transition-colors">Governance</a>
          </nav>

          {/* Right Action */}
          <div className="flex items-center gap-4">
            <Link
              to="/login"
              className="px-6 py-2 rounded-full border border-mint/40 hover:border-mint text-sm font-medium text-primary-text hover:text-mint transition-all duration-300 hover:shadow-lg hover:shadow-mint/10"
            >
              Log in
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section (Recreated from Reference Image) */}
      <section className="relative pt-16 pb-24 md:pt-24 md:pb-32 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            
            {/* Left Hero Column */}
            <div className="lg:col-span-7 space-y-8 z-10">
              {/* Pill Tag */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-surface border border-border-subtle text-xs font-mono text-mint">
                <span className="w-2 h-2 rounded-full bg-mint animate-pulse"></span>
                AI-POWERED AGREEMENT & ESCROW PROTOCOL
              </div>

              {/* Giant Bold Headline */}
              <h1 className="text-5xl sm:text-6xl md:text-7xl font-extrabold tracking-tight leading-[1.08] text-primary-text">
                Your Work.<br />
                <span className="text-gradient-cyan">Smart. Secure.</span>
              </h1>

              {/* Supporting Subtitle */}
              <p className="text-base sm:text-lg text-secondary-text max-w-xl font-normal leading-relaxed">
                Modern freelance contracting with AI-driven deliverables verification, zero hidden disputes, and full customer-controlled payment transparency.
              </p>

              {/* Hero Action Button */}
              <div className="pt-2 flex flex-wrap items-center gap-4">
                <Link
                  to="/register"
                  className="group inline-flex items-center gap-3.5 px-8 py-3.5 rounded-full bg-gradient-to-r from-mint to-cyan-accent text-primary-bg font-bold text-sm tracking-wide shadow-xl shadow-mint/25 hover:shadow-mint/40 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
                >
                  <span>Get Started</span>
                  <div className="w-6 h-6 rounded-full bg-primary-bg/15 flex items-center justify-center group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform">
                    <svg className="w-3.5 h-3.5 text-primary-bg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </div>
                </Link>

                <a
                  href="#how-it-works"
                  className="px-6 py-3.5 rounded-full bg-surface/60 hover:bg-surface border border-border-card text-secondary-text hover:text-primary-text text-sm font-medium transition-all"
                >
                  Explore How It Works
                </a>
              </div>

              {/* Glass Stat Cards (Matching Reference layout) */}
              <div className="pt-8 flex flex-wrap gap-4 sm:gap-6">
                <div className="glass-card rounded-2xl px-6 py-4.5 min-w-[160px] border border-border-subtle">
                  <div className="flex items-center gap-2">
                    <div className="w-1 h-5 bg-mint rounded-full"></div>
                    <div className="text-2xl sm:text-3xl font-extrabold text-primary-text tracking-tight">
                      100%
                    </div>
                  </div>
                  <div className="text-xs text-secondary-text mt-1.5 font-medium pl-3">
                    Customer Controlled
                  </div>
                </div>

                <div className="glass-card rounded-2xl px-6 py-4.5 min-w-[160px] border border-border-subtle">
                  <div className="flex items-center gap-2">
                    <div className="w-1 h-5 bg-cyan-accent rounded-full"></div>
                    <div className="text-2xl sm:text-3xl font-extrabold text-primary-text tracking-tight">
                      AI-Audited
                    </div>
                  </div>
                  <div className="text-xs text-secondary-text mt-1.5 font-medium pl-3">
                    Deliverable Verification
                  </div>
                </div>

                <div className="glass-card rounded-2xl px-6 py-4.5 min-w-[160px] border border-border-subtle">
                  <div className="flex items-center gap-2">
                    <div className="w-1 h-5 bg-emerald rounded-full"></div>
                    <div className="text-2xl sm:text-3xl font-extrabold text-primary-text tracking-tight">
                      PayPal
                    </div>
                  </div>
                  <div className="text-xs text-secondary-text mt-1.5 font-medium pl-3">
                    Protected Escrow
                  </div>
                </div>
              </div>

            </div>

            {/* Right Hero Column: Futuristic 3D Fintech Visual (Recreated from Reference) */}
            <div className="lg:col-span-5 relative flex items-center justify-center">
              <div className="relative w-full max-w-[520px] aspect-square">
                {/* Circuit Grid Ground Plane */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <svg className="w-full h-full opacity-70" viewBox="0 0 500 500" fill="none">
                    <defs>
                      <linearGradient id="gridGlow" x1="0" y1="0" x2="500" y2="500" gradientUnits="userSpaceOnUse">
                        <stop stopColor="#54EBD5" stopOpacity="0.4" />
                        <stop offset="0.5" stopColor="#20B8E8" stopOpacity="0.2" />
                        <stop offset="1" stopColor="#080F1E" stopOpacity="0" />
                      </linearGradient>
                      <linearGradient id="shieldGrad" x1="0" y1="0" x2="1" y2="1">
                        <stop stopColor="#54EBD5" />
                        <stop offset="1" stopColor="#20B8E8" />
                      </linearGradient>
                    </defs>

                    {/* Perspective Isometric Floor Grid */}
                    <g transform="translate(250, 360) scale(1, 0.48) rotate(-45)">
                      <rect x="-180" y="-180" width="360" height="360" stroke="#20B8E8" strokeWidth="1" strokeOpacity="0.25" fill="#0B1526" fillOpacity="0.7" rx="20" />
                      {/* Grid lines */}
                      <path d="M-180 -120 H180 M-180 -60 H180 M-180 0 H180 M-180 60 H180 M-180 120 H180" stroke="#20B8E8" strokeWidth="0.8" strokeOpacity="0.18" />
                      <path d="M-120 -180 V180 M-60 -180 V180 M0 -180 V180 M60 -180 V180 M120 -180 V180" stroke="#20B8E8" strokeWidth="0.8" strokeOpacity="0.18" />
                      {/* Circuit Dots */}
                      <circle cx="0" cy="0" r="4" fill="#54EBD5" />
                      <circle cx="-120" cy="-60" r="3" fill="#20B8E8" />
                      <circle cx="120" cy="60" r="3" fill="#54EBD5" />
                      <circle cx="60" cy="-120" r="3" fill="#20B8E8" />
                      <circle cx="-60" cy="120" r="3" fill="#54EBD5" />
                    </g>

                    {/* Circuit Connection Traces */}
                    <path d="M120 380 L180 380 L220 340 L340 340" stroke="#54EBD5" strokeWidth="1.5" strokeOpacity="0.4" strokeDasharray="4 4" />
                    <path d="M380 410 L320 410 L280 370 L150 370" stroke="#20B8E8" strokeWidth="1.5" strokeOpacity="0.4" strokeDasharray="4 4" />
                  </svg>
                </div>

                {/* Isometric Laptop & Agreement Station */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="relative w-80 sm:w-96 p-6 rounded-2xl glass-card border border-mint/30 shadow-2xl shadow-mint/15 transform hover:-translate-y-1 transition-transform duration-500">
                    {/* Top bar with status light */}
                    <div className="flex items-center justify-between pb-4 border-b border-border-card">
                      <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full bg-mint animate-pulse"></div>
                        <span className="text-xs font-mono text-mint tracking-wider">SMART CONTRACT v2.4</span>
                      </div>
                      <span className="text-[11px] font-mono text-muted-text">ESCROW #PP-8492</span>
                    </div>

                    {/* Middle Card: Floating Agreement Ribbon & Hologram */}
                    <div className="my-5 p-4 rounded-xl bg-surface/70 border border-border-subtle relative overflow-hidden">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="text-[11px] font-mono text-muted-text uppercase">Deliverable</div>
                          <div className="text-sm font-bold text-primary-text mt-0.5">Mobile Payment Architecture</div>
                        </div>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-mint/15 text-mint border border-mint/30">
                          VERIFIED
                        </span>
                      </div>

                      {/* Criteria Progress */}
                      <div className="mt-4 space-y-2">
                        <div className="flex justify-between text-[11px]">
                          <span className="text-secondary-text">AI Verification Audit</span>
                          <span className="text-mint font-mono font-semibold">100% Pass</span>
                        </div>
                        <div className="w-full bg-primary-bg rounded-full h-1.5 overflow-hidden">
                          <div className="bg-gradient-to-r from-mint to-cyan-accent h-1.5 rounded-full w-full"></div>
                        </div>
                      </div>

                      {/* Binary decorative lines */}
                      <div className="mt-3 text-[10px] font-mono text-muted-text opacity-50 truncate">
                        01010000 01110010 01101111 01101101 01101001 01110011 01100101
                      </div>
                    </div>

                    {/* Bottom Escrow Coins & Shield */}
                    <div className="flex items-center justify-between pt-2">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-mint/20 to-cyan-accent/20 border border-mint/40 flex items-center justify-center text-mint font-bold text-lg">
                          $
                        </div>
                        <div>
                          <div className="text-xs text-secondary-text">Escrow Held</div>
                          <div className="text-sm font-bold text-primary-text font-mono">$1,200.00 USD</div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface border border-border-card text-xs text-mint font-medium">
                        <span>🛡️</span>
                        <span>Protected</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Floating 3D Token Badges */}
                <div className="absolute top-8 right-0 p-3 rounded-xl glass-card border border-cyan-accent/30 shadow-lg text-xs flex items-center gap-2 animate-bounce duration-1000">
                  <span className="text-cyan-accent text-base">⚡</span>
                  <span className="font-semibold text-primary-text">AI Audit Passed</span>
                </div>

                <div className="absolute bottom-6 left-0 p-3 rounded-xl glass-card border border-mint/30 shadow-lg text-xs flex items-center gap-2">
                  <span className="text-mint text-base">🔒</span>
                  <span className="font-semibold text-primary-text">PayPal Authorized</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Feature Section (Matching 3 Bottom Cards in Reference Image) */}
      <section id="features" className="py-24 relative border-t border-border-card bg-secondary-bg/50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
            <div className="text-xs font-mono uppercase tracking-widest text-mint font-semibold">
              ENGINEERED FOR ABSOLUTE INTEGRITY
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-primary-text tracking-tight">
              Three Pillars of Protected Commerce
            </h2>
            <p className="text-secondary-text text-sm sm:text-base">
              A unified protocol replacing ambiguous freelance contracts with mathematical clarity and payment guarantees.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            {/* Card 1: Smart Agreements */}
            <div className="glass-card rounded-2xl p-8 hover:border-mint/40 transition-all duration-300 group hover:-translate-y-1">
              <div className="w-14 h-14 rounded-2xl bg-surface border border-border-subtle flex items-center justify-center text-mint text-2xl mb-6 group-hover:scale-110 transition-transform shadow-lg shadow-mint/10">
                <svg className="w-7 h-7 text-mint" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <rect x="4" y="4" width="16" height="16" rx="2" />
                  <rect x="9" y="9" width="6" height="6" />
                  <path d="M9 1v3M15 1v3M9 20v3M15 20v3M20 9h3M20 14h3M1 9h3M1 14h3" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-primary-text mb-3 group-hover:text-mint transition-colors">
                Smart Agreements
              </h3>
              <p className="text-sm text-secondary-text leading-relaxed">
                Generate unambiguous contracts from brief natural language prompts. Every agreement outlines specific deliverables, deadlines, and verifiable acceptance criteria.
              </p>
              <div className="mt-6 pt-4 border-t border-border-card flex items-center text-xs font-semibold text-mint gap-1">
                <span>AI Scope Engine</span>
                <span>→</span>
              </div>
            </div>

            {/* Card 2: AI Verification */}
            <div className="glass-card rounded-2xl p-8 hover:border-cyan-accent/40 transition-all duration-300 group hover:-translate-y-1">
              <div className="w-14 h-14 rounded-2xl bg-surface border border-border-subtle flex items-center justify-center text-cyan-accent text-2xl mb-6 group-hover:scale-110 transition-transform shadow-lg shadow-cyan-accent/10">
                <svg className="w-7 h-7 text-cyan-accent" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  <path d="M9 12l2 2 4-4" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-primary-text mb-3 group-hover:text-cyan-accent transition-colors">
                AI Deliverable Audit
              </h3>
              <p className="text-sm text-secondary-text leading-relaxed">
                Freelancers upload code, designs, or documentation. AI evaluates the delivered evidence against contractual criteria to generate a transparent audit report.
              </p>
              <div className="mt-6 pt-4 border-t border-border-card flex items-center text-xs font-semibold text-cyan-accent gap-1">
                <span>Objective Evidence Evaluation</span>
                <span>→</span>
              </div>
            </div>

            {/* Card 3: Secure Payments */}
            <div className="glass-card rounded-2xl p-8 hover:border-emerald/40 transition-all duration-300 group hover:-translate-y-1">
              <div className="w-14 h-14 rounded-2xl bg-surface border border-border-subtle flex items-center justify-center text-emerald text-2xl mb-6 group-hover:scale-110 transition-transform shadow-lg shadow-emerald/10">
                <svg className="w-7 h-7 text-emerald" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <rect x="2" y="5" width="20" height="14" rx="2" />
                  <line x1="2" y1="10" x2="22" y2="10" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-primary-text mb-3 group-hover:text-emerald transition-colors">
                Controlled Escrow
              </h3>
              <p className="text-sm text-secondary-text leading-relaxed">
                Funds are authorized safely in PayPal escrow before work begins. Payments can only be captured and released upon explicit customer final approval.
              </p>
              <div className="mt-6 pt-4 border-t border-border-card flex items-center text-xs font-semibold text-emerald gap-1">
                <span>Zero Unauthorized Captures</span>
                <span>→</span>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 7-Step Interactive Workflow Section */}
      <section id="how-it-works" className="py-24 relative border-t border-border-card">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
            <div className="text-xs font-mono uppercase tracking-widest text-mint font-semibold">
              TRANSPARENT LIFECYCLE
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-primary-text tracking-tight">
              From Agreement to Payment in 7 Steps
            </h2>
            <p className="text-secondary-text text-sm sm:text-base">
              A streamlined, predictable flow that protects both customer budgets and freelancer labor.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { num: '01', title: 'Create Agreement', desc: 'Customer outlines project scope; AI generates explicit deliverables & acceptance criteria.' },
              { num: '02', title: 'Approve Terms', desc: 'Both customer and freelancer review and electronically approve the agreement.' },
              { num: '03', title: 'Authorize Escrow', desc: 'Customer authorizes funds via PayPal escrow. Payment is locked and guaranteed.' },
              { num: '04', title: 'Submit Deliverables', desc: 'Freelancer completes milestones and submits evidence files directly into the workspace.' },
              { num: '05', title: 'AI Verification', desc: 'AI audits submissions against acceptance criteria and produces an impartial audit summary.' },
              { num: '06', title: 'Customer Approval', desc: 'Customer reviews the audit and gives final approval. AI verification remains purely advisory.' },
              { num: '07', title: 'Payment Capture', desc: 'Backend executes PayPal capture to release escrowed funds directly to the freelancer.' },
            ].map((step) => (
              <div key={step.num} className="glass-card rounded-2xl p-6 border border-border-card hover:border-mint/30 transition-all">
                <div className="text-2xl font-extrabold font-mono text-mint/60 mb-3">
                  {step.num}
                </div>
                <h4 className="font-bold text-primary-text text-base mb-2">
                  {step.title}
                </h4>
                <p className="text-xs text-secondary-text leading-relaxed">
                  {step.desc}
                </p>
              </div>
            ))}

            {/* Final Outcome card */}
            <div className="glass-card rounded-2xl p-6 border border-mint/40 bg-gradient-to-br from-card-bg to-surface flex flex-col justify-between">
              <div>
                <div className="text-2xl mb-2">🤝</div>
                <h4 className="font-bold text-mint text-base mb-1">
                  100% Trust Guarantee
                </h4>
                <p className="text-xs text-secondary-text">
                  Zero unpaid work for freelancers. Zero unverified payments for customers.
                </p>
              </div>
              <Link
                to="/register"
                className="mt-4 text-xs font-bold text-primary-bg bg-mint hover:bg-mint-light px-4 py-2.5 rounded-xl text-center transition-colors"
              >
                Join PromisePay →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Governance & Trust Section */}
      <section id="governance" className="py-20 relative border-t border-border-card bg-surface/30">
        <div className="max-w-4xl mx-auto px-6 text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-mint/10 border border-mint/20 text-xs font-mono text-mint">
            <span>⚖️</span> CORE GOVERNANCE CHARTER
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-primary-text">
            AI is Advisory. You Have the Final Word.
          </h2>
          <p className="text-secondary-text text-sm sm:text-base leading-relaxed max-w-2xl mx-auto">
            PromisePay is built on a non-negotiable principle: Artificial Intelligence verifies facts and validates code, but human agreement governs transactions. Funds are never captured without customer consent.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-6 text-left max-w-2xl mx-auto">
            <div className="p-4 rounded-xl bg-card-bg border border-border-card flex items-start gap-3">
              <span className="text-mint text-lg">✓</span>
              <div>
                <div className="text-sm font-bold text-primary-text">No Autonomous Captures</div>
                <div className="text-xs text-secondary-text mt-0.5">Payment release requires authenticated customer signatures.</div>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-card-bg border border-border-card flex items-start gap-3">
              <span className="text-mint text-lg">✓</span>
              <div>
                <div className="text-sm font-bold text-primary-text">Audited Evidence Trails</div>
                <div className="text-xs text-secondary-text mt-0.5">Every file upload and criterion test is permanently logged.</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final Call to Action */}
      <section className="py-24 relative border-t border-border-card text-center px-6">
        <div className="max-w-3xl mx-auto space-y-6">
          <h2 className="text-4xl sm:text-5xl font-extrabold text-primary-text tracking-tight">
            Make Every Agreement Count.
          </h2>
          <p className="text-secondary-text text-base max-w-xl mx-auto">
            Experience the peace of mind of AI-verified deliverables and customer-controlled escrow payments.
          </p>
          <div className="pt-4">
            <Link
              to="/register"
              className="inline-flex items-center gap-3 px-9 py-4 rounded-full bg-gradient-to-r from-mint to-cyan-accent text-primary-bg font-extrabold text-sm tracking-wide shadow-xl shadow-mint/20 hover:scale-105 transition-all"
            >
              Start Building Trust
              <svg className="w-4 h-4 text-primary-bg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border-card py-12 bg-primary-bg text-secondary-text text-xs">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-lg bg-mint flex items-center justify-center text-primary-bg font-bold text-xs">
              PP
            </div>
            <span className="text-primary-text font-bold text-sm tracking-tight font-mono">PromisePay Inc.</span>
          </div>
          <div className="text-muted-text">
            © 2026 PromisePay. All rights reserved. Secured by PayPal Escrow Protocol.
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
