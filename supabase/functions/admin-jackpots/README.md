# Admin Jackpots Edge Function

This Supabase Edge Function provides secure, paginated, and filterable access to jackpot management data for the sportsbook admin dashboard.

## Endpoint
- **Path:** `/functions/v1/admin-jackpots`
- **Method:** `GET`
- **Auth:** Requires `admin` or `super_admin` role (JWT in `Authorization` header)

## Query Parameters
- `limit` (optional): Number of jackpots to return (default: 50)
- `offset` (optional): Offset for pagination (default: 0)
- `status` (optional): Filter by jackpot status
- `search` (optional): Search by jackpot name (case-insensitive)

## Response Example
```json
{
  "jackpots": [
    {
      "id": "jackpot-uuid",
      "name": "Super Jackpot",
      "amount": 100000,
      "status": "active",
      "timer_end": "2026-02-07T18:00:00Z",
      "created_at": "2026-02-07T12:00:00Z",
      "updated_at": "2026-02-07T13:00:00Z",
      "entries": 123
    }
  ],
  "total": 10
}
```

## Security
- Only accessible to users with `admin` or `super_admin` roles.
- Uses Supabase Service Role key for secure, server-side queries.
