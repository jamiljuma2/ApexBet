// Types for admin odds API
export interface AdminOdds {
  id: string;
  event_id: string;
  market: string;
  selection: string;
  odds: number;
  status: string;
  updated_at: string;
}

export interface AdminOddsResponse {
  odds: AdminOdds[];
  total: number;
}
