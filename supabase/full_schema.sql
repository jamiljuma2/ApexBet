-- =============================================================================
-- ApexBet – Full SQL schema for Supabase
-- Run this entire file in Supabase Dashboard > SQL Editor (New query)
-- =============================================================================

-- Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ENUMS
CREATE TYPE user_role AS ENUM ('user', 'support_agent', 'finance_admin', 'risk_manager', 'super_admin');
CREATE TYPE transaction_type AS ENUM ('deposit', 'withdrawal', 'bet_placement', 'bet_win', 'bet_refund', 'adjustment', 'jackpot_win');
CREATE TYPE transaction_status AS ENUM ('pending', 'completed', 'failed', 'cancelled');
CREATE TYPE bet_status AS ENUM ('pending', 'won', 'lost', 'void', 'cancelled', 'cash_out');
CREATE TYPE event_status AS ENUM ('scheduled', 'live', 'ended', 'cancelled', 'postponed');
CREATE TYPE market_type AS ENUM ('1x2', 'over_under', 'btts', 'handicap', 'correct_score', 'double_chance');
CREATE TYPE jackpot_type AS ENUM ('daily', 'mega', 'fixed_odds');
CREATE TYPE jackpot_status AS ENUM ('open', 'closed', 'drawing', 'settled');

-- Profiles (extends auth.users)
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  phone TEXT UNIQUE,
  full_name TEXT,
  avatar_url TEXT,
  role user_role NOT NULL DEFAULT 'user',
  kyc_verified BOOLEAN NOT NULL DEFAULT FALSE,
  daily_limit_kes DECIMAL(12,2) DEFAULT 50000,
  self_excluded_until TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Wallets
