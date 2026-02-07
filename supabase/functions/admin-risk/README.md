# Admin Risk & Fraud Edge Function

This Supabase Edge Function provides secure, paginated, and filterable access to risk flags and suspicious activity logs for the sportsbook admin dashboard.

## Endpoint
- **Path:** `/functions/v1/admin-risk`
- **Method:** `GET`
- **Auth:** Requires `admin` or `super_admin` role (JWT in `Authorization` header)

## Query Parameters
- `limit` (optional): Number of records to return (default: 50)
- `offset` (optional): Offset for pagination (default: 0)
- `user_id` (optional): Filter by user ID
- `flag_type` (optional): Filter by risk flag type
- `resolved` (optional): Filter by resolution status (true/false)
- `activity` (optional): Filter by suspicious activity type

## Response Example
```json
{
  "risk_flags": [
    {
      "id": "flag-uuid",
      "user_id": "user-uuid",
      "flag_type": "MULTI_ACCOUNT",
      "reason": "Multiple accounts detected",
      "created_at": "2026-02-07T12:00:00Z",
      "resolved": false,
      "resolved_at": null
    }
  ],
  "risk_total": 10,
  "suspicious_activity_logs": [
    {
      "id": "log-uuid",
      "user_id": "user-uuid",
      "activity": "UNUSUAL_BET",
      "details": { "stake": 10000 },
      "created_at": "2026-02-07T12:00:00Z"
    }
  ],
  "activity_total": 5
}
```

## Security
- Only accessible to users with `admin` or `super_admin` roles.
- Uses Supabase Service Role key for secure, server-side queries.
