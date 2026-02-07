"use client";
import React, { useState } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import AdminTable from '@/components/admin/AdminTable';
import StatusBadge from '@/components/admin/StatusBadge';

interface FlaggedUserRow {
  id: string;
  user: string;
  risk: 'low' | 'medium' | 'high';
  notes: string;
  status: 'flagged' | 'reviewed';
}

const flaggedUsers: FlaggedUserRow[] = [
  { id: 'F1001', user: 'user1@mail.com', risk: 'high', notes: 'Multiple large bets in short time', status: 'flagged' },
  { id: 'F1002', user: 'user2@mail.com', risk: 'medium', notes: 'Unusual withdrawal pattern', status: 'reviewed' },
  { id: 'F1003', user: 'user3@mail.com', risk: 'low', notes: 'Frequent login attempts', status: 'flagged' },
];

const riskMap = {
  low: <StatusBadge status="success">Low</StatusBadge>,
  medium: <StatusBadge status="pending">Medium</StatusBadge>,
  high: <StatusBadge status="danger">High</StatusBadge>,
};

const statusMap = {
  flagged: <StatusBadge status="pending">Flagged</StatusBadge>,
  reviewed: <StatusBadge status="success">Reviewed</StatusBadge>,
};

const RiskMonitoringPage: React.FC = () => {
  const [selected, setSelected] = useState<FlaggedUserRow | null>(null);
  return (
    <AdminLayout>
      <h1 className="text-xl font-bold mb-4">Risk & Fraud Monitoring</h1>
      <AdminTable
        columns={[
          { key: 'user', label: 'User' },
          { key: 'risk', label: 'Risk Level' },
          { key: 'notes', label: 'Notes' },
          { key: 'status', label: 'Status' },
          { key: 'actions', label: 'Actions' },
        ]}
        data={flaggedUsers.map((u) => ({ ...u, actions: '' }))}
        renderRow={(row) => (
          <tr key={row.id} className="bg-apex-muted/30 hover:bg-apex-muted/50 transition-colors">
            <td className="px-3 py-2">{row.user}</td>
            <td className="px-3 py-2">{riskMap[row.risk]}</td>
            <td className="px-3 py-2 text-xs text-gray-300">{row.notes}</td>
            <td className="px-3 py-2">{statusMap[row.status]}</td>
            <td className="px-3 py-2">
              <button className="text-apex-primary hover:underline text-xs" onClick={() => setSelected(row)}>
                Review
              </button>
            </td>
          </tr>
        )}
      />
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="bg-apex-card rounded-lg shadow-lg p-6 w-full max-w-md">
            <h2 className="text-lg font-bold mb-2">Review User</h2>
            <div className="mb-2 text-sm text-gray-300">User: <span className="font-mono">{selected.user}</span></div>
            <div className="mb-2 text-sm text-gray-300">Risk: {riskMap[selected.risk]}</div>
            <div className="mb-2 text-sm text-gray-300">Notes: {selected.notes}</div>
            <div className="flex justify-end gap-2 mt-4">
              <button className="px-4 py-1.5 rounded bg-gray-600 text-white hover:bg-gray-500" onClick={() => setSelected(null)}>
                Close
              </button>
              <button className="px-4 py-1.5 rounded bg-apex-primary text-white hover:bg-apex-primary/80">
                Mark Reviewed
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default RiskMonitoringPage;
