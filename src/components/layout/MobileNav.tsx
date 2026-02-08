"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import type { User } from '@supabase/supabase-js';
import { createClient } from '@/lib/supabase/client';
import { clsx } from 'clsx';
// Framer Motion for micro-interactions
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { motion } = require('framer-motion');

const nav = [
  { href: '/dashboard', label: 'Home' },
  { href: '/sports', label: 'Sports' },
  { href: '/live', label: 'Live' },
  { href: '/jackpots', label: 'Jackpots' },
  { href: '/dashboard/bets', label: 'My Bets' },
  { href: '/dashboard/transactions', label: 'Transactions' },
  { href: '/dashboard/profile', label: 'Profile' },
];

export function MobileNav({ user }: { user: User }) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();
  const [balance, setBalance] = useState<number | null>(null);
  useEffect(() => {
    fetch('/api/wallet-balance')
      .then(res => res.json())
      .then(data => setBalance(data.balance_kes));
  }, []);

  // Split nav for hierarchy
  const bettingNav = nav.slice(1, 4); // Sports, Live, Jackpots
  const accountNav = nav.slice(4); // My Bets, Transactions, Profile

  // Find active index for indicator
  const allNav = [...bettingNav, ...accountNav];
  const activeIndex = allNav.findIndex((item) => pathname === item.href);

  async function signOut() {
    await supabase.auth.signOut();
    router.push('/');
    router.refresh();
  }

  return (
    <nav className="fixed bottom-0 left-0 w-full bg-apex-dark border-t border-apex-muted z-50 flex flex-col md:hidden">
      {/* Wallet balance and actions */}
      <div className="flex flex-col items-center justify-center gap-1 bg-apex-muted/60 rounded px-3 py-1 w-full">
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-200 font-mono">Wallet:</span>
          <span className="text-base font-bold text-apex-primary font-mono">
            {balance !== null ? `KES ${Number(balance).toLocaleString()}` : '...'}
          </span>
        </div>
        <div className="flex gap-2 mt-1">
          <Link href="/dashboard/deposit" className="btn-primary text-xs px-3 py-1">Deposit</Link>
          <Link href="/dashboard/withdraw" className="bg-apex-primary/10 text-apex-primary border border-apex-primary text-xs px-3 py-1 rounded-lg hover:bg-apex-primary/20 transition-colors">Withdraw</Link>
        </div>
      </div>
      <div className="flex-1 flex justify-center gap-2">
        {bettingNav.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={clsx(
              'flex flex-col items-center justify-center px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200',
              pathname === item.href
                ? 'text-apex-primary bg-apex-primary/10'
                : 'text-gray-100 hover:text-apex-accent hover:bg-apex-muted',
              item.label === 'Live' && 'font-semibold relative'
            )}
            style={{ minHeight: 44 }}
          >
            {/* Live tab emphasis */}
            {item.label === 'Live' && (
              <motion.span
                className="absolute top-1 left-1/2 -translate-x-1/2 flex items-center"
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
                layoutId="nav-active-indicator-mobile"
                className="mt-1 w-10 h-1 bg-apex-primary rounded-full"
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              />
            )}
          </Link>
        ))}
      </div>
      {/* Account actions group */}
      <div className="flex flex-col items-end gap-1 pr-2">
        {accountNav.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={clsx(
              'px-3 py-2 rounded-lg text-xs font-normal transition-colors duration-200',
              pathname === item.href
                ? 'text-apex-primary bg-apex-primary/10'
                : 'text-gray-300 hover:text-apex-accent hover:bg-apex-muted'
            )}
            style={{ minHeight: 44 }}
          >
            <span>{item.label}</span>
            {pathname === item.href && (
              <motion.div
                layoutId="nav-active-indicator-mobile"
                className="mt-1 w-8 h-1 bg-apex-primary rounded-full"
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              />
            )}
          </Link>
        ))}
        <button
          onClick={signOut}
          className="mt-2 px-3 py-2 text-xs text-red-400 hover:bg-apex-muted rounded-lg font-medium tracking-wide transition-colors duration-200"
        >
          Sign out
        </button>
      </div>
    </nav>
  );
}
