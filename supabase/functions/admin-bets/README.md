# Admin Bets Edge Function

This Supabase Edge Function provides secure, paginated, and filterable access to bet monitoring data for the sportsbook admin dashboard.

## Endpoint
- **Path:** `/functions/v1/admin-bets`
- **Method:** `GET`
- **Auth:** Requires `admin` or `super_admin` role (JWT in `Authorization` header)

## Query Parameters
- `limit` (optional): Number of bets to return (default: 50)
- `offset` (optional): Offset for pagination (default: 0)
- `status` (optional): Filter by bet status
- `user_id` (optional): Filter by user ID
- `search` (optional): Search by bet ID (case-insensitive)

## Response Example
```json
{
  "bets": [
    {
      "id": "bet-uuid",
      "user_id": "user-uuid",
      "stake": 100,
      "potential_payout": 500,
      "status": "active",
      "created_at": "2026-02-07T12:00:00Z",
      "settled_at": null,
      "legs": [
        { "id": "leg-uuid", "event_id": "event-uuid", "market": "1X2", "selection": "Home", "odds": 2.5 }
      ]
    }
  ],
  "total": 123
}
```

## Security
- Only accessible to users with `admin` or `super_admin` roles.
- Uses Supabase Service Role key for secure, server-side queries.
