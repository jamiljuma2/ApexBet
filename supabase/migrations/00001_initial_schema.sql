-- ApexBet: Full PostgreSQL schema
-- Run in Supabase SQL Editor or via supabase db push

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

-- Add slip_id FK after bet_slips exists
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

-- Jackpot events (matches in jackpot)
CREATE TABLE public.jackpot_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  jackpot_id UUID NOT NULL REFERENCES public.jackpots(id) ON DELETE CASCADE,
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  sort_order INT NOT NULL DEFAULT 0,
  UNIQUE(jackpot_id, event_id)
);

-- Jackpot entries
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

-- M-Pesa callbacks (idempotency)
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

-- Trigger: create profile on signup
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

-- Trigger: transaction log (balance snapshot)
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
