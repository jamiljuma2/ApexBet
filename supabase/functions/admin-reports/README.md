# Admin Reports & Analytics Edge Function

This Supabase Edge Function provides secure, filterable access to reports and analytics data for the sportsbook admin dashboard.

## Endpoint
- **Path:** `/functions/v1/admin-reports`
- **Method:** `GET`
- **Auth:** Requires `admin` or `super_admin` role (JWT in `Authorization` header)

## Query Parameters
- `type` (optional): Filter by report type
- `from` (optional): Filter by generated_at >= date
- `to` (optional): Filter by generated_at <= date

## Response Example
```json
{
  "reports": [
    {
      "id": "report-uuid",
      "type": "DAILY_KPI",
      "generated_at": "2026-02-07T12:00:00Z",
      "filters": { "date": "2026-02-07" },
      "data": { "total_users": 1234, "revenue": 7890 }
    }
  ],
  "total": 5
}
```

## Security
- Only accessible to users with `admin` or `super_admin` roles.
- Uses Supabase Service Role key for secure, server-side queries.
