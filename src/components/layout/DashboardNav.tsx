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
  // Framer Motion for micro-interactions
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { motion } = require('framer-motion');

  async function signOut() {
    await supabase.auth.signOut();
    router.push('/');
    router.refresh();
  }

  // Split nav for hierarchy
  const bettingNav = nav.slice(1, 4); // Sports, Live, Jackpots
  const accountNav = nav.slice(4); // My Bets, Transactions, Profile

  // Find active index for indicator
  const allNav = [...bettingNav, ...accountNav];
  const activeIndex = allNav.findIndex((item) => pathname === item.href);

  return (
    <nav className="w-56 bg-apex-dark border-r border-apex-muted flex flex-col sticky top-0 h-screen">
      <div className="p-5 border-b border-apex-muted">
        <Link href="/" className="text-2xl font-bold text-apex-primary tracking-tight">
          ApexBet
        </Link>
      </div>
      <ul className="flex-1 px-2 pt-4 pb-2 space-y-2">
        {/* Betting actions group */}
        <div className="mb-6">
          {bettingNav.map((item, idx) => (
            <li key={item.href} className="relative">
              <Link
                href={item.href}
                className={clsx(
                  'flex items-center gap-2 px-4 py-3 rounded-lg text-base font-medium transition-colors duration-200',
                  pathname === item.href
                    ? 'text-apex-primary bg-apex-primary/10'
                    : 'text-gray-100 hover:text-apex-accent hover:bg-apex-muted',
                  'tracking-wide',
                  item.label === 'Live' && 'font-semibold'
                )}
                style={{ minHeight: 44 }}
              >
                {/* Live tab emphasis */}
                {item.label === 'Live' && (
                  <motion.span
                    className="mr-2 flex items-center"
                    animate={{ opacity: [0.7, 1, 0.7], scale: [1, 1.15, 1] }}
                    transition={{ repeat: Infinity, duration: 1.2 }}
                  >
                    <span className="w-2 h-2 bg-apex-accent rounded-full shadow-lg" />
                  </motion.span>
                )}
                <span>{item.label}</span>
                {/* Active indicator */}
                {pathname === item.href && (
                  <motion.div
                    layoutId="nav-active-indicator"
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-apex-primary rounded-full"
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  />
                )}
              </Link>
            </li>
          ))}
        </div>
        {/* Account actions group */}
        <div className="mt-2">
          {accountNav.map((item) => (
            <li key={item.href} className="relative">
              <Link
                href={item.href}
                className={clsx(
                  'flex items-center gap-2 px-4 py-3 rounded-lg text-base font-normal transition-colors duration-200',
                  pathname === item.href
                    ? 'text-apex-primary bg-apex-primary/10'
                    : 'text-gray-300 hover:text-apex-accent hover:bg-apex-muted',
                  'tracking-wide'
                )}
                style={{ minHeight: 44 }}
              >
                <span>{item.label}</span>
                {pathname === item.href && (
                  <motion.div
                    layoutId="nav-active-indicator"
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-apex-primary rounded-full"
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  />
                )}
              </Link>
            </li>
          ))}
        </div>
      </ul>
      <div className="p-4 border-t border-apex-muted mt-auto">
        <p className="px-3 py-1 text-xs text-gray-500 truncate font-mono">{user.email}</p>
        <button
          onClick={signOut}
          className="w-full mt-3 px-3 py-3 text-left text-sm text-red-400 hover:bg-apex-muted rounded-lg font-medium tracking-wide transition-colors duration-200"
        >
          Sign out
        </button>
      </div>
    </nav>
  );
}
