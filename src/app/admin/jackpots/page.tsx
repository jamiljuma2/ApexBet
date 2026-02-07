"use client";
import React, { useState } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import AdminTable from '@/components/admin/AdminTable';
import StatusBadge from '@/components/admin/StatusBadge';

interface JackpotRow {
  id: string;
  name: string;
  amount: string;
  status: 'active' | 'closed' | 'pending';
  timer: string;
}

const jackpots: JackpotRow[] = [
  { id: 'J1001', name: 'Mega Jackpot', amount: 'Ksh 5,000,000', status: 'active', timer: '01:23:45' },
  { id: 'J1002', name: 'Daily Jackpot', amount: 'Ksh 500,000', status: 'pending', timer: '12:00:00' },
  { id: 'J1003', name: 'Super 6', amount: 'Ksh 1,000,000', status: 'closed', timer: '00:00:00' },
];

const statusMap = {
  active: <StatusBadge status="success">Active</StatusBadge>,
  closed: <StatusBadge status="danger">Closed</StatusBadge>,
  pending: <StatusBadge status="pending">Pending</StatusBadge>,
};

const JackpotManagementPage: React.FC = () => {
  const [editId, setEditId] = useState<string | null>(null);
  const [amountState, setAmountState] = useState(jackpots.map((j) => j.amount));
  return (
    <AdminLayout>
      <h1 className="text-xl font-bold mb-4">Jackpot Management</h1>
      <AdminTable
        columns={[
          { key: 'name', label: 'Jackpot' },
          { key: 'amount', label: 'Amount', className: 'font-mono' },
          { key: 'timer', label: 'Countdown' },
          { key: 'status', label: 'Status' },
          { key: 'actions', label: 'Actions' },
        ]}
        data={jackpots.map((j, i) => ({ ...j, amount: amountState[i], actions: '' }))}
        renderRow={(row, idx) => (
          <tr key={row.id} className="bg-apex-muted/30 hover:bg-apex-muted/50 transition-colors">
            <td className="px-3 py-2">{row.name}</td>
            <td className="px-3 py-2 font-mono">
              {editId === row.id ? (
                <input
                  type="text"
                  className="bg-apex-card border border-apex-muted rounded px-2 py-1 w-24 text-white font-mono"
                  value={amountState[idx]}
                  onChange={(e) => {
                    const newAmounts = [...amountState];
                    newAmounts[idx] = e.target.value;
                    setAmountState(newAmounts);
                  }}
                />
              ) : (
                row.amount
              )}
            </td>
            <td className="px-3 py-2 font-mono text-amber-400">{row.timer}</td>
            <td className="px-3 py-2">{statusMap[row.status]}</td>
            <td className="px-3 py-2 flex gap-2">
              <button
                className="text-apex-primary hover:underline text-xs"
                onClick={() => setEditId(editId === row.id ? null : row.id)}
              >
                {editId === row.id ? 'Save' : 'Edit'}
              </button>
              <button
                className={`text-xs ${row.status === 'active' ? 'text-red-500' : 'text-green-500'} hover:underline`}
              >
                {row.status === 'active' ? 'Close' : 'Activate'}
              </button>
            </td>
          </tr>
        )}
      />
    </AdminLayout>
  );
};

export default JackpotManagementPage;
