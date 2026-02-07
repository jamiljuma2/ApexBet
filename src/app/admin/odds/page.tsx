"use client";
import React, { useState } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import AdminTable from '@/components/admin/AdminTable';
import StatusBadge from '@/components/admin/StatusBadge';

interface MatchRow {
  id: string;
  sport: string;
  teams: string;
  marketStatus: 'active' | 'suspended';
  odds: number;
}

const matches: MatchRow[] = [
  { id: 'M1001', sport: 'Football', teams: 'Team A vs Team B', marketStatus: 'active', odds: 2.5 },
  { id: 'M1002', sport: 'Basketball', teams: 'Team C vs Team D', marketStatus: 'suspended', odds: 1.8 },
  { id: 'M1003', sport: 'Tennis', teams: 'Player X vs Player Y', marketStatus: 'active', odds: 3.2 },
];

const statusMap = {
  active: <StatusBadge status="success">Active</StatusBadge>,
  suspended: <StatusBadge status="danger">Suspended</StatusBadge>,
};

const OddsManagementPage: React.FC = () => {
  const [editId, setEditId] = useState<string | null>(null);
  const [oddsState, setOddsState] = useState(matches.map((m) => m.odds));
  return (
    <AdminLayout>
      <h1 className="text-xl font-bold mb-4">Odds & Events Management</h1>
      <AdminTable
        columns={[
          { key: 'sport', label: 'Sport' },
          { key: 'teams', label: 'Match' },
          { key: 'marketStatus', label: 'Market Status' },
          { key: 'odds', label: 'Odds', className: 'font-mono' },
          { key: 'actions', label: 'Actions' },
        ]}
        data={matches.map((m, i) => ({ ...m, odds: oddsState[i], actions: '' }))}
        renderRow={(row, idx) => (
          <tr key={row.id} className="bg-apex-muted/30 hover:bg-apex-muted/50 transition-colors">
            <td className="px-3 py-2">{row.sport}</td>
            <td className="px-3 py-2">{row.teams}</td>
            <td className="px-3 py-2">{statusMap[row.marketStatus]}</td>
            <td className="px-3 py-2 font-mono">
              {editId === row.id ? (
                <input
                  type="number"
                  className="bg-apex-card border border-apex-muted rounded px-2 py-1 w-20 text-white font-mono"
                  value={oddsState[idx]}
                  onChange={(e) => {
                    const newOdds = [...oddsState];
                    newOdds[idx] = parseFloat(e.target.value);
                    setOddsState(newOdds);
                  }}
                />
              ) : (
                row.odds
              )}
            </td>
            <td className="px-3 py-2 flex gap-2">
              <button
                className="text-apex-primary hover:underline text-xs"
                onClick={() => setEditId(editId === row.id ? null : row.id)}
              >
                {editId === row.id ? 'Save' : 'Edit'}
              </button>
              <button
                className={`text-xs ${row.marketStatus === 'active' ? 'text-red-500' : 'text-green-500'} hover:underline`}
              >
                {row.marketStatus === 'active' ? 'Suspend' : 'Activate'}
              </button>
            </td>
          </tr>
        )}
      />
    </AdminLayout>
  );
};

export default OddsManagementPage;
