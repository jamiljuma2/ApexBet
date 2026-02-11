"use client";
import React, { useState, useEffect } from 'react';
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



const statusMap = {
  active: <StatusBadge status="success">Active</StatusBadge>,
  suspended: <StatusBadge status="pending">Suspended</StatusBadge>,
  banned: <StatusBadge status="danger">Banned</StatusBadge>,
};




const UserManagementPage: React.FC = () => {
  const [modal, setModal] = useState<{ open: boolean; user?: UserRow; action?: string }>({ open: false });
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchUsers() {
      setLoading(true);
      setError(null);
      try {
        // Dynamically import Supabase client
        const { createClient } = await import('@/lib/supabase/client');
        const supabase = createClient();
        const { data: sessionData } = await supabase.auth.getSession();
        const jwt = sessionData?.session?.access_token;
        if (!jwt) throw new Error('No admin session found');
        // Debug: print the JWT being sent
        console.log('JWT sent to admin-users function:', jwt);
        const res = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/admin-users`, {
          headers: {
            'Authorization': `Bearer ${jwt}`,
            'Content-Type': 'application/json',
          },
        });
        if (!res.ok) throw new Error('Failed to fetch users');
        const data = await res.json();
        setUsers(
          (data.users || []).map((u: any) => ({
            id: u.id,
            phone: u.phone || '',
            email: u.email,
            wallet: `Ksh ${Number(u.wallet_balance || 0).toLocaleString()}`,
            status: u.status as 'active' | 'suspended' | 'banned',
          }))
        );
      } catch (e) {
        setError((e as Error).message);
      } finally {
        setLoading(false);
      }
    }
    fetchUsers();
  }, []);

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
        loading={loading}
        error={error ?? undefined}
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
