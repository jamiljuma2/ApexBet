import React from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import AdminCard from '@/components/admin/AdminCard';

const kpis = [
  { title: 'Total Users', value: '12,340', icon: '👤' },
  { title: 'Active Bets', value: '1,234', icon: '🎫' },
  { title: 'Daily Revenue', value: '$12,345', icon: '💰' },
  { title: 'Pending Withdrawals', value: '$2,100', icon: '⏳' },
];

const DashboardPage: React.FC = () => {
  return (
    <AdminLayout>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {kpis.map((kpi) => (
          <AdminCard key={kpi.title} title={kpi.title} value={kpi.value} icon={kpi.icon} />
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="col-span-2 bg-apex-muted/30 rounded-lg p-4 min-h-[240px] flex items-center justify-center text-gray-400">
          [Charts Placeholder]
        </div>
        <div className="bg-apex-muted/30 rounded-lg p-4 min-h-[240px] flex flex-col gap-2">
          <div className="font-bold text-apex-primary mb-2">System Alerts</div>
          <ul className="text-xs text-amber-400 space-y-1">
            <li>⚠️ 2 pending withdrawal approvals</li>
            <li>⚠️ 1 suspicious bet flagged</li>
            <li>⚠️ Scheduled maintenance at 2:00 AM</li>
          </ul>
        </div>
      </div>
    </AdminLayout>
  );
};

export default DashboardPage;
