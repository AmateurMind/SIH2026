import React from 'react';

const map = {
  applied: 'bg-white text-blue-800 border border-blue-200',
  pending_mentor_approval: 'bg-white text-yellow-800 border border-yellow-200',
  approved: 'bg-white text-green-800 border border-green-200',
  rejected: 'bg-white text-red-800 border border-red-200',
  interview_scheduled: 'bg-white text-purple-800 border border-purple-200',
  interview_completed: 'bg-white text-indigo-800 border border-indigo-200',
  offered: 'bg-white text-emerald-800 border border-emerald-200',
  accepted: 'bg-white text-emerald-900 border border-emerald-200'
};

const StatusBadge = ({ status, className = '' }) => {
  const cls = map[status] || 'bg-secondary-100 text-secondary-700';
  const label = String(status || '')?.replace(/_/g, ' ');
  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${cls} ${className}`}>{label}</span>
  );
};

export default StatusBadge;