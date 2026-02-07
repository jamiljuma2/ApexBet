import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';

const ADMIN_ROLES = ['super_admin', 'risk_manager', 'finance_admin', 'support_agent'];

export default async function AdminLayout({
  children,
}: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/auth/login');
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();
  if (!profile || !ADMIN_ROLES.includes(profile.role)) redirect('/dashboard');

  return (
    <div className="min-h-screen bg-apex-dark flex">
      <aside className="w-56 bg-apex-card border-r border-apex-muted p-4">
        <Link href="/admin" className="text-lg font-bold text-apex-primary block mb-4">
          ApexBet Admin
        </Link>
        <nav className="space-y-1">
          <Link href="/admin" className="block py-2 text-gray-300 hover:text-apex-primary">Dashboard</Link>
          <Link href="/admin/users" className="block py-2 text-gray-300 hover:text-apex-primary">Users</Link>
          <Link href="/admin/bets" className="block py-2 text-gray-300 hover:text-apex-primary">Bets</Link>
          <Link href="/admin/transactions" className="block py-2 text-gray-300 hover:text-apex-primary">Transactions</Link>
          <Link href="/admin/events" className="block py-2 text-gray-300 hover:text-apex-primary">Events</Link>
          <Link href="/admin/jackpots" className="block py-2 text-gray-300 hover:text-apex-primary">Jackpots</Link>
          <Link href="/admin/audit" className="block py-2 text-gray-300 hover:text-apex-primary">Audit logs</Link>
          <Link href="/dashboard" className="block py-2 text-gray-500 text-sm mt-4">← Back to app</Link>
        </nav>
      </aside>
      <main className="flex-1 p-6 overflow-auto">{children}</main>
    </div>
  );
}
