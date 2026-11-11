import React from 'react';

const STATUS_CONFIG = {
  DRAFT:              { label: 'Draft',              dot: '#6b7280', bg: 'rgba(107,114,128,0.12)', text: '#9ca3af', border: 'rgba(107,114,128,0.20)' },
  PENDING_APPROVAL:   { label: 'Pending Approval',   dot: '#f59e0b', bg: 'rgba(245,158,11,0.10)',  text: '#fbbf24', border: 'rgba(245,158,11,0.22)' },
  AGREED:             { label: 'Agreed',             dot: '#3b82f6', bg: 'rgba(59,130,246,0.10)',  text: '#60a5fa', border: 'rgba(59,130,246,0.22)' },
  PAYMENT_AUTHORIZED: { label: 'Payment Auth.',      dot: '#8b5cf6', bg: 'rgba(139,92,246,0.10)',  text: '#a78bfa', border: 'rgba(139,92,246,0.22)' },
  IN_PROGRESS:        { label: 'In Progress',        dot: '#2dd4bf', bg: 'rgba(45,212,191,0.10)',  text: '#2dd4bf', border: 'rgba(45,212,191,0.22)' },
  SUBMITTED:          { label: 'Submitted',          dot: '#22d3ee', bg: 'rgba(34,211,238,0.10)',  text: '#22d3ee', border: 'rgba(34,211,238,0.22)' },
  UNDER_REVIEW:       { label: 'Under Review',       dot: '#f59e0b', bg: 'rgba(245,158,11,0.10)',  text: '#fbbf24', border: 'rgba(245,158,11,0.22)' },
  APPROVED:           { label: 'Approved',           dot: '#22c55e', bg: 'rgba(34,197,94,0.10)',   text: '#4ade80', border: 'rgba(34,197,94,0.22)' },
  PAID:               { label: 'Paid',               dot: '#10b981', bg: 'rgba(16,185,129,0.12)',  text: '#34d399', border: 'rgba(16,185,129,0.25)' },
  REJECTED:           { label: 'Rejected',           dot: '#ef4444', bg: 'rgba(239,68,68,0.10)',   text: '#f87171', border: 'rgba(239,68,68,0.22)' },
  CANCELLED:          { label: 'Cancelled',          dot: '#6b7280', bg: 'rgba(107,114,128,0.08)', text: '#6b7280', border: 'rgba(107,114,128,0.15)' },
};

export default function StatusBadge({ status }) {
  const key = status?.toUpperCase().replace(/ /g, '_') || 'DRAFT';
  const cfg = STATUS_CONFIG[key] || {
    label: status || 'Unknown',
    dot: '#6b7280', bg: 'rgba(107,114,128,0.10)', text: '#9ca3af', border: 'rgba(107,114,128,0.18)',
  };

  return (
    <span
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold font-mono whitespace-nowrap"
      style={{ background: cfg.bg, color: cfg.text, border: `1px solid ${cfg.border}` }}
    >
      <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: cfg.dot }} />
      {cfg.label}
    </span>
  );
}
