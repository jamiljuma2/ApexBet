// Types for admin reports API
export interface AdminReport {
  id: string;
  type: string;
  generated_at: string;
  filters: any;
  data: any;
}

export interface AdminReportResponse {
  reports: AdminReport[];
  total: number;
}
