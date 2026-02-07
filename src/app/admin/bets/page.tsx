import { createClient } from '@/lib/supabase/server';
import { format } from 'date-fns';

export default async function AdminBetsPage() {
  const supabase = await createClient();
  const { data: slips } = await supabase
    .from('bet_slips')
    .select('id, user_id, total_stake_kes, total_odds, potential_win_kes, bet_count, status, created_at')
    .order('created_at', { ascending: false })
    .limit(100);
  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-4">Bet inspection</h1>
      <div className="overflow-x-auto card-apex">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-gray-400 border-b border-apex-muted">
              <th className="pb-2 pr-4">Slip ID</th>
              <th className="pb-2 pr-4">User</th>
              <th className="pb-2 pr-4">Stake</th>
              <th className="pb-2 pr-4">Odds</th>
              <th className="pb-2 pr-4">Potential win</th>
              <th className="pb-2 pr-4">Status</th>
              <th className="pb-2 pr-4">Date</th>
            </tr>
          </thead>
          <tbody>
            {slips?.map((s) => (
              <tr key={s.id} className="border-b border-apex-muted/50">
                <td className="py-2 pr-4 text-gray-300 font-mono text-xs">{s.id.slice(0, 8)}</td>
                <td className="py-2 pr-4 text-gray-300 font-mono text-xs">{s.user_id.slice(0, 8)}</td>
                <td className="py-2 pr-4 text-white">KES {Number(s.total_stake_kes).toLocaleString()}</td>
                <td className="py-2 pr-4 text-white">{Number(s.total_odds).toFixed(2)}</td>
                <td className="py-2 pr-4 text-apex-primary">KES {Number(s.potential_win_kes).toLocaleString()}</td>
                <td className="py-2 pr-4 text-gray-400">{s.status}</td>
                <td className="py-2 pr-4 text-gray-500">{format(new Date(s.created_at), 'd MMM yyyy, HH:mm')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
