"use client";
import React, { useState } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import AdminTable from '@/components/admin/AdminTable';
import StatusBadge from '@/components/admin/StatusBadge';
import ConfirmModal from '@/components/admin/ConfirmModal';

interface TransactionRow {
  id: string;
  user: string;
  amount: string;
  type: 'deposit' | 'withdrawal';
  status: 'pending' | 'approved' | 'failed';
  date: string;
}

const deposits: TransactionRow[] = [
  { id: 'D1001', user: 'user1@mail.com', amount: 'Ksh 2,000', type: 'deposit', status: 'approved', date: '2026-02-07 10:00' },
  { id: 'D1002', user: 'user2@mail.com', amount: 'Ksh 500', type: 'deposit', status: 'pending', date: '2026-02-07 11:00' },
];

const withdrawals: TransactionRow[] = [
  { id: 'W1001', user: 'user3@mail.com', amount: 'Ksh 1,000', type: 'withdrawal', status: 'pending', date: '2026-02-07 09:00' },
  { id: 'W1002', user: 'user4@mail.com', amount: 'Ksh 3,000', type: 'withdrawal', status: 'failed', date: '2026-02-07 08:30' },
];

const statusMap = {
  pending: <StatusBadge status="pending">Pending</StatusBadge>,
  approved: <StatusBadge status="success">Approved</StatusBadge>,
  failed: <StatusBadge status="danger">Failed</StatusBadge>,
};

const TransactionsPage: React.FC = () => {
  const [modal, setModal] = useState<{ open: boolean; tx?: TransactionRow; action?: string }>({ open: false });
  return (
    <AdminLayout>
      <h1 className="text-xl font-bold mb-4">Transactions & Wallets</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h2 className="text-lg font-semibold mb-2">Deposits</h2>
          <AdminTable
            columns={[
              { key: 'id', label: 'ID', className: 'font-mono' },
              { key: 'user', label: 'User' },
              { key: 'amount', label: 'Amount', className: 'font-mono' },
              { key: 'status', label: 'Status' },
              { key: 'date', label: 'Date' },
            ]}
            data={deposits}
            renderRow={(row) => (
              <tr key={row.id} className="bg-apex-muted/30 hover:bg-apex-muted/50 transition-colors">
                <td className="px-3 py-2 font-mono">{row.id}</td>
                <td className="px-3 py-2">{row.user}</td>
                <td className="px-3 py-2 font-mono">{row.amount}</td>
                <td className="px-3 py-2">{statusMap[row.status]}</td>
                <td className="px-3 py-2">{row.date}</td>
              </tr>
            )}
          />
        </div>
        <div>
          <h2 className="text-lg font-semibold mb-2">Withdrawals</h2>
          <AdminTable
            columns={[
              { key: 'id', label: 'ID', className: 'font-mono' },
              { key: 'user', label: 'User' },
              { key: 'amount', label: 'Amount', className: 'font-mono' },
              { key: 'status', label: 'Status' },
              { key: 'date', label: 'Date' },
              { key: 'actions', label: 'Actions' },
            ]}
            data={withdrawals.map((w) => ({ ...w, actions: '' }))}
            renderRow={(row) => (
              <tr key={row.id} className="bg-apex-muted/30 hover:bg-apex-muted/50 transition-colors">
                <td className="px-3 py-2 font-mono">{row.id}</td>
                <td className="px-3 py-2">{row.user}</td>
                <td className="px-3 py-2 font-mono">{row.amount}</td>
                <td className="px-3 py-2">{statusMap[row.status]}</td>
                <td className="px-3 py-2">{row.date}</td>
                <td className="px-3 py-2 flex gap-2">
                  <button className="text-apex-primary hover:underline text-xs" onClick={() => setModal({ open: true, tx: row, action: 'approve' })} disabled={row.status !== 'pending'}>Approve</button>
                  <button className="text-red-500 hover:underline text-xs" onClick={() => setModal({ open: true, tx: row, action: 'reject' })} disabled={row.status !== 'pending'}>Reject</button>
                </td>
              </tr>
            )}
          />
        </div>
      </div>
      <ConfirmModal
        open={modal.open}
        title={`Confirm ${modal.action}`}
        description={`Are you sure you want to ${modal.action} withdrawal ${modal.tx?.id}?`}
        onCancel={() => setModal({ open: false })}
        onConfirm={() => setModal({ open: false })}
      />
    </AdminLayout>
  );
};

export default TransactionsPage;
