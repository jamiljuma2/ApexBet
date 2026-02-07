export type UserRole =
  | 'user'
  | 'support_agent'
  | 'finance_admin'
  | 'risk_manager'
  | 'super_admin';

export type TransactionType =
  | 'deposit'
  | 'withdrawal'
  | 'bet_placement'
  | 'bet_win'
  | 'bet_refund'
  | 'adjustment'
  | 'jackpot_win';

export type TransactionStatus = 'pending' | 'completed' | 'failed' | 'cancelled';

export type BetStatus =
  | 'pending'
  | 'won'
  | 'lost'
  | 'void'
  | 'cancelled'
  | 'cash_out';

export type EventStatus =
  | 'scheduled'
  | 'live'
  | 'ended'
  | 'cancelled'
  | 'postponed';

export type MarketType =
  | '1x2'
  | 'over_under'
  | 'btts'
  | 'handicap'
  | 'correct_score'
  | 'double_chance';

export type JackpotType = 'daily' | 'mega' | 'fixed_odds';
export type JackpotStatus = 'open' | 'closed' | 'drawing' | 'settled';

export interface Profile {
  id: string;
  email: string | null;
  phone: string | null;
  full_name: string | null;
  avatar_url: string | null;
  role: UserRole;
  kyc_verified: boolean;
  daily_limit_kes: number;
  self_excluded_until: string | null;
  created_at: string;
  updated_at: string;
}

export interface Wallet {
  id: string;
  user_id: string;
  balance_kes: number;
  locked_kes: number;
  total_deposited: number;
  total_withdrawn: number;
  created_at: string;
  updated_at: string;
}

export interface Transaction {
  id: string;
  user_id: string;
  type: TransactionType;
  amount_kes: number;
  balance_before: number | null;
  balance_after: number | null;
  status: TransactionStatus;
  reference_id: string | null;
  metadata: Record<string, unknown>;
  mpesa_checkout_id: string | null;
  mpesa_receipt: string | null;
  created_at: string;
  updated_at: string;
}

export interface Sport {
  id: string;
  name: string;
  slug: string;
  icon: string | null;
  is_virtual: boolean;
  sort_order: number;
  active: boolean;
  created_at: string;
}

export interface Competition {
  id: string;
  sport_id: string;
  name: string;
  slug: string;
  country_code: string | null;
  created_at: string;
}

export interface Event {
  id: string;
  competition_id: string;
  external_id: string | null;
  home_team: string;
  away_team: string;
  start_time: string;
  status: EventStatus;
  home_score: number | null;
  away_score: number | null;
  minute: number | null;
  is_live: boolean;
  result_confirmed: boolean;
  created_at: string;
  updated_at: string;
}

export interface Market {
  id: string;
  event_id: string;
  type: MarketType;
  name: string;
  line_value: number | null;
  sort_order: number;
  settled: boolean;
  created_at: string;
}

export interface Selection {
  id: string;
  market_id: string;
  name: string;
  odds: number;
  odds_locked: boolean;
  is_winner: boolean | null;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface Bet {
  id: string;
  user_id: string;
  selection_id: string;
  event_id: string;
  slip_id: string | null;
  stake_kes: number;
  odds: number;
  potential_win_kes: number;
  status: BetStatus;
  cash_out_offered_kes: number | null;
  cash_out_taken_kes: number | null;
  settled_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface BetSlip {
  id: string;
  user_id: string;
  total_stake_kes: number;
  total_odds: number;
  potential_win_kes: number;
  status: BetStatus;
  bet_count: number;
  created_at: string;
  updated_at: string;
}

export interface Jackpot {
  id: string;
  type: JackpotType;
  name: string;
  prize_kes: number;
  entry_fee_kes: number;
  status: JackpotStatus;
  draw_time: string | null;
  settled_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  channel: 'in_app' | 'email' | 'sms';
  title: string;
  body: string | null;
  read_at: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
}
