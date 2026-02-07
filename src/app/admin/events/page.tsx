import { createClient } from '@/lib/supabase/server';
import { format } from 'date-fns';

export default async function AdminEventsPage() {
  const supabase = await createClient();
  const { data: events } = await supabase
    .from('events')
    .select('id, home_team, away_team, start_time, status, is_live, result_confirmed, competition:competitions(name)')
    .order('start_time', { ascending: false })
    .limit(50);
  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-4">Events</h1>
      <div className="overflow-x-auto card-apex">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-gray-400 border-b border-apex-muted">
              <th className="pb-2 pr-4">Match</th>
              <th className="pb-2 pr-4">Competition</th>
              <th className="pb-2 pr-4">Start</th>
              <th className="pb-2 pr-4">Status</th>
              <th className="pb-2 pr-4">Result confirmed</th>
            </tr>
          </thead>
          <tbody>
            {events?.map((e) => (
              <tr key={e.id} className="border-b border-apex-muted/50">
                <td className="py-2 pr-4 text-white">{e.home_team} v {e.away_team}</td>
                <td className="py-2 pr-4 text-gray-400">{(e.competition as { name?: string })?.name ?? '-'}</td>
                <td className="py-2 pr-4 text-gray-400">{format(new Date(e.start_time), 'd MMM HH:mm')}</td>
                <td className="py-2 pr-4">
                  <span className={e.is_live ? 'text-red-400' : 'text-gray-400'}>{e.status}</span>
                </td>
                <td className="py-2 pr-4 text-gray-400">{e.result_confirmed ? 'Yes' : 'No'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
