// Types for admin audit logs API
export interface AuditLog {
  id: string;
  actor_id: string;
  action: string;
  target: string;
  details: any;
  created_at: string;
}

export interface AuditLogResponse {
  logs: AuditLog[];
  total: number;
}
