import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';

export default async function SportsPage() {
  const supabase = await createClient();
  const { data: sports } = await supabase
    .from('sports')
    .select('*')
    .eq('active', true)
    .order('sort_order');
  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-4">Sports</h1>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {sports?.map((sport) => (
          <Link
            key={sport.id}
            href={`/sports/${sport.slug}`}
            className="card-apex block hover:border-apex-primary/50 transition-colors"
          >
            <h2 className="text-lg font-semibold text-white">{sport.name}</h2>
            {sport.is_virtual && (
              <span className="text-xs text-apex-accent">Virtual</span>
            )}
          </Link>
        ))}
      </div>
    </div>
  );
}
