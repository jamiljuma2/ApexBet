// Types for admin transactions API
export interface AdminTransaction {
  id: string;
  user_id: string;
  type: string;
  amount: number;
  status: string;
  created_at: string;
  reference: string;
}

export interface AdminTransactionResponse {
  transactions: AdminTransaction[];
  total: number;
}
