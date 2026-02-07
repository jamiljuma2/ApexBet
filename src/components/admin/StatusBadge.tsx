import React from 'react';

export type StatusType = 'success' | 'pending' | 'danger' | 'default';

const statusColors: Record<StatusType, string> = {
  success: 'bg-green-600 text-white',
  pending: 'bg-amber-500 text-white',
  danger: 'bg-red-600 text-white',
  default: 'bg-gray-500 text-white',
};

export interface StatusBadgeProps {
  status: StatusType;
  children: React.ReactNode;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status, children }) => (
  <span className={`inline-block px-2 py-0.5 rounded text-xs font-mono font-semibold ${statusColors[status]}`}>{children}</span>
);

export default StatusBadge;
