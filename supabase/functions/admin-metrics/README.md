# Admin Metrics Edge Function

This Supabase Edge Function provides secure, aggregated dashboard metrics for the sportsbook admin dashboard.

## Endpoint
- **Path:** `/functions/v1/admin-metrics`
- **Method:** `GET`
- **Auth:** Requires `admin` or `super_admin` role (JWT in `Authorization` header)

## Response Example
```json
{
  "total_users": 1234,
  "active_bets": 56,
  "daily_revenue": 7890,
  "pending_withdrawals": 3,
  "chart_data": {
    "users": [{ "date": "2026-02-01", "count": 100 }],
    "revenue": [{ "date": "2026-02-01", "amount": 10000 }],
    "bets": [{ "date": "2026-02-01", "count": 50 }]
  }
}
```

## Security
- Only accessible to users with `admin` or `super_admin` roles.
- Uses Supabase Service Role key for secure, server-side queries.

## Implementation
- Aggregates user, bet, revenue, and withdrawal metrics.
- Returns chart data for dashboard visualizations (placeholder, replace with real queries as needed).
