"use client";
import React, { useState } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import AdminTable from '@/components/admin/AdminTable';
import StatusBadge from '@/components/admin/StatusBadge';
import { motion, AnimatePresence } from 'framer-motion';

interface BetRow {
  id: string;
  user: string;
  stake: string;
  odds: string;
  payout: string;
  status: 'pending' | 'won' | 'lost' | 'high-risk';
  details: string;
}

const bets: BetRow[] = [
  { id: 'B1001', user: 'user1@mail.com', stake: 'Ksh 500', odds: '2.5', payout: 'Ksh 1,250', status: 'pending', details: 'Football: Team A vs Team B\nStake: Ksh 500\nOdds: 2.5' },
  { id: 'B1002', user: 'user2@mail.com', stake: 'Ksh 10,000', odds: '10.0', payout: 'Ksh 100,000', status: 'high-risk', details: 'Basketball: Team C vs Team D\nStake: Ksh 10,000\nOdds: 10.0' },
  { id: 'B1003', user: 'user3@mail.com', stake: 'Ksh 200', odds: '1.8', payout: 'Ksh 360', status: 'won', details: 'Tennis: Player X vs Player Y\nStake: Ksh 200\nOdds: 1.8' },
];

const statusMap = {
  pending: <StatusBadge status="pending">Pending</StatusBadge>,
  won: <StatusBadge status="success">Won</StatusBadge>,
  lost: <StatusBadge status="danger">Lost</StatusBadge>,
  'high-risk': <StatusBadge status="danger">High Risk</StatusBadge>,
};

const BetsMonitoringPage: React.FC = () => {
  const [expanded, setExpanded] = useState<string | null>(null);
  return (
    <AdminLayout>
      <h1 className="text-xl font-bold mb-4">Bets Monitoring</h1>
      <AdminTable
        columns={[
          { key: 'id', label: 'Bet ID', className: 'font-mono' },
          { key: 'user', label: 'User' },
          { key: 'stake', label: 'Stake', className: 'font-mono' },
          { key: 'odds', label: 'Odds', className: 'font-mono' },
          { key: 'payout', label: 'Potential Payout', className: 'font-mono' },
          { key: 'status', label: 'Status' },
        ]}
        data={bets}
        renderRow={(row) => (
          <React.Fragment key={row.id}>
            <tr
              className={`bg-apex-muted/30 hover:bg-apex-muted/50 transition-colors cursor-pointer ${row.status === 'high-risk' ? 'border-l-4 border-red-600' : ''}`}
              onClick={() => setExpanded(expanded === row.id ? null : row.id)}
            >
              <td className="px-3 py-2 font-mono">{row.id}</td>
              <td className="px-3 py-2">{row.user}</td>
              <td className="px-3 py-2 font-mono">{row.stake}</td>
              <td className="px-3 py-2 font-mono">{row.odds}</td>
              <td className="px-3 py-2 font-mono">{row.payout}</td>
              <td className="px-3 py-2">{statusMap[row.status]}</td>
            </tr>
            <AnimatePresence>
              {expanded === row.id && (
                <motion.tr
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-apex-muted/40"
                >
                  <td colSpan={6} className="px-6 py-3 text-xs text-gray-300 whitespace-pre-line border-t border-apex-muted/30">
                    {row.details}
                  </td>
                </motion.tr>
              )}
            </AnimatePresence>
          </React.Fragment>
        )}
      />
    </AdminLayout>
  );
};

export default BetsMonitoringPage;
