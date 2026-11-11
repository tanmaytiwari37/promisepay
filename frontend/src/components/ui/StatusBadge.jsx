import React from 'react';

const STATUS_CONFIG = {
  DRAFT:              { bg: 'bg-gray-500/15',    border: 'border-gray-500/30',    text: 'text-gray-300',        dot: 'bg-gray-400',       label: 'Draft' },
  PENDING_APPROVAL:   { bg: 'bg-amber-500/15',   border: 'border-amber-500/30',   text: 'text-amber-300',       dot: 'bg-amber-400',      label: 'Pending Approval' },
  AGREED:             { bg: 'bg-cyan-accent/15', border: 'border-cyan-accent/30', text: 'text-cyan-accent',    dot: 'bg-cyan-accent',    label: 'Agreed' },
  PAYMENT_AUTHORIZED: { bg: 'bg-blue-500/15',    border: 'border-blue-500/30',    text: 'text-blue-300',        dot: 'bg-blue-400',       label: 'Escrow Authorized' },
  IN_PROGRESS:        { bg: 'bg-mint/15',        border: 'border-mint/30',        text: 'text-mint',            dot: 'bg-mint',           label: 'In Progress' },
  SUBMITTED:          { bg: 'bg-purple-500/15',  border: 'border-purple-500/30',  text: 'text-purple-300',      dot: 'bg-purple-400',     label: 'Submitted' },
  UNDER_REVIEW:       { bg: 'bg-cyan-accent/15', border: 'border-cyan-accent/30', text: 'text-cyan-accent',    dot: 'bg-cyan-accent',    label: 'Under AI Review' },
  APPROVED:           { bg: 'bg-emerald/15',     border: 'border-emerald/30',     text: 'text-emerald',         dot: 'bg-emerald',        label: 'Approved' },
  REJECTED:           { bg: 'bg-red-500/15',     border: 'border-red-500/30',     text: 'text-red-400',         dot: 'bg-red-400',        label: 'Rejected' },
  PAID:               { bg: 'bg-mint/20',        border: 'border-mint/40',        text: 'text-mint font-bold',  dot: 'bg-mint',           label: 'Paid & Completed' },
  CANCELLED:          { bg: 'bg-red-500/15',     border: 'border-red-500/30',     text: 'text-red-400',         dot: 'bg-red-400',        label: 'Cancelled' },
  DISPUTED:           { bg: 'bg-orange-500/15',  border: 'border-orange-500/30',  text: 'text-orange-400',      dot: 'bg-orange-400',     label: 'Disputed' },
};

export default function StatusBadge({ status }) {
  const config = STATUS_CONFIG[status?.toUpperCase()] || {
    bg: 'bg-gray-500/15',
    border: 'border-gray-500/30',
    text: 'text-gray-300',
    dot: 'bg-gray-400',
    label: status || 'Unknown',
  };

  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-medium border ${config.bg} ${config.border} ${config.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`}></span>
      <span>{config.label}</span>
    </span>
  );
}
