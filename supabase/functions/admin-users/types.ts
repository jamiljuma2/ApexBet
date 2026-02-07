// Types for admin users API
export interface AdminUser {
  id: string;
  email: string;
  full_name: string;
  role: string;
  status: string;
  created_at: string;
  last_login: string | null;
  wallet_balance: number;
}

export interface AdminUserResponse {
  users: AdminUser[];
  total: number;
}
