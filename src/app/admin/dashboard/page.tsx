
import AdminLayout from '@/components/admin/AdminLayout';
import AdminCard from '@/components/admin/AdminCard';

export default async function DashboardPage() {
  let metrics = null;
  let error = null;
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/admin-metrics`, {
      headers: {
        'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    });
    if (!res.ok) throw new Error('Failed to fetch metrics');
    metrics = await res.json();
  } catch (e) {
    error = (e as Error).message;
  }

  const kpis = metrics
    ? [
        { title: 'Total Users', value: metrics.total_users, icon: '👤' },
        { title: 'Active Bets', value: metrics.active_bets, icon: '🎫' },
        { title: 'Daily Revenue', value: `KES ${Number(metrics.daily_revenue).toLocaleString()}`, icon: '💰' },
        { title: 'Pending Withdrawals', value: metrics.pending_withdrawals, icon: '⏳' },
      ]
    : [];

  return (
    <AdminLayout>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {kpis.map((kpi) => (
          <AdminCard key={kpi.title} title={kpi.title} value={kpi.value} icon={kpi.icon} loading={!metrics && !error} error={error ?? undefined} />
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
}
