// Types for admin jackpots API
export interface AdminJackpot {
  id: string;
  name: string;
  amount: number;
  status: string;
  timer_end: string;
  created_at: string;
  updated_at: string;
  entries: number;
}

export interface AdminJackpotResponse {
  jackpots: AdminJackpot[];
  total: number;
}
