import { createClient } from '@/lib/supabase/server';
import { format } from 'date-fns';
import Link from 'next/link';

export default async function BetsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data: slips } = await supabase
    .from('bet_slips')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(50);
  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-4">Betting history</h1>
      <div className="space-y-3">
        {slips?.map((slip) => (
          <div key={slip.id} className="card-apex flex flex-wrap items-center justify-between gap-2">
            <div>
              <p className="text-gray-400 text-sm">
                {format(new Date(slip.created_at), 'd MMM yyyy, HH:mm')}
              </p>
              <p className="text-white font-medium">
                KES {Number(slip.total_stake_kes).toLocaleString()} · {slip.bet_count} selection(s) · Odds {Number(slip.total_odds).toFixed(2)}
              </p>
              <p className="text-apex-primary">
                Potential win: KES {Number(slip.potential_win_kes).toLocaleString()}
              </p>
            </div>
            <span
              className={`px-3 py-1 rounded-full text-sm font-medium ${
                slip.status === 'pending'
                  ? 'bg-amber-500/20 text-amber-400'
                  : slip.status === 'won'
                    ? 'bg-apex-primary/20 text-apex-primary'
                    : slip.status === 'lost'
                      ? 'bg-red-500/20 text-red-400'
                      : 'bg-gray-500/20 text-gray-400'
              }`}
            >
              {slip.status}
            </span>
          </div>
        ))}
        {(!slips || slips.length === 0) && (
          <p className="text-gray-500">No bets yet.</p>
        )}
      </div>
    </div>
  );
}
