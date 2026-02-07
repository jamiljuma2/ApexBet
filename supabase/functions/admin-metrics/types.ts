// Types for admin metrics API
export interface Metrics {
  total_users: number;
  active_bets: number;
  daily_revenue: number;
  pending_withdrawals: number;
  chart_data: {
    users: Array<{ date: string; count: number }>;
    revenue: Array<{ date: string; amount: number }>;
    bets: Array<{ date: string; count: number }>;
  };
}
