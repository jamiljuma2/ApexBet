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
    <div className="min-h-screen bg-apex-dark flex flex-col">
      <nav className="w-full bg-apex-card border-b border-apex-muted px-2 py-2 overflow-x-auto scrollbar-hide">
        <div className="flex flex-nowrap items-center gap-2 md:gap-4 min-w-max">
          <Link href="/admin" className="flex-shrink-0 text-lg font-bold text-apex-primary mr-2 md:mr-4">ApexBet Admin</Link>
          <Link href="/admin" className="flex-shrink-0 py-2 px-3 rounded hover:bg-apex-primary/10 text-gray-300 hover:text-apex-primary transition whitespace-nowrap">Dashboard</Link>
          <Link href="/admin/users" className="flex-shrink-0 py-2 px-3 rounded hover:bg-apex-primary/10 text-gray-300 hover:text-apex-primary transition whitespace-nowrap">Users</Link>
          <Link href="/admin/bets" className="flex-shrink-0 py-2 px-3 rounded hover:bg-apex-primary/10 text-gray-300 hover:text-apex-primary transition whitespace-nowrap">Bets</Link>
          <Link href="/admin/transactions" className="flex-shrink-0 py-2 px-3 rounded hover:bg-apex-primary/10 text-gray-300 hover:text-apex-primary transition whitespace-nowrap">Transactions</Link>
          <Link href="/admin/events" className="flex-shrink-0 py-2 px-3 rounded hover:bg-apex-primary/10 text-gray-300 hover:text-apex-primary transition whitespace-nowrap">Events</Link>
          <Link href="/admin/jackpots" className="flex-shrink-0 py-2 px-3 rounded hover:bg-apex-primary/10 text-gray-300 hover:text-apex-primary transition whitespace-nowrap">Jackpots</Link>
          <Link href="/admin/audit" className="flex-shrink-0 py-2 px-3 rounded hover:bg-apex-primary/10 text-gray-300 hover:text-apex-primary transition whitespace-nowrap">Audit logs</Link>
          <Link href="/dashboard" className="flex-shrink-0 ml-auto py-2 px-3 rounded text-gray-500 text-sm hover:text-apex-primary hover:bg-apex-primary/10 transition whitespace-nowrap">← Back to app</Link>
        </div>
      </nav>
      <main className="flex-1 p-6 overflow-auto">{children}</main>
    </div>
  );
}
