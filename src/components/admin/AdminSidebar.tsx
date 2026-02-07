"use client";
import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const menu = [
  { label: 'Dashboard', href: '/admin/dashboard' },
  { label: 'Users', href: '/admin/users' },
  { label: 'Bets', href: '/admin/bets' },
  { label: 'Transactions', href: '/admin/transactions' },
  { label: 'Odds', href: '/admin/odds' },
  { label: 'Results', href: '/admin/results' },
  { label: 'Jackpots', href: '/admin/jackpots' },
  { label: 'Risk', href: '/admin/risk' },
  { label: 'Reports', href: '/admin/reports' },
  { label: 'Audit Logs', href: '/admin/audit' },
];

const AdminSidebar: React.FC = () => {
  const pathname = usePathname();
  return (
    <aside className="hidden md:flex flex-col w-56 bg-apex-muted border-r border-apex-muted/30 min-h-screen sticky top-0">
      <div className="h-16 flex items-center justify-center font-bold text-apex-primary text-xl border-b border-apex-muted/30">
        Admin Panel
      </div>
      <nav className="flex-1 flex flex-col gap-1 p-2">
        {menu.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`rounded px-3 py-2 text-sm font-medium transition-colors duration-150 ${pathname === item.href ? 'bg-apex-primary/20 text-apex-primary' : 'hover:bg-apex-primary/10 text-white'}`}
          >
            {item.label}
          </Link>
        ))}
      </nav>
    </aside>
  );
};

export default AdminSidebar;
