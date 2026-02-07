'use client';

import { useBetSlipStore } from '@/store/betSlipStore';
import { format } from 'date-fns';
import type { Event } from '@/types/database';

type EventWithRelations = Event & {
  competition?: { name: string; slug: string } | null;
  markets?: Array<{
    id: string;
    type: string;
    name: string;
    line_value: number | null;
    selections: Array<{ id: string; name: string; odds: number; odds_locked: boolean }>;
  }> | null;
};

export function EventCard({ event }: { event: EventWithRelations }) {
  const { addSelection, hasSelection } = useBetSlipStore();
  const eventName = `${event.home_team} v ${event.away_team}`;

  return (
    <div className="card-apex">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
        <div>
          <p className="text-gray-500 text-sm">{event.competition?.name}</p>
          <h2 className="text-lg font-semibold text-white">{eventName}</h2>
          <p className="text-gray-400 text-sm">
            {format(new Date(event.start_time), 'EEE, d MMM · HH:mm')}
          </p>
        </div>
        {event.is_live && (
          <span className="px-2 py-1 bg-red-500/20 text-red-400 rounded text-sm font-medium">
            Live
          </span>
        )}
      </div>
      <div className="flex flex-wrap gap-4">
        {event.markets?.map((market) => (
          <div key={market.id} className="flex flex-wrap items-center gap-2">
            <span className="text-gray-500 text-sm">{market.name}:</span>
            {market.selections?.map((sel) => (
              <button
                key={sel.id}
                type="button"
                onClick={() =>
                  addSelection({
                    selectionId: sel.id,
                    eventId: event.id,
                    eventName,
                    marketName: market.name,
                    selectionName: sel.name,
                    odds: sel.odds,
                  })
                }
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  hasSelection(sel.id)
                    ? 'bg-apex-primary text-apex-dark'
                    : 'bg-apex-muted text-white hover:bg-apex-muted/80'
                }`}
              >
                {sel.name} @ {sel.odds}
              </button>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
