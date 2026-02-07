// Types for admin risk API
export interface AdminRiskFlag {
  id: string;
  user_id: string;
  flag_type: string;
  reason: string;
  created_at: string;
  resolved: boolean;
  resolved_at: string | null;
}

export interface SuspiciousActivityLog {
  id: string;
  user_id: string;
  activity: string;
  details: any;
  created_at: string;
}

export interface AdminRiskResponse {
  risk_flags: AdminRiskFlag[];
  risk_total: number;
  suspicious_activity_logs: SuspiciousActivityLog[];
  activity_total: number;
}
