"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import type { User } from '@supabase/supabase-js';
import { clsx } from 'clsx';
// Framer Motion for micro-interactions
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

export function DesktopNav({ user }: { user: User }) {
  const pathname = usePathname();
  const router = useRouter();
  const [balance, setBalance] = useState<number | null>(null);
  useEffect(() => {
    fetch('/api/wallet-balance')
      .then(res => res.json())
      .then(data => setBalance(data.balance_kes));
  }, []);

  // Split nav for hierarchy
  const bettingNav = nav.slice(0, 4); // Home, Sports, Live, Jackpots
  const accountNav = nav.slice(4); // My Bets, Transactions, Profile

  async function signOut() {
    await router.push('/');
    router.refresh();
  }

  return (
    <nav className="sticky top-0 z-40 w-full bg-apex-dark border-b border-apex-muted flex items-center justify-between px-8 py-2">
      <ul className="flex gap-2">
        {bettingNav.map(item => (
          <li key={item.href} className="relative">
            <Link
              href={item.href}
              className={clsx(
                'flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-base transition-colors duration-200',
                pathname === item.href
                  ? 'text-apex-primary bg-apex-primary/10'
                  : 'text-gray-100 hover:text-apex-accent hover:bg-apex-muted',
                item.label === 'Live' && 'font-semibold'
              )}
              style={{ minHeight: 44 }}
            >
              {/* Live tab emphasis */}
              {item.label === 'Live' && (
                <motion.span
                  className="ml-2 flex items-center"
                  animate={{ opacity: [0.7, 1, 0.7], scale: [1, 1.15, 1] }}
                  transition={{ repeat: Infinity, duration: 1.2 }}
                >
                  <span className="w-2 h-2 bg-apex-accent rounded-full shadow-lg" />
                  <span className="ml-1 text-xs font-bold text-apex-accent">LIVE</span>
                </motion.span>
              )}
              <span>{item.label}</span>
              {pathname === item.href && (
                <motion.div
                  layoutId="nav-active-indicator-desktop"
                  className="absolute left-0 bottom-0 w-full h-1 bg-apex-primary rounded-full"
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
            </Link>
          </li>
        ))}
      </ul>
      {/* Wallet balance and actions */}
      <div className="mx-6 flex items-center gap-3 bg-apex-muted/60 rounded px-3 py-1">
        <span className="text-xs text-gray-200 font-mono">Wallet:</span>
        <span className="text-base font-bold text-apex-primary font-mono">
          {balance !== null ? `KES ${Number(balance).toLocaleString()}` : '...'}
        </span>
        <Link href="/dashboard/deposit" className="btn-primary text-xs px-3 py-1 ml-2">Deposit</Link>
        <Link href="/dashboard/withdraw" className="bg-apex-primary/10 text-apex-primary border border-apex-primary text-xs px-3 py-1 rounded-lg ml-1 hover:bg-apex-primary/20 transition-colors">Withdraw</Link>
      </div>
      <ul className="flex gap-2">
        {accountNav.map(item => (
          <li key={item.href} className="relative">
            <Link
              href={item.href}
              className={clsx(
                'flex items-center gap-2 px-3 py-2 rounded-lg font-normal text-base transition-colors duration-200',
                pathname === item.href
                  ? 'text-apex-primary bg-apex-primary/10'
                  : 'text-gray-300 hover:text-apex-accent hover:bg-apex-muted'
              )}
              style={{ minHeight: 44 }}
            >
              <span>{item.label}</span>
              {pathname === item.href && (
                <motion.div
                  layoutId="nav-active-indicator-desktop"
                  className="absolute left-0 bottom-0 w-full h-1 bg-apex-primary rounded-full"
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
            </Link>
          </li>
        ))}
        <li>
          <button
            onClick={signOut}
            className="px-3 py-2 text-sm text-red-400 hover:bg-apex-muted rounded-lg font-medium tracking-wide transition-colors duration-200"
          >
            Sign out
          </button>
        </li>
      </ul>
      <div className="ml-6 text-xs text-gray-500 truncate font-mono">
        {user.email}
      </div>
    </nav>
  );
}
