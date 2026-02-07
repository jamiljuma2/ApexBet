import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { format } from 'date-fns';

export default async function JackpotsPage() {
  const supabase = await createClient();
  const { data: jackpots } = await supabase
    .from('jackpots')
    .select('*')
    .in('status', ['open', 'closed'])
    .order('created_at', { ascending: false });
  return (
    <div className="min-h-screen bg-apex-dark p-4">
      <div className="container mx-auto">
        <h1 className="text-2xl font-bold text-white mb-4">Jackpots</h1>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {jackpots?.map((jp) => (
            <div key={jp.id} className="card-apex">
              <h2 className="text-lg font-semibold text-apex-primary">{jp.name}</h2>
              <p className="text-2xl font-bold text-white mt-1">
                KES {Number(jp.prize_kes).toLocaleString()}
              </p>
              <p className="text-gray-400 text-sm">Entry: KES {Number(jp.entry_fee_kes).toLocaleString()}</p>
              {jp.draw_time && (
                <p className="text-gray-500 text-sm mt-1">
                  Draw: {format(new Date(jp.draw_time), 'd MMM yyyy, HH:mm')}
                </p>
              )}
              <Link
                href={`/jackpots/${jp.id}`}
                className="mt-3 inline-block btn-primary text-sm py-2 px-4"
              >
                {jp.status === 'open' ? 'Play' : 'View'}
              </Link>
            </div>
          ))}
          {(!jackpots || jackpots.length === 0) && (
            <p className="text-gray-500">No jackpots at the moment.</p>
          )}
        </div>
      </div>
    </div>
  );
}
