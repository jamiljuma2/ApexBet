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
    <div className="min-h-screen bg-apex-dark p-2 sm:p-4">
      <div className="container mx-auto">
        <h1 className="text-2xl sm:text-3xl font-bold text-white mb-4 text-center sm:text-left">Jackpots</h1>
        <div className="grid gap-3 sm:gap-4 grid-cols-1 xs:grid-cols-2 md:grid-cols-3">
          {jackpots?.map((jp) => (
            <div key={jp.id} className="card-apex p-4 sm:p-6 text-center sm:text-left">
              <h2 className="text-lg sm:text-xl font-semibold text-apex-primary">{jp.name}</h2>
              <p className="text-2xl sm:text-3xl font-bold text-white mt-1">
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
            <p className="text-gray-500 text-center">No jackpots at the moment.</p>
          )}
        </div>
      </div>
    </div>
  );
}
