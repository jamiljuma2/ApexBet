'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import type { User } from '@supabase/supabase-js';
import { createClient } from '@/lib/supabase/client';
import { clsx } from 'clsx';

const nav = [
  { href: '/dashboard', label: 'Home' },
  { href: '/sports', label: 'Sports' },
  { href: '/live', label: 'Live' },
  { href: '/jackpots', label: 'Jackpots' },
  { href: '/dashboard/bets', label: 'My Bets' },
  { href: '/dashboard/transactions', label: 'Transactions' },
  { href: '/dashboard/profile', label: 'Profile' },
];

export function DashboardNav({ user }: { user: User }) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  async function signOut() {
    await supabase.auth.signOut();
    router.push('/');
    router.refresh();
  }

  return (
    <nav className="w-56 bg-apex-card border-r border-apex-muted flex flex-col">
      <div className="p-4 border-b border-apex-muted">
        <Link href="/" className="text-xl font-bold text-apex-primary">
          ApexBet
        </Link>
      </div>
      <ul className="flex-1 p-2 space-y-1">
        {nav.map((item) => (
          <li key={item.href}>
            <Link
              href={item.href}
              className={clsx(
                'block px-3 py-2 rounded-lg text-sm',
                pathname === item.href
                  ? 'bg-apex-primary/20 text-apex-primary'
                  : 'text-gray-300 hover:bg-apex-muted'
              )}
            >
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
      <div className="p-2 border-t border-apex-muted">
        <p className="px-3 py-1 text-xs text-gray-500 truncate">{user.email}</p>
        <button
          onClick={signOut}
          className="w-full mt-2 px-3 py-2 text-left text-sm text-red-400 hover:bg-apex-muted rounded-lg"
        >
          Sign out
        </button>
      </div>
    </nav>
  );
}
