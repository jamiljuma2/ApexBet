import { createClient } from '@/lib/supabase/server';

export default async function AdminDashboardPage() {
  const supabase = await createClient();
  const [
    { count: usersCount },
    { count: betsCount },
    { count: txnsCount },
  ] = await Promise.all([
    supabase.from('profiles').select('*', { count: 'exact', head: true }),
    supabase.from('bet_slips').select('*', { count: 'exact', head: true }),
    supabase.from('transactions').select('*', { count: 'exact', head: true }),
  ]);

  const { data: revenue } = await supabase
    .from('transactions')
    .select('amount_kes')
    .eq('type', 'bet_placement');
  const totalStakes = revenue?.reduce((s, t) => s + Math.abs(Number(t.amount_kes)), 0) ?? 0;

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-6">Admin dashboard</h1>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="card-apex">
          <p className="text-gray-400 text-sm">Users</p>
          <p className="text-2xl font-bold text-apex-primary">{usersCount ?? 0}</p>
        </div>
        <div className="card-apex">
          <p className="text-gray-400 text-sm">Total bets</p>
          <p className="text-2xl font-bold text-white">{betsCount ?? 0}</p>
        </div>
        <div className="card-apex">
          <p className="text-gray-400 text-sm">Transactions</p>
          <p className="text-2xl font-bold text-white">{txnsCount ?? 0}</p>
        </div>
        <div className="card-apex">
          <p className="text-gray-400 text-sm">Total stakes (KES)</p>
          <p className="text-2xl font-bold text-apex-primary">{totalStakes.toLocaleString()}</p>
        </div>
      </div>
    </div>
  );
}
