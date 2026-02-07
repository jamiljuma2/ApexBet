import { createClient } from '@/lib/supabase/server';
import { format } from 'date-fns';

export default async function AdminJackpotsPage() {
  const supabase = await createClient();
  const { data: jackpots } = await supabase
    .from('jackpots')
    .select('*')
    .order('created_at', { ascending: false });
  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-4">Jackpot management</h1>
      <div className="space-y-4">
        {jackpots?.map((jp) => (
          <div key={jp.id} className="card-apex flex flex-wrap items-center justify-between gap-2">
            <div>
              <h2 className="text-lg font-semibold text-white">{jp.name}</h2>
              <p className="text-apex-primary">Prize: KES {Number(jp.prize_kes).toLocaleString()} · Entry: KES {Number(jp.entry_fee_kes).toLocaleString()}</p>
              <p className="text-gray-500 text-sm">Status: {jp.status} · Draw: {jp.draw_time ? format(new Date(jp.draw_time), 'd MMM yyyy, HH:mm') : '-'}</p>
            </div>
          </div>
        ))}
        {(!jackpots || jackpots.length === 0) && (
          <p className="text-gray-500">No jackpots.</p>
        )}
      </div>
    </div>
  );
}
