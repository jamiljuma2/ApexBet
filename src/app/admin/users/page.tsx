"use client";
import React, { useState } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import AdminTable from '@/components/admin/AdminTable';
import StatusBadge from '@/components/admin/StatusBadge';
import ConfirmModal from '@/components/admin/ConfirmModal';

const ADMIN_USERS_API = '/functions/v1/admin-users';

interface UserRow {
  id: string;
  phone: string;
  email: string;
  wallet: string;
  status: 'active' | 'suspended' | 'banned';
}

const users: UserRow[] = [
  { id: '1', phone: '+254700000001', email: 'user1@mail.com', wallet: 'Ksh 1,200', status: 'active' },
  { id: '2', phone: '+254700000002', email: 'user2@mail.com', wallet: 'Ksh 0', status: 'suspended' },
  { id: '3', phone: '+254700000003', email: 'user3@mail.com', wallet: 'Ksh 5,000', status: 'banned' },
];

const statusMap = {
  active: <StatusBadge status="success">Active</StatusBadge>,
  suspended: <StatusBadge status="pending">Suspended</StatusBadge>,
  banned: <StatusBadge status="danger">Banned</StatusBadge>,
};

const UserManagementPage: React.FC = () => {
  const [modal, setModal] = useState<{ open: boolean; user?: UserRow; action?: string }>({ open: false });
  return (
    <AdminLayout>
      <div className="mb-4 flex flex-col sm:flex-row justify-between items-center gap-2">
        <h1 className="text-xl font-bold">User Management</h1>
        <input className="bg-apex-muted/30 rounded px-3 py-1 text-sm text-white" placeholder="Search users..." />
      </div>
      <AdminTable
        columns={[
          { key: 'id', label: 'ID', className: 'font-mono' },
          { key: 'phone', label: 'Phone' },
          { key: 'email', label: 'Email' },
          { key: 'wallet', label: 'Wallet', className: 'font-mono' },
          { key: 'status', label: 'Status' },
          { key: 'actions', label: 'Actions' },
        ]}
        data={users.map((u) => ({ ...u, actions: '' }))}
        renderRow={(row) => (
          <tr key={row.id} className="bg-apex-muted/30 hover:bg-apex-muted/50 transition-colors">
            <td className="px-3 py-2 font-mono">{row.id}</td>
            <td className="px-3 py-2">{row.phone}</td>
            <td className="px-3 py-2">{row.email}</td>
            <td className="px-3 py-2 font-mono">{row.wallet}</td>
            <td className="px-3 py-2">{statusMap[row.status]}</td>
            <td className="px-3 py-2 flex gap-2">
              <button className="text-apex-primary hover:underline text-xs" onClick={() => setModal({ open: true, user: row, action: 'suspend' })} disabled={row.status !== 'active'}>Suspend</button>
              <button className="text-red-500 hover:underline text-xs" onClick={() => setModal({ open: true, user: row, action: 'ban' })} disabled={row.status === 'banned'}>Ban</button>
              <button className="text-gray-400 hover:underline text-xs">View</button>
            </td>
          </tr>
        )}
      />
      <ConfirmModal
        open={modal.open}
        title={`Confirm ${modal.action}`}
        description={`Are you sure you want to ${modal.action} user ${modal.user?.id}?`}
        onCancel={() => setModal({ open: false })}
        onConfirm={() => setModal({ open: false })}
      />
    </AdminLayout>
  );
};

export default UserManagementPage;
