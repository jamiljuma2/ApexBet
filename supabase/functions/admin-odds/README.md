# Admin Odds Edge Function

This Supabase Edge Function provides secure, paginated, and filterable access to odds and events management data for the sportsbook admin dashboard.

## Endpoint
- **Path:** `/functions/v1/admin-odds`
- **Method:** `GET`
- **Auth:** Requires `admin` or `super_admin` role (JWT in `Authorization` header)

## Query Parameters
- `limit` (optional): Number of odds to return (default: 50)
- `offset` (optional): Offset for pagination (default: 0)
- `event_id` (optional): Filter by event ID
- `market` (optional): Filter by market
- `status` (optional): Filter by odds status
- `search` (optional): Search by selection (case-insensitive)

## Response Example
```json
{
  "odds": [
    {
      "id": "odds-uuid",
      "event_id": "event-uuid",
      "market": "1X2",
      "selection": "Home",
      "odds": 2.5,
      "status": "active",
      "updated_at": "2026-02-07T12:00:00Z"
    }
  ],
  "total": 123
}
```

## Security
- Only accessible to users with `admin` or `super_admin` roles.
- Uses Supabase Service Role key for secure, server-side queries.
