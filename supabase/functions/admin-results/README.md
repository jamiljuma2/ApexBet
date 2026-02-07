# Admin Results Edge Function

This Supabase Edge Function provides secure, paginated, and filterable access to results management data for the sportsbook admin dashboard.

## Endpoint
- **Path:** `/functions/v1/admin-results`
- **Method:** `GET`
- **Auth:** Requires `admin` or `super_admin` role (JWT in `Authorization` header)

## Query Parameters
- `limit` (optional): Number of results to return (default: 50)
- `offset` (optional): Offset for pagination (default: 0)
- `event_id` (optional): Filter by event ID
- `market` (optional): Filter by market
- `locked` (optional): Filter by lock status (true/false)
- `search` (optional): Search by result (case-insensitive)

## Response Example
```json
{
  "results": [
    {
      "id": "result-uuid",
      "event_id": "event-uuid",
      "market": "1X2",
      "result": "Home",
      "locked": false,
      "created_at": "2026-02-07T12:00:00Z",
      "updated_at": "2026-02-07T13:00:00Z"
    }
  ],
  "total": 123
}
```

## Security
- Only accessible to users with `admin` or `super_admin` roles.
- Uses Supabase Service Role key for secure, server-side queries.
