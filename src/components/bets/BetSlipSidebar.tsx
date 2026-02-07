'use client';

import { useBetSlipStore } from '@/store/betSlipStore';
import { motion, AnimatePresence } from 'framer-motion';
import { createClient } from '@/lib/supabase/client';
import { useState } from 'react';

export function BetSlipSidebar() {
  const { selections, removeSelection, clearSlip } = useBetSlipStore();
  const [stake, setStake] = useState('');
  const [placing, setPlacing] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const supabase = createClient();

  const totalOdds = selections.length
    ? selections.reduce((acc, s) => acc * s.odds, 1)
    : 0;
  const stakeNum = parseFloat(stake) || 0;
  const potentialWin = totalOdds * stakeNum;

  async function placeBet() {
    if (selections.length === 0 || stakeNum < 10) {
      setMessage('Add selections and stake (min KES 10)');
      return;
    }
    setPlacing(true);
    setMessage(null);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setMessage('Please log in.');
        return;
      }
      const selectionsJson = selections.map((s) => ({
        selection_id: s.selectionId,
        event_id: s.eventId,
        odds: s.odds,
      }));
      const { data: slipId, error } = await supabase.rpc('place_bet_slip', {
        p_user_id: user.id,
        p_total_stake_kes: stakeNum,
        p_selections_json: selectionsJson,
      });
      if (error) {
        setMessage(error.message);
        return;
      }
      clearSlip();
      setStake('');
      setMessage('Bet placed successfully.');
    } finally {
      setPlacing(false);
    }
  }

  return (
    <aside className="w-80 border-l border-apex-muted bg-apex-card flex flex-col max-h-screen overflow-hidden hidden lg:flex">
      <div className="p-3 border-b border-apex-muted">
        <h2 className="font-semibold text-white">Bet slip</h2>
      </div>
      <div className="flex-1 overflow-y-auto p-3">
        <AnimatePresence mode="popLayout">
          {selections.length === 0 ? (
            <motion.p
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-gray-500 text-sm"
            >
              Add selections from events to your slip.
            </motion.p>
          ) : (
            selections.map((s) => (
              <motion.div
                key={s.selectionId}
                layout
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="mb-2 p-2 bg-apex-muted/50 rounded-lg text-sm"
              >
                <p className="text-gray-300 truncate">{s.eventName}</p>
                <p className="text-apex-primary font-medium">
                  {s.selectionName} @ {s.odds}
                </p>
                <button
                  type="button"
                  onClick={() => removeSelection(s.selectionId)}
                  className="text-red-400 text-xs hover:underline mt-1"
                >
                  Remove
                </button>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>
      {selections.length > 0 && (
        <div className="p-3 border-t border-apex-muted space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Total odds</span>
            <span className="text-white font-medium">{totalOdds.toFixed(2)}</span>
          </div>
          <input
            type="number"
            min={10}
            step={10}
            placeholder="Stake (KES)"
            value={stake}
            onChange={(e) => setStake(e.target.value)}
            className="w-full bg-apex-muted border border-apex-primary/30 rounded-lg px-3 py-2 text-white"
          />
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Potential win</span>
            <span className="text-apex-primary font-medium">
              KES {potentialWin.toLocaleString()}
            </span>
          </div>
          {message && (
            <p className="text-sm text-amber-400">{message}</p>
          )}
          <button
            type="button"
            onClick={placeBet}
            disabled={placing || stakeNum < 10}
            className="w-full btn-primary py-2 rounded-lg disabled:opacity-50"
          >
            {placing ? 'Placing...' : 'Place bet'}
          </button>
        </div>
      )}
    </aside>
  );
}
