-- RLS: Enable on all relevant tables
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

-- Public read for sports, competitions, events, markets, selections, jackpots (listings)
ALTER TABLE public.sports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.competitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.markets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.selections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.jackpots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.jackpot_events ENABLE ROW LEVEL SECURITY;

-- Helper: is admin
CREATE OR REPLACE FUNCTION public.is_admin(uid UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = uid AND role IN ('super_admin', 'risk_manager', 'finance_admin', 'support_agent')
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Helper: is super admin
CREATE OR REPLACE FUNCTION public.is_super_admin(uid UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (SELECT 1 FROM public.profiles WHERE id = uid AND role = 'super_admin');
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Profiles: own row
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);
-- Admins can view/update any profile
CREATE POLICY "Admins can view all profiles" ON public.profiles
  FOR SELECT USING (public.is_admin(auth.uid()));
CREATE POLICY "Admins can update profiles" ON public.profiles
  FOR UPDATE USING (public.is_admin(auth.uid()));

-- Wallets: own row only
CREATE POLICY "Users can view own wallet" ON public.wallets
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all wallets" ON public.wallets
  FOR SELECT USING (public.is_admin(auth.uid()));
CREATE POLICY "Admins can update wallets" ON public.wallets
  FOR UPDATE USING (public.is_admin(auth.uid()));
-- Insert is via trigger only; no direct user insert

-- Transactions: own only
CREATE POLICY "Users can view own transactions" ON public.transactions
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all transactions" ON public.transactions
  FOR SELECT USING (public.is_admin(auth.uid()));

-- Bets: own only
CREATE POLICY "Users can view own bets" ON public.bets
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all bets" ON public.bets
  FOR SELECT USING (public.is_admin(auth.uid()));

-- Bet slips: own only
CREATE POLICY "Users can view own bet slips" ON public.bet_slips
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own bet slips" ON public.bet_slips
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins can view all bet slips" ON public.bet_slips
  FOR SELECT USING (public.is_admin(auth.uid()));

-- Notifications: own only
CREATE POLICY "Users can view own notifications" ON public.notifications
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own notifications (read)" ON public.notifications
  FOR UPDATE USING (auth.uid() = user_id);

-- Jackpot entries: own + read for jackpot
CREATE POLICY "Users can view own jackpot entries" ON public.jackpot_entries
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own jackpot entries" ON public.jackpot_entries
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Verification codes: service role / edge functions only; no user policy

-- Audit logs: admins only read
CREATE POLICY "Admins can view audit logs" ON public.audit_logs
  FOR SELECT USING (public.is_admin(auth.uid()));

-- M-Pesa callbacks: service role only (no anon policy)

-- Sports, competitions, events, markets, selections: anon read
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

-- Jackpots: read all, admin manage
CREATE POLICY "Anyone can view jackpots" ON public.jackpots FOR SELECT USING (true);
CREATE POLICY "Anyone can view jackpot_events" ON public.jackpot_events FOR SELECT USING (true);
CREATE POLICY "Admins can manage jackpots" ON public.jackpots FOR ALL USING (public.is_admin(auth.uid()));
CREATE POLICY "Admins can manage jackpot_events" ON public.jackpot_events FOR ALL USING (public.is_admin(auth.uid()));
