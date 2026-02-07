"use client";
import React, { useState } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import AdminTable from '@/components/admin/AdminTable';

interface AuditLogRow {
  id: string;
  action: string;
  actor: string;
  timestamp: string;
  details: string;
}

const logs: AuditLogRow[] = [
  { id: 'A1001', action: 'User Ban', actor: 'admin1', timestamp: '2026-02-07 10:00', details: 'Banned user user2@mail.com for suspicious activity.' },
  { id: 'A1002', action: 'Odds Edit', actor: 'admin2', timestamp: '2026-02-07 09:30', details: 'Changed odds for Team A vs Team B.' },
  { id: 'A1003', action: 'Withdrawal Approve', actor: 'admin1', timestamp: '2026-02-07 09:00', details: 'Approved withdrawal W1001.' },
];

const AuditLogsPage: React.FC = () => {
  const [selected, setSelected] = useState<AuditLogRow | null>(null);
  return (
    <AdminLayout>
      <h1 className="text-xl font-bold mb-4">Audit Logs</h1>
      <AdminTable
        columns={[
          { key: 'action', label: 'Action' },
          { key: 'actor', label: 'Actor', className: 'font-mono' },
          { key: 'timestamp', label: 'Timestamp', className: 'font-mono' },
          { key: 'details', label: 'Details' },
        ]}
        data={logs}
        renderRow={(row) => (
          <tr key={row.id} className="bg-apex-muted/30 hover:bg-apex-muted/50 transition-colors cursor-pointer" onClick={() => setSelected(row)}>
            <td className="px-3 py-2">{row.action}</td>
            <td className="px-3 py-2 font-mono">{row.actor}</td>
            <td className="px-3 py-2 font-mono">{row.timestamp}</td>
            <td className="px-3 py-2 truncate max-w-xs">{row.details}</td>
          </tr>
        )}
      />
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="bg-apex-card rounded-lg shadow-lg p-6 w-full max-w-md">
            <h2 className="text-lg font-bold mb-2">Log Details</h2>
            <div className="mb-2 text-sm text-gray-300">Action: {selected.action}</div>
            <div className="mb-2 text-sm text-gray-300">Actor: <span className="font-mono">{selected.actor}</span></div>
            <div className="mb-2 text-sm text-gray-300">Timestamp: <span className="font-mono">{selected.timestamp}</span></div>
            <div className="mb-2 text-sm text-gray-300">Details: {selected.details}</div>
            <div className="flex justify-end gap-2 mt-4">
              <button className="px-4 py-1.5 rounded bg-gray-600 text-white hover:bg-gray-500" onClick={() => setSelected(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default AuditLogsPage;
