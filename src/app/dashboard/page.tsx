import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name')
    .single();
  return (
    <div className="px-2 sm:px-4 py-4 max-w-3xl mx-auto pt-16">
      <h1 className="text-xl sm:text-2xl font-bold text-white mb-2 text-center sm:text-left">
        Welcome back{profile?.full_name ? `, ${profile.full_name}` : ''}
      </h1>
      <p className="text-gray-400 mb-4 sm:mb-6 text-center sm:text-left">Manage your bets and wallet.</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mb-6">
        <Link href="/sports" className="card-apex block hover:border-apex-primary/50 transition-colors p-3 sm:p-4 text-center sm:text-left">
          <p className="text-gray-400 text-xs sm:text-sm">Sports</p>
          <p className="text-lg sm:text-xl font-bold text-white">Football, Basketball, Tennis</p>
          <p className="text-apex-primary text-xs sm:text-sm mt-1">Place bets →</p>
        </Link>
        <Link href="/jackpots" className="card-apex block hover:border-apex-primary/50 transition-colors p-3 sm:p-4 text-center sm:text-left">
          <p className="text-gray-400 text-xs sm:text-sm">Jackpots</p>
          <p className="text-lg sm:text-xl font-bold text-white">Daily & Mega Jackpots</p>
          <p className="text-apex-primary text-xs sm:text-sm mt-1">Play now →</p>
        </Link>
      </div>

      <div className="card-apex p-3 sm:p-4">
        <h2 className="text-base sm:text-lg font-semibold text-white mb-3 sm:mb-4 text-center sm:text-left">Quick links</h2>
        <ul className="space-y-2">
          <li>
            <Link href="/dashboard/bets" className="text-apex-primary hover:underline">
              Betting history
            </Link>
          </li>
          <li>
            <Link href="/dashboard/transactions" className="text-apex-primary hover:underline">
              Transaction history
            </Link>
          </li>
          <li>
            <Link href="/dashboard/profile" className="text-apex-primary hover:underline">
              Profile & limits
            </Link>
          </li>
        </ul>
      </div>
    </div>
  );
}
