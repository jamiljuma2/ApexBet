"use client";
import React, { useState } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import AdminTable from '@/components/admin/AdminTable';

interface ReportRow {
  id: string;
  type: 'revenue' | 'payouts' | 'volume';
  value: string;
  date: string;
}

const reports: ReportRow[] = [
  { id: 'RPT1', type: 'revenue', value: 'Ksh 100,000', date: '2026-02-07' },
  { id: 'RPT2', type: 'payouts', value: 'Ksh 80,000', date: '2026-02-07' },
  { id: 'RPT3', type: 'volume', value: 'Ksh 1,000,000', date: '2026-02-07' },
];

const ReportsAnalyticsPage: React.FC = () => {
  const [filter, setFilter] = useState('');
  return (
    <AdminLayout>
      <h1 className="text-xl font-bold mb-4">Reports & Analytics</h1>
      <div className="mb-4 flex flex-col sm:flex-row gap-2 items-center justify-between">
        <input
          className="bg-apex-muted/30 rounded px-3 py-1 text-sm text-white"
          placeholder="Filter by type, date, user..."
          value={filter}
          onChange={e => setFilter(e.target.value)}
        />
        <button className="bg-apex-primary text-white px-4 py-1.5 rounded text-sm font-semibold hover:bg-apex-primary/80">Export</button>
      </div>
      <AdminTable
        columns={[
          { key: 'type', label: 'Type' },
          { key: 'value', label: 'Value', className: 'font-mono' },
          { key: 'date', label: 'Date' },
        ]}
        data={reports.filter(r => !filter || r.type.includes(filter) || r.date.includes(filter))}
      />
    </AdminLayout>
  );
};

export default ReportsAnalyticsPage;
