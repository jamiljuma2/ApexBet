-- Admin Dashboard Schema for Sports Betting Platform
-- Ensure events table is dropped and recreated locally
DROP TABLE IF EXISTS events CASCADE;
-- All tables, indexes, and RLS policies for admin modules

-- 1. Users & Wallets
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  phone text UNIQUE,
  full_name text,
  role text NOT NULL CHECK (role IN ('super_admin', 'admin', 'risk_analyst', 'support', 'user')),
  status text NOT NULL DEFAULT 'active',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS wallets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  balance numeric(18,2) NOT NULL DEFAULT 0,
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS user_limits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  max_bet numeric(18,2),
  max_withdrawal numeric(18,2),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS user_status_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  status text NOT NULL,
  changed_by uuid REFERENCES users(id),
  changed_at timestamptz NOT NULL DEFAULT now(),
  reason text
);

-- 2. Bets
CREATE TABLE IF NOT EXISTS bets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id),
  stake numeric(18,2) NOT NULL,
  odds numeric(10,2) NOT NULL,
  potential_payout numeric(18,2) NOT NULL,
  status text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS bet_legs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  bet_id uuid REFERENCES bets(id) ON DELETE CASCADE,
  event_id uuid,
  market_id uuid,
  selection text,
  odds numeric(10,2),
  result text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS bet_flags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  bet_id uuid REFERENCES bets(id) ON DELETE CASCADE,
  flag_type text NOT NULL,
  flagged_by uuid REFERENCES users(id),
  flagged_at timestamptz NOT NULL DEFAULT now(),
  notes text
);

-- 3. Transactions & Wallets
CREATE TABLE IF NOT EXISTS deposits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id),
  amount numeric(18,2) NOT NULL,
  status text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS withdrawals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id),
  amount numeric(18,2) NOT NULL,
  status text NOT NULL,
  requested_at timestamptz NOT NULL DEFAULT now(),
  processed_at timestamptz
);

CREATE TABLE IF NOT EXISTS wallet_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id),
  type text NOT NULL,
  amount numeric(18,2) NOT NULL,
  ref_id uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 4. Odds & Events
CREATE TABLE IF NOT EXISTS sports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sport_id uuid REFERENCES sports(id),
  name text NOT NULL,
  start_time timestamptz NOT NULL,
  status text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS markets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid REFERENCES events(id),
  name text NOT NULL,
  status text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS odds (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  market_id uuid REFERENCES markets(id),
  selection text NOT NULL,
  value numeric(10,2) NOT NULL,
  status text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS odds_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  odds_id uuid REFERENCES odds(id),
  old_value numeric(10,2),
  new_value numeric(10,2),
  changed_by uuid REFERENCES users(id),
  changed_at timestamptz NOT NULL DEFAULT now()
);

-- 5. Results
CREATE TABLE IF NOT EXISTS match_results (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid REFERENCES events(id),
  result text NOT NULL,
  submitted_by uuid REFERENCES users(id),
  submitted_at timestamptz NOT NULL DEFAULT now(),
  locked boolean NOT NULL DEFAULT false
);

CREATE TABLE IF NOT EXISTS settlement_jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  result_id uuid REFERENCES match_results(id),
  status text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 6. Jackpots
CREATE TABLE IF NOT EXISTS jackpots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  amount numeric(18,2) NOT NULL,
  status text NOT NULL,
  draw_time timestamptz NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS jackpot_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  jackpot_id uuid REFERENCES jackpots(id),
  user_id uuid REFERENCES users(id),
  entry_time timestamptz NOT NULL DEFAULT now()
);

-- 7. Risk & Fraud
CREATE TABLE IF NOT EXISTS risk_flags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id),
  risk_level text NOT NULL,
  notes text,
  flagged_by uuid REFERENCES users(id),
  flagged_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS suspicious_activity_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id),
  activity text NOT NULL,
  logged_at timestamptz NOT NULL DEFAULT now(),
  notes text
);

-- 8. Audit Logs
CREATE TABLE IF NOT EXISTS audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id uuid REFERENCES users(id),
  action text NOT NULL,
  target text,
  timestamp timestamptz NOT NULL DEFAULT now(),
  metadata jsonb
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_wallets_user_id ON wallets(user_id);
CREATE INDEX IF NOT EXISTS idx_bets_user_id ON bets(user_id);
CREATE INDEX IF NOT EXISTS idx_deposits_user_id ON deposits(user_id);
CREATE INDEX IF NOT EXISTS idx_withdrawals_user_id ON withdrawals(user_id);
CREATE INDEX IF NOT EXISTS idx_wallet_transactions_user_id ON wallet_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_events_sport_id ON events(sport_id);
CREATE INDEX IF NOT EXISTS idx_markets_event_id ON markets(event_id);
CREATE INDEX IF NOT EXISTS idx_odds_market_id ON odds(market_id);
CREATE INDEX IF NOT EXISTS idx_jackpot_entries_jackpot_id ON jackpot_entries(jackpot_id);
CREATE INDEX IF NOT EXISTS idx_risk_flags_user_id ON risk_flags(user_id);

-- RLS Policies (examples, more detail per module in next steps)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
CREATE POLICY admin_select_users ON users FOR SELECT USING (auth.role() IN ('admin', 'super_admin'));
-- (Repeat for all tables and actions as required)


-- 9. Wallet Transaction Trigger Function & Triggers
-- Unified handler for wallet-affecting actions (deposits, withdrawals, bets, refunds, etc.)

-- 1. Drop any existing trigger referencing deposit_wallet_trigger
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_trigger t
    JOIN pg_proc p ON t.tgfoid = p.oid
    WHERE t.tgrelid = 'deposits'::regclass
      AND p.proname = 'deposit_wallet_trigger'
  ) THEN
    EXECUTE 'DROP TRIGGER IF EXISTS deposit_completed_trigger ON deposits;';
  END IF;
END$$;

-- 2. Create the handler function
CREATE OR REPLACE FUNCTION handle_wallet_transaction(user_id uuid, tx_type text, tx_amount numeric, ref_id uuid) RETURNS void AS $$
BEGIN
  -- Credit or debit wallet
  IF tx_type = 'deposit' THEN
    UPDATE wallets SET balance = balance + tx_amount, updated_at = now() WHERE user_id = user_id;
  ELSIF tx_type = 'withdrawal' THEN
    UPDATE wallets SET balance = balance - tx_amount, updated_at = now() WHERE user_id = user_id;
  END IF;
  -- Log transaction
  INSERT INTO wallet_transactions(user_id, type, amount, ref_id, created_at) VALUES (user_id, tx_type, tx_amount, ref_id, now());
END;
$$ LANGUAGE plpgsql;

-- 3. Create the deposit_wallet_trigger function
CREATE OR REPLACE FUNCTION deposit_wallet_trigger()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'completed' THEN
    PERFORM handle_wallet_transaction(NEW.user_id, 'deposit', NEW.amount, NEW.id);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 4. Create the trigger
CREATE TRIGGER deposit_completed_trigger
AFTER INSERT ON deposits
FOR EACH ROW
WHEN (NEW.status = 'completed')
EXECUTE FUNCTION deposit_wallet_trigger();