CREATE TABLE public.wallets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE UNIQUE,
  balance_kes DECIMAL(12,2) NOT NULL DEFAULT 0 CHECK (balance_kes >= 0),
  locked_kes DECIMAL(12,2) NOT NULL DEFAULT 0 CHECK (locked_kes >= 0),
  total_deposited DECIMAL(12,2) NOT NULL DEFAULT 0,
  total_withdrawn DECIMAL(12,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Transactions (ledger)
CREATE TABLE public.transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  type transaction_type NOT NULL,
  amount_kes DECIMAL(12,2) NOT NULL,
  balance_before DECIMAL(12,2),
  balance_after DECIMAL(12,2),
  status transaction_status NOT NULL DEFAULT 'pending',
  reference_id UUID,
  metadata JSONB DEFAULT '{}',
  mpesa_checkout_id TEXT,
  mpesa_receipt TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_transactions_user_id ON public.transactions(user_id);
CREATE INDEX idx_transactions_created_at ON public.transactions(created_at DESC);
CREATE INDEX idx_transactions_type ON public.transactions(type);
CREATE INDEX idx_transactions_reference ON public.transactions(reference_id);

-- Sports
CREATE TABLE public.sports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  icon TEXT,
  is_virtual BOOLEAN NOT NULL DEFAULT FALSE,
  sort_order INT NOT NULL DEFAULT 0,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Competitions/Leagues
CREATE TABLE public.competitions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sport_id UUID NOT NULL REFERENCES public.sports(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  country_code TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(sport_id, slug)
);

-- Events (matches)
CREATE TABLE public.events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  competition_id UUID NOT NULL REFERENCES public.competitions(id) ON DELETE CASCADE,
  external_id TEXT,
  home_team TEXT NOT NULL,
  away_team TEXT NOT NULL,
  start_time TIMESTAMPTZ NOT NULL,
  status event_status NOT NULL DEFAULT 'scheduled',
  home_score INT,
  away_score INT,
  minute INT,
  is_live BOOLEAN NOT NULL DEFAULT FALSE,
  result_confirmed BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_events_start_time ON public.events(start_time);
CREATE INDEX idx_events_status ON public.events(status);
CREATE INDEX idx_events_is_live ON public.events(is_live) WHERE is_live = TRUE;

-- Markets (e.g. 1X2, Over 2.5)
CREATE TABLE public.markets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  type market_type NOT NULL,
  name TEXT NOT NULL,
  line_value DECIMAL(5,2),
  sort_order INT NOT NULL DEFAULT 0,
  settled BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_markets_event_id ON public.markets(event_id);

-- Selections (outcomes within a market)
CREATE TABLE public.selections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  market_id UUID NOT NULL REFERENCES public.markets(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  odds DECIMAL(6,2) NOT NULL,
  odds_locked BOOLEAN NOT NULL DEFAULT FALSE,
  is_winner BOOLEAN,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_selections_market_id ON public.selections(market_id);

-- Bets (single or part of multi)
CREATE TABLE public.bets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  selection_id UUID NOT NULL REFERENCES public.selections(id) ON DELETE RESTRICT,
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE RESTRICT,
  slip_id UUID,
  stake_kes DECIMAL(12,2) NOT NULL CHECK (stake_kes > 0),
  odds DECIMAL(6,2) NOT NULL,
  potential_win_kes DECIMAL(12,2) NOT NULL,
  status bet_status NOT NULL DEFAULT 'pending',
  cash_out_offered_kes DECIMAL(12,2),
  cash_out_taken_kes DECIMAL(12,2),
  settled_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_bets_user_id ON public.bets(user_id);
CREATE INDEX idx_bets_slip_id ON public.bets(slip_id);
CREATE INDEX idx_bets_status ON public.bets(status);
CREATE INDEX idx_bets_created_at ON public.bets(created_at DESC);
CREATE INDEX idx_bets_event_id ON public.bets(event_id);

-- Bet slips (single or multi)
CREATE TABLE public.bet_slips (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  total_stake_kes DECIMAL(12,2) NOT NULL,
  total_odds DECIMAL(8,2) NOT NULL,
  potential_win_kes DECIMAL(12,2) NOT NULL,
  status bet_status NOT NULL DEFAULT 'pending',
  bet_count INT NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_bet_slips_user_id ON public.bet_slips(user_id);
CREATE INDEX idx_bet_slips_status ON public.bet_slips(status);

ALTER TABLE public.bets ADD CONSTRAINT fk_bets_slip
  FOREIGN KEY (slip_id) REFERENCES public.bet_slips(id) ON DELETE SET NULL;

-- Jackpots
CREATE TABLE public.jackpots (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  type jackpot_type NOT NULL,
  name TEXT NOT NULL,
  prize_kes DECIMAL(14,2) NOT NULL,
  entry_fee_kes DECIMAL(8,2) NOT NULL,
  status jackpot_status NOT NULL DEFAULT 'open',
  draw_time TIMESTAMPTZ,
  settled_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE public.jackpot_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  jackpot_id UUID NOT NULL REFERENCES public.jackpots(id) ON DELETE CASCADE,
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  sort_order INT NOT NULL DEFAULT 0,
  UNIQUE(jackpot_id, event_id)
);

CREATE TABLE public.jackpot_entries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  jackpot_id UUID NOT NULL REFERENCES public.jackpots(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  selections JSONB NOT NULL,
  entry_fee_kes DECIMAL(8,2) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(jackpot_id, user_id)
);

CREATE INDEX idx_jackpot_entries_jackpot ON public.jackpot_entries(jackpot_id);

-- Notifications
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  channel TEXT NOT NULL CHECK (channel IN ('in_app', 'email', 'sms')),
  title TEXT NOT NULL,
  body TEXT,
  read_at TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX idx_notifications_read_at ON public.notifications(user_id, read_at);

-- Audit log (immutable)
CREATE TABLE public.audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  actor_id UUID REFERENCES public.profiles(id),
  action TEXT NOT NULL,
  resource_type TEXT NOT NULL,
  resource_id UUID,
  old_values JSONB,
  new_values JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_audit_logs_actor ON public.audit_logs(actor_id);
CREATE INDEX idx_audit_logs_resource ON public.audit_logs(resource_type, resource_id);
CREATE INDEX idx_audit_logs_created ON public.audit_logs(created_at DESC);

-- OTP / verification (phone/email)
CREATE TABLE public.verification_codes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  contact_type TEXT NOT NULL CHECK (contact_type IN ('email', 'phone')),
  contact_value TEXT NOT NULL,
  code TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_verification_codes_contact ON public.verification_codes(contact_value, expires_at);

-- M-Pesa / Lipana callbacks (idempotency)
CREATE TABLE public.mpesa_callbacks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  checkout_request_id TEXT UNIQUE NOT NULL,
  user_id UUID REFERENCES public.profiles(id),
  merchant_request_id TEXT,
  receipt_number TEXT,
  amount DECIMAL(12,2),
  phone TEXT,
  status TEXT,
  raw_response JSONB,
  processed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX idx_mpesa_checkout ON public.mpesa_callbacks(checkout_request_id);

-- Triggers: updated_at
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE PROCEDURE set_updated_at();
CREATE TRIGGER wallets_updated_at BEFORE UPDATE ON public.wallets
  FOR EACH ROW EXECUTE PROCEDURE set_updated_at();
CREATE TRIGGER transactions_updated_at BEFORE UPDATE ON public.transactions
  FOR EACH ROW EXECUTE PROCEDURE set_updated_at();
CREATE TRIGGER events_updated_at BEFORE UPDATE ON public.events
  FOR EACH ROW EXECUTE PROCEDURE set_updated_at();
CREATE TRIGGER selections_updated_at BEFORE UPDATE ON public.selections
  FOR EACH ROW EXECUTE PROCEDURE set_updated_at();
CREATE TRIGGER bets_updated_at BEFORE UPDATE ON public.bets
  FOR EACH ROW EXECUTE PROCEDURE set_updated_at();
CREATE TRIGGER bet_slips_updated_at BEFORE UPDATE ON public.bet_slips
  FOR EACH ROW EXECUTE PROCEDURE set_updated_at();
CREATE TRIGGER jackpots_updated_at BEFORE UPDATE ON public.jackpots
  FOR EACH ROW EXECUTE PROCEDURE set_updated_at();

-- Trigger: create profile + wallet on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email)
  VALUES (NEW.id, NEW.email)
  ON CONFLICT (id) DO NOTHING;
  INSERT INTO public.wallets (user_id) VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE handle_new_user();

-- Trigger: transaction balance snapshot
CREATE OR REPLACE FUNCTION log_transaction_balance()
RETURNS TRIGGER AS $$
DECLARE
  w public.wallets;
BEGIN
  IF NEW.status = 'completed' AND (OLD.status IS NULL OR OLD.status != 'completed') THEN
    SELECT * INTO w FROM public.wallets WHERE user_id = NEW.user_id FOR UPDATE;
    NEW.balance_after := w.balance_kes;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER transactions_balance_snapshot
  BEFORE UPDATE ON public.transactions
  FOR EACH ROW EXECUTE PROCEDURE log_transaction_balance();

-- =============================================================================
-- RLS
-- =============================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bet_slips ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.jackpot_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.verification_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mpesa_callbacks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.competitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.markets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.selections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.jackpots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.jackpot_events ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.is_admin(uid UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = uid AND role IN ('super_admin', 'risk_manager', 'finance_admin', 'support_agent')
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION public.is_super_admin(uid UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (SELECT 1 FROM public.profiles WHERE id = uid AND role = 'super_admin');
$$ LANGUAGE sql SECURITY DEFINER STABLE;

CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Admins can view all profiles" ON public.profiles FOR SELECT USING (public.is_admin(auth.uid()));
CREATE POLICY "Admins can update profiles" ON public.profiles FOR UPDATE USING (public.is_admin(auth.uid()));

CREATE POLICY "Users can view own wallet" ON public.wallets FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all wallets" ON public.wallets FOR SELECT USING (public.is_admin(auth.uid()));
CREATE POLICY "Admins can update wallets" ON public.wallets FOR UPDATE USING (public.is_admin(auth.uid()));

CREATE POLICY "Users can view own transactions" ON public.transactions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all transactions" ON public.transactions FOR SELECT USING (public.is_admin(auth.uid()));

CREATE POLICY "Users can view own bets" ON public.bets FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all bets" ON public.bets FOR SELECT USING (public.is_admin(auth.uid()));

CREATE POLICY "Users can view own bet slips" ON public.bet_slips FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own bet slips" ON public.bet_slips FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins can view all bet slips" ON public.bet_slips FOR SELECT USING (public.is_admin(auth.uid()));

CREATE POLICY "Users can view own notifications" ON public.notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own notifications (read)" ON public.notifications FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own jackpot entries" ON public.jackpot_entries FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own jackpot entries" ON public.jackpot_entries FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view audit logs" ON public.audit_logs FOR SELECT USING (public.is_admin(auth.uid()));

CREATE POLICY "Anyone can view sports" ON public.sports FOR SELECT USING (true);
CREATE POLICY "Anyone can view competitions" ON public.competitions FOR SELECT USING (true);
CREATE POLICY "Anyone can view events" ON public.events FOR SELECT USING (true);
CREATE POLICY "Anyone can view markets" ON public.markets FOR SELECT USING (true);
CREATE POLICY "Anyone can view selections" ON public.selections FOR SELECT USING (true);
CREATE POLICY "Admins can manage sports" ON public.sports FOR ALL USING (public.is_admin(auth.uid()));
CREATE POLICY "Admins can manage competitions" ON public.competitions FOR ALL USING (public.is_admin(auth.uid()));
CREATE POLICY "Admins can manage events" ON public.events FOR ALL USING (public.is_admin(auth.uid()));
CREATE POLICY "Admins can manage markets" ON public.markets FOR ALL USING (public.is_admin(auth.uid()));
CREATE POLICY "Admins can manage selections" ON public.selections FOR ALL USING (public.is_admin(auth.uid()));

CREATE POLICY "Anyone can view jackpots" ON public.jackpots FOR SELECT USING (true);
CREATE POLICY "Anyone can view jackpot_events" ON public.jackpot_events FOR SELECT USING (true);
CREATE POLICY "Admins can manage jackpots" ON public.jackpots FOR ALL USING (public.is_admin(auth.uid()));
CREATE POLICY "Admins can manage jackpot_events" ON public.jackpot_events FOR ALL USING (public.is_admin(auth.uid()));

-- =============================================================================
-- Wallet & bet functions
-- =============================================================================

CREATE OR REPLACE FUNCTION public.wallet_debit(
  p_user_id UUID,
  p_amount_kes DECIMAL,
  p_type public.transaction_type,
  p_reference_id UUID DEFAULT NULL,
  p_metadata JSONB DEFAULT '{}'
)
RETURNS UUID
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  v_wallet public.wallets;
  v_tx_id UUID;
  v_balance_before DECIMAL;
BEGIN
  SELECT * INTO v_wallet FROM public.wallets WHERE user_id = p_user_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Wallet not found'; END IF;
  v_balance_before := v_wallet.balance_kes;
  IF v_wallet.balance_kes < p_amount_kes THEN RAISE EXCEPTION 'Insufficient balance'; END IF;
  UPDATE public.wallets SET balance_kes = balance_kes - p_amount_kes, updated_at = NOW() WHERE user_id = p_user_id;
  INSERT INTO public.transactions (user_id, type, amount_kes, balance_before, balance_after, status, reference_id, metadata)
  VALUES (p_user_id, p_type, -p_amount_kes, v_balance_before, v_balance_before - p_amount_kes, 'completed', p_reference_id, p_metadata)
  RETURNING id INTO v_tx_id;
  RETURN v_tx_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.wallet_credit(
  p_user_id UUID,
  p_amount_kes DECIMAL,
  p_type public.transaction_type,
  p_reference_id UUID DEFAULT NULL,
  p_metadata JSONB DEFAULT '{}'
)
RETURNS UUID
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  v_balance_before DECIMAL;
  v_tx_id UUID;
BEGIN
  SELECT balance_kes INTO v_balance_before FROM public.wallets WHERE user_id = p_user_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Wallet not found'; END IF;
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

CREATE OR REPLACE FUNCTION public.place_bet(
  p_user_id UUID,
  p_slip_id UUID,
  p_selection_id UUID,
  p_event_id UUID,
  p_stake_kes DECIMAL,
  p_odds DECIMAL
)
RETURNS UUID
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
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

GRANT EXECUTE ON FUNCTION public.wallet_debit(UUID, DECIMAL, public.transaction_type, UUID, JSONB) TO authenticated;
GRANT EXECUTE ON FUNCTION public.wallet_credit(UUID, DECIMAL, public.transaction_type, UUID, JSONB) TO service_role;
GRANT EXECUTE ON FUNCTION public.wallet_debit(UUID, DECIMAL, public.transaction_type, UUID, JSONB) TO service_role;
GRANT EXECUTE ON FUNCTION public.place_bet(UUID, UUID, UUID, UUID, DECIMAL, DECIMAL) TO authenticated;

CREATE OR REPLACE FUNCTION public.place_bet_slip(
  p_user_id UUID,
  p_total_stake_kes DECIMAL,
  p_selections_json JSONB
)
RETURNS UUID
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
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
  IF v_count < 1 OR v_count > 20 THEN RAISE EXCEPTION 'Between 1 and 20 selections allowed'; END IF;
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
      p_user_id, v_slip_id,
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

-- =============================================================================
-- Bet settlement
-- =============================================================================

CREATE OR REPLACE FUNCTION public.settle_event_bets(p_event_id UUID)
RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
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
      IF v_bet.is_winner IS NULL THEN v_all_set := FALSE; EXIT; END IF;
      IF NOT v_bet.is_winner THEN v_any_lost := TRUE; END IF;
    END LOOP;
    IF NOT v_all_set THEN CONTINUE; END IF;
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

-- =============================================================================
-- Lipana pending deposit (for webhook to credit user)
-- =============================================================================

CREATE OR REPLACE FUNCTION public.insert_pending_lipana_deposit(
  p_checkout_request_id TEXT,
  p_transaction_id TEXT DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.mpesa_callbacks (
    checkout_request_id, user_id, merchant_request_id, status, raw_response, created_at
  ) VALUES (
    p_checkout_request_id, auth.uid(), p_transaction_id, 'pending',
    jsonb_build_object('provider', 'lipana'), NOW()
  )
  ON CONFLICT (checkout_request_id) DO NOTHING;
END;
$$;

GRANT EXECUTE ON FUNCTION public.insert_pending_lipana_deposit(TEXT, TEXT) TO authenticated;

-- =============================================================================
-- Seed data (sports, competitions, events, markets, selections)
-- =============================================================================

INSERT INTO public.sports (id, name, slug, is_virtual, sort_order) VALUES
  ('11111111-1111-1111-1111-111111111101', 'Football', 'football', FALSE, 1),
  ('11111111-1111-1111-1111-111111111102', 'Basketball', 'basketball', FALSE, 2),
  ('11111111-1111-1111-1111-111111111103', 'Tennis', 'tennis', FALSE, 3),
  ('11111111-1111-1111-1111-111111111104', 'Virtual Sports', 'virtual', TRUE, 4)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.competitions (id, sport_id, name, slug, country_code) VALUES
  ('22222222-2222-2222-2222-222222222201', '11111111-1111-1111-1111-111111111101', 'English Premier League', 'epl', 'GB'),
  ('22222222-2222-2222-2222-222222222202', '11111111-1111-1111-1111-111111111101', 'La Liga', 'laliga', 'ES'),
  ('22222222-2222-2222-2222-222222222203', '11111111-1111-1111-1111-111111111102', 'NBA', 'nba', 'US'),
  ('22222222-2222-2222-2222-222222222204', '11111111-1111-1111-1111-111111111103', 'Wimbledon', 'wimbledon', 'GB')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.events (id, competition_id, home_team, away_team, start_time, status, is_live) VALUES
  ('33333333-3333-3333-3333-333333333301', '22222222-2222-2222-2222-222222222201', 'Arsenal', 'Chelsea', NOW() + INTERVAL '2 hours', 'scheduled', FALSE),
  ('33333333-3333-3333-3333-333333333302', '22222222-2222-2222-2222-222222222201', 'Liverpool', 'Man United', NOW() + INTERVAL '1 day', 'scheduled', FALSE),
  ('33333333-3333-3333-3333-333333333303', '22222222-2222-2222-2222-222222222203', 'Lakers', 'Celtics', NOW() + INTERVAL '3 hours', 'scheduled', FALSE)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.markets (id, event_id, type, name, line_value, sort_order) VALUES
  ('44444444-4444-4444-4444-444444444401', '33333333-3333-3333-3333-333333333301', '1x2', 'Match Result', NULL, 0),
  ('44444444-4444-4444-4444-444444444402', '33333333-3333-3333-3333-333333333301', 'over_under', 'Total Goals', 2.5, 1),
  ('44444444-4444-4444-4444-444444444403', '33333333-3333-3333-3333-333333333302', '1x2', 'Match Result', NULL, 0)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.selections (id, market_id, name, odds, sort_order) VALUES
  ('55555555-5555-5555-5555-555555555501', '44444444-4444-4444-4444-444444444401', 'Home', 2.10, 0),
  ('55555555-5555-5555-5555-555555555502', '44444444-4444-4444-4444-444444444401', 'Draw', 3.40, 1),
  ('55555555-5555-5555-5555-555555555503', '44444444-4444-4444-4444-444444444401', 'Away', 3.20, 2),
  ('55555555-5555-5555-5555-555555555504', '44444444-4444-4444-4444-444444444402', 'Over 2.5', 1.85, 0),
  ('55555555-5555-5555-5555-555555555505', '44444444-4444-4444-4444-444444444402', 'Under 2.5', 1.95, 1),
  ('55555555-5555-5555-5555-555555555506', '44444444-4444-4444-4444-444444444403', 'Home', 1.95, 0),
  ('55555555-5555-5555-5555-555555555507', '44444444-4444-4444-4444-444444444403', 'Draw', 3.50, 1),
  ('55555555-5555-5555-5555-555555555508', '44444444-4444-4444-4444-444444444403', 'Away', 3.80, 2)
ON CONFLICT (id) DO NOTHING;

-- =============================================================================
-- Done. After first user signup, promote to admin (run in SQL Editor):
--   UPDATE public.profiles SET role = 'super_admin' WHERE email = 'your@email.com';
-- =============================================================================
