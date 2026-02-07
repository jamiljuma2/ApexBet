// Types for admin bets API
export interface AdminBet {
  id: string;
  user_id: string;
  stake: number;
  potential_payout: number;
  status: string;
  created_at: string;
  settled_at: string | null;
  legs: any[];
}

export interface AdminBetResponse {
  bets: AdminBet[];
  total: number;
}
