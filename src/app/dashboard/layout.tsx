import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { DashboardNav } from '@/components/layout/DashboardNav';
import { DesktopNav } from '@/components/layout/DesktopNav';
import { MobileNav } from '@/components/layout/MobileNav';
import { BetSlipSidebar } from '@/components/bets/BetSlipSidebar';

export default async function DashboardLayout({
  children,
}: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/auth/login');

  return (
    <div className="min-h-screen bg-apex-dark flex flex-col">
      {/* Top navigation bar for desktop */}
      <div className="hidden md:block">
        <DesktopNav user={user} />
      </div>
      {/* Top navigation bar for mobile */}
      <div className="md:hidden">
        <MobileNav user={user} />
      </div>
      <main className="flex-1 p-4 md:p-6 overflow-auto">
        {children}
      </main>
      <BetSlipSidebar />
    </div>
  );
}
