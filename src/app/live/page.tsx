import { createClient } from '@/lib/supabase/server';
import { EventCard } from '@/components/sports/EventCard';

export default async function LivePage() {
  const supabase = await createClient();
  const { data: events } = await supabase
    .from('events')
    .select(`
      *,
      competition:competitions(name, slug),
      markets(
        id,
        type,
        name,
        line_value,
        selections(id, name, odds, odds_locked)
      )
    `)
    .eq('is_live', true)
    .order('start_time');
  return (
    <div className="min-h-screen bg-apex-dark p-4">
      <div className="container mx-auto">
        <h1 className="text-2xl font-bold text-white mb-4">Live betting</h1>
        <div className="space-y-6">
          {events?.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
          {(!events || events.length === 0) && (
            <p className="text-gray-500">No live events right now.</p>
          )}
        </div>
      </div>
    </div>
  );
}
