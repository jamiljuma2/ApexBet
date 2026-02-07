import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import { EventCard } from '@/components/sports/EventCard';

export default async function SportPage({
  params,
}: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const supabase = await createClient();
  const { data: sport } = await supabase
    .from('sports')
    .select('*')
    .eq('slug', slug)
    .single();
  if (!sport) notFound();

  const { data: competitions } = await supabase
    .from('competitions')
    .select('*')
    .eq('sport_id', sport.id);
  const compIds = competitions?.map((c) => c.id) ?? [];
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
    .in('competition_id', compIds)
    .gte('start_time', new Date().toISOString())
    .order('start_time')
    .limit(50);

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-4">{sport.name}</h1>
      <div className="space-y-6">
        {events?.map((event) => (
          <EventCard key={event.id} event={event} />
        ))}
        {(!events || events.length === 0) && (
          <p className="text-gray-500">No upcoming events.</p>
        )}
      </div>
    </div>
  );
}
