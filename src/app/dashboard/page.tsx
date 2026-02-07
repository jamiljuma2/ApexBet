import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name')
    .single();
  const { data: wallet } = await supabase
    .from('wallets')
    .select('balance_kes')
    .single();

  const balance = wallet?.balance_kes ?? 0;

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-2">
        Welcome back{profile?.full_name ? `, ${profile.full_name}` : ''}
      </h1>
      <p className="text-gray-400 mb-6">Manage your bets and wallet.</p>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        <div className="card-apex">
          <p className="text-gray-400 text-sm">Wallet balance</p>
          <p className="text-2xl font-bold text-apex-primary">KES {Number(balance).toLocaleString()}</p>
          <div className="mt-3 flex gap-2">
            <Link href="/dashboard/deposit" className="btn-primary text-sm py-1.5 px-3">
              Deposit
            </Link>
            <Link
              href="/dashboard/withdraw"
              className="bg-apex-muted hover:bg-apex-primary/20 text-white border border-apex-primary text-sm py-1.5 px-3 rounded-lg"
            >
              Withdraw
            </Link>
          </div>
        </div>
        <Link href="/sports" className="card-apex block hover:border-apex-primary/50 transition-colors">
          <p className="text-gray-400 text-sm">Sports</p>
          <p className="text-xl font-bold text-white">Football, Basketball, Tennis</p>
          <p className="text-apex-primary text-sm mt-1">Place bets →</p>
        </Link>
        <Link href="/jackpots" className="card-apex block hover:border-apex-primary/50 transition-colors">
          <p className="text-gray-400 text-sm">Jackpots</p>
          <p className="text-xl font-bold text-white">Daily & Mega Jackpots</p>
          <p className="text-apex-primary text-sm mt-1">Play now →</p>
        </Link>
      </div>

      <div className="card-apex">
        <h2 className="text-lg font-semibold text-white mb-4">Quick links</h2>
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
