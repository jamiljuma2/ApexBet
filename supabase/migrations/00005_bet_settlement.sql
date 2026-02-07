-- Settle slips that have a bet on this event: only when ALL legs have is_winner set
-- Admin sets selections.is_winner for event markets, then calls this with event_id
CREATE OR REPLACE FUNCTION public.settle_event_bets(p_event_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_slip RECORD;
  v_bet RECORD;
  v_all_set BOOLEAN;
  v_any_lost BOOLEAN;
  v_slip_status public.bet_status;
  v_win_amount DECIMAL;
  v_user_id UUID;
BEGIN
  UPDATE public.events SET result_confirmed = TRUE, updated_at = NOW() WHERE id = p_event_id;

  FOR v_slip IN
    SELECT DISTINCT slip_id FROM public.bets
    WHERE event_id = p_event_id AND slip_id IS NOT NULL AND status = 'pending'
  LOOP
    v_all_set := TRUE;
    v_any_lost := FALSE;
    FOR v_bet IN
      SELECT b.user_id, s.is_winner
      FROM public.bets b
      JOIN public.selections s ON s.id = b.selection_id
      WHERE b.slip_id = v_slip.slip_id
    LOOP
      IF v_bet.is_winner IS NULL THEN
        v_all_set := FALSE;
        EXIT;
      END IF;
      IF NOT v_bet.is_winner THEN
        v_any_lost := TRUE;
      END IF;
    END LOOP;
    IF NOT v_all_set THEN
      CONTINUE;
    END IF;
    v_slip_status := CASE WHEN v_any_lost THEN 'lost'::public.bet_status ELSE 'won'::public.bet_status END;
    IF v_slip_status = 'won' THEN
      SELECT potential_win_kes, user_id INTO v_win_amount, v_user_id
      FROM public.bet_slips bs
      JOIN public.bets b ON b.slip_id = bs.id
      WHERE bs.id = v_slip.slip_id LIMIT 1;
      PERFORM public.wallet_credit(v_user_id, v_win_amount, 'bet_win', v_slip.slip_id, '{}'::jsonb);
    END IF;
    UPDATE public.bet_slips SET status = v_slip_status, updated_at = NOW() WHERE id = v_slip.slip_id;
    UPDATE public.bets SET status = v_slip_status, settled_at = NOW(), updated_at = NOW() WHERE slip_id = v_slip.slip_id;
  END LOOP;
END;
$$;

GRANT EXECUTE ON FUNCTION public.settle_event_bets(UUID) TO service_role;
