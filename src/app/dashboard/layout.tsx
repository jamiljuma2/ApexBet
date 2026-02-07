import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { DashboardNav } from '@/components/layout/DashboardNav';
import { BetSlipSidebar } from '@/components/bets/BetSlipSidebar';

export default async function DashboardLayout({
  children,
}: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/auth/login');

  return (
    <div className="min-h-screen bg-apex-dark flex">
      <DashboardNav user={user} />
      <main className="flex-1 p-4 md:p-6 overflow-auto">
        {children}
      </main>
      <BetSlipSidebar />
    </div>
  );
}
