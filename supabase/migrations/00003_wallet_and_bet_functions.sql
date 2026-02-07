-- Wallet: debit (bet placement, withdrawal request)
-- Called from Edge Function or with service role after validation
CREATE OR REPLACE FUNCTION public.wallet_debit(
  p_user_id UUID,
  p_amount_kes DECIMAL,
  p_type public.transaction_type,
  p_reference_id UUID DEFAULT NULL,
  p_metadata JSONB DEFAULT '{}'
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_wallet public.wallets;
  v_tx_id UUID;
  v_balance_before DECIMAL;
BEGIN
  SELECT * INTO v_wallet FROM public.wallets WHERE user_id = p_user_id FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Wallet not found';
  END IF;
  v_balance_before := v_wallet.balance_kes;
  IF v_wallet.balance_kes < p_amount_kes THEN
    RAISE EXCEPTION 'Insufficient balance';
  END IF;
  UPDATE public.wallets
  SET balance_kes = balance_kes - p_amount_kes,
      updated_at = NOW()
  WHERE user_id = p_user_id;
  INSERT INTO public.transactions (user_id, type, amount_kes, balance_before, balance_after, status, reference_id, metadata)
  VALUES (p_user_id, p_type, -p_amount_kes, v_balance_before, v_balance_before - p_amount_kes, 'completed', p_reference_id, p_metadata)
  RETURNING id INTO v_tx_id;
  RETURN v_tx_id;
END;
$$;

-- Wallet: credit (deposit, bet win, refund)
CREATE OR REPLACE FUNCTION public.wallet_credit(
  p_user_id UUID,
  p_amount_kes DECIMAL,
  p_type public.transaction_type,
  p_reference_id UUID DEFAULT NULL,
  p_metadata JSONB DEFAULT '{}'
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_balance_before DECIMAL;
  v_tx_id UUID;
BEGIN
  SELECT balance_kes INTO v_balance_before FROM public.wallets WHERE user_id = p_user_id FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Wallet not found';
  END IF;
  UPDATE public.wallets
  SET balance_kes = balance_kes + p_amount_kes,
      total_deposited = total_deposited + CASE WHEN p_type = 'deposit' THEN p_amount_kes ELSE 0 END,
      total_withdrawn = total_withdrawn + CASE WHEN p_type = 'withdrawal' THEN p_amount_kes ELSE 0 END,
      updated_at = NOW()
  WHERE user_id = p_user_id;
  INSERT INTO public.transactions (user_id, type, amount_kes, balance_before, balance_after, status, reference_id, metadata)
  VALUES (p_user_id, p_type, p_amount_kes, v_balance_before, v_balance_before + p_amount_kes, 'completed', p_reference_id, p_metadata)
  RETURNING id INTO v_tx_id;
  RETURN v_tx_id;
END;
$$;

-- Place bet: debit wallet and create bet + slip
CREATE OR REPLACE FUNCTION public.place_bet(
  p_user_id UUID,
  p_slip_id UUID,
  p_selection_id UUID,
  p_event_id UUID,
  p_stake_kes DECIMAL,
  p_odds DECIMAL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_bet_id UUID;
  v_tx_id UUID;
  v_min_stake DECIMAL := 10;
  v_max_stake DECIMAL := 50000;
BEGIN
  IF p_stake_kes < v_min_stake OR p_stake_kes > v_max_stake THEN
    RAISE EXCEPTION 'Stake must be between % and %', v_min_stake, v_max_stake;
  END IF;
  v_tx_id := public.wallet_debit(p_user_id, p_stake_kes, 'bet_placement', p_slip_id, '{}'::jsonb);
  INSERT INTO public.bets (user_id, slip_id, selection_id, event_id, stake_kes, odds, potential_win_kes, status)
  VALUES (p_user_id, p_slip_id, p_selection_id, p_event_id, p_stake_kes, p_odds, p_stake_kes * p_odds, 'pending')
  RETURNING id INTO v_bet_id;
  RETURN v_bet_id;
END;
$$;

-- Grant execute to authenticated and service role
GRANT EXECUTE ON FUNCTION public.wallet_debit(UUID, DECIMAL, public.transaction_type, UUID, JSONB) TO authenticated;
GRANT EXECUTE ON FUNCTION public.wallet_credit(UUID, DECIMAL, public.transaction_type, UUID, JSONB) TO service_role;
GRANT EXECUTE ON FUNCTION public.wallet_debit(UUID, DECIMAL, public.transaction_type, UUID, JSONB) TO service_role;
GRANT EXECUTE ON FUNCTION public.place_bet(UUID, UUID, UUID, UUID, DECIMAL, DECIMAL) TO authenticated;

-- Place full slip: one debit, one slip, N bets (accumulator)
-- selections_json: [{"selection_id": "uuid", "event_id": "uuid", "odds": 1.5}, ...]
CREATE OR REPLACE FUNCTION public.place_bet_slip(
  p_user_id UUID,
  p_total_stake_kes DECIMAL,
  p_selections_json JSONB
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_slip_id UUID;
  v_tx_id UUID;
  v_total_odds DECIMAL := 1;
  v_selection JSONB;
  v_min_stake DECIMAL := 10;
  v_max_stake DECIMAL := 50000;
  v_count INT;
BEGIN
  v_count := jsonb_array_length(p_selections_json);
  IF v_count < 1 OR v_count > 20 THEN
    RAISE EXCEPTION 'Between 1 and 20 selections allowed';
  END IF;
  IF p_total_stake_kes < v_min_stake OR p_total_stake_kes > v_max_stake THEN
    RAISE EXCEPTION 'Stake must be between % and %', v_min_stake, v_max_stake;
  END IF;
  FOR v_selection IN SELECT * FROM jsonb_array_elements(p_selections_json)
  LOOP
    v_total_odds := v_total_odds * (v_selection->>'odds')::DECIMAL;
  END LOOP;
  v_tx_id := public.wallet_debit(p_user_id, p_total_stake_kes, 'bet_placement', NULL, '{}'::jsonb);
  INSERT INTO public.bet_slips (user_id, total_stake_kes, total_odds, potential_win_kes, bet_count, status)
  VALUES (p_user_id, p_total_stake_kes, v_total_odds, p_total_stake_kes * v_total_odds, v_count, 'pending')
  RETURNING id INTO v_slip_id;
  FOR v_selection IN SELECT * FROM jsonb_array_elements(p_selections_json)
  LOOP
    INSERT INTO public.bets (user_id, slip_id, selection_id, event_id, stake_kes, odds, potential_win_kes, status)
    VALUES (
      p_user_id,
      v_slip_id,
      (v_selection->>'selection_id')::UUID,
      (v_selection->>'event_id')::UUID,
      p_total_stake_kes,
      (v_selection->>'odds')::DECIMAL,
      p_total_stake_kes * v_total_odds,
      'pending'
    );
  END LOOP;
  RETURN v_slip_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.place_bet_slip(UUID, DECIMAL, JSONB) TO authenticated;
