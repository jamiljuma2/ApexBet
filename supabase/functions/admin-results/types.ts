// Types for admin results API
export interface AdminResult {
  id: string;
  event_id: string;
  market: string;
  result: string;
  locked: boolean;
  created_at: string;
  updated_at: string;
}

export interface AdminResultResponse {
  results: AdminResult[];
  total: number;
}
