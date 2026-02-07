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
    <div className="min-h-screen bg-apex-dark p-2 sm:p-4">
      <h1 className="text-2xl sm:text-3xl font-bold text-white mb-4 text-center sm:text-left">Sports</h1>
      <div className="grid gap-3 sm:gap-4 grid-cols-1 xs:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {sports?.map((sport) => (
          <Link
            key={sport.id}
            href={`/sports/${sport.slug}`}
            className="card-apex block hover:border-apex-primary/50 transition-colors p-4 sm:p-6 text-center sm:text-left"
          >
            <h2 className="text-lg sm:text-xl font-semibold text-white">{sport.name}</h2>
            {sport.is_virtual && (
              <span className="text-xs text-apex-accent">Virtual</span>
            )}
          </Link>
        ))}
      </div>
    </div>
  );
}
