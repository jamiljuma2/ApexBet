"use client";
import React, { useState } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import AdminTable from '@/components/admin/AdminTable';
import StatusBadge from '@/components/admin/StatusBadge';
import ConfirmModal from '@/components/admin/ConfirmModal';

interface ResultRow {
  id: string;
  match: string;
  status: 'pending' | 'locked' | 'submitted';
  result: string;
}

const results: ResultRow[] = [
  { id: 'R1001', match: 'Team A vs Team B', status: 'pending', result: '' },
  { id: 'R1002', match: 'Team C vs Team D', status: 'submitted', result: '2-1' },
  { id: 'R1003', match: 'Player X vs Player Y', status: 'locked', result: '' },
];

const statusMap = {
  pending: <StatusBadge status="pending">Pending</StatusBadge>,
  submitted: <StatusBadge status="success">Submitted</StatusBadge>,
  locked: <StatusBadge status="danger">Locked</StatusBadge>,
};

const ResultsManagementPage: React.FC = () => {
  const [editId, setEditId] = useState<string | null>(null);
  const [resultState, setResultState] = useState(results.map((r) => r.result));
  const [modal, setModal] = useState<{ open: boolean; id?: string }>({ open: false });
  return (
    <AdminLayout>
      <h1 className="text-xl font-bold mb-4">Results Management</h1>
      <AdminTable
        columns={[
          { key: 'match', label: 'Match' },
          { key: 'status', label: 'Status' },
          { key: 'result', label: 'Result', className: 'font-mono' },
          { key: 'actions', label: 'Actions' },
        ]}
        data={results.map((r, i) => ({ ...r, result: resultState[i], actions: '' }))}
        renderRow={(row, idx) => (
          <tr key={row.id} className="bg-apex-muted/30 hover:bg-apex-muted/50 transition-colors">
            <td className="px-3 py-2">{row.match}</td>
            <td className="px-3 py-2">{statusMap[row.status]}</td>
            <td className="px-3 py-2 font-mono">
              {editId === row.id && row.status === 'pending' ? (
                <input
                  type="text"
                  className="bg-apex-card border border-apex-muted rounded px-2 py-1 w-20 text-white font-mono"
                  value={resultState[idx]}
                  onChange={(e) => {
                    const newResults = [...resultState];
                    newResults[idx] = e.target.value;
                    setResultState(newResults);
                  }}
                />
              ) : (
                row.result || <span className="text-gray-500">-</span>
              )}
            </td>
            <td className="px-3 py-2 flex gap-2">
              {row.status === 'pending' && (
                <>
                  <button
                    className="text-apex-primary hover:underline text-xs"
                    onClick={() => setEditId(editId === row.id ? null : row.id)}
                  >
                    {editId === row.id ? 'Save' : 'Edit'}
                  </button>
                  <button
                    className="text-green-500 hover:underline text-xs"
                    onClick={() => setModal({ open: true, id: row.id })}
                  >
                    Submit
                  </button>
                </>
              )}
              {row.status === 'locked' && <span className="text-gray-400 text-xs">Locked</span>}
            </td>
          </tr>
        )}
      />
      <ConfirmModal
        open={modal.open}
        title="Confirm Submission"
        description={`Submit result for match ${modal.id}? This action cannot be undone.`}
        onCancel={() => setModal({ open: false })}
        onConfirm={() => setModal({ open: false })}
      />
    </AdminLayout>
  );
};

export default ResultsManagementPage;
