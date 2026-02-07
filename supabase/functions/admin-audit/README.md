# Admin Audit Logs Edge Function

This Supabase Edge Function provides secure, paginated, and filterable access to immutable audit logs for the sportsbook admin dashboard.

## Endpoint
- **Path:** `/functions/v1/admin-audit`
- **Method:** `GET`
- **Auth:** Requires `admin` or `super_admin` role (JWT in `Authorization` header)

## Query Parameters
- `limit` (optional): Number of logs to return (default: 50)
- `offset` (optional): Offset for pagination (default: 0)
- `actor_id` (optional): Filter by actor (admin user) ID
- `action` (optional): Filter by action type
- `target` (optional): Filter by target entity

## Response Example
```json
{
  "logs": [
    {
      "id": "uuid",
      "actor_id": "admin-uuid",
      "action": "UPDATE_USER",
      "target": "user-uuid",
      "details": { "field": "email", "old": "a@b.com", "new": "b@b.com" },
      "created_at": "2026-02-07T12:00:00Z"
    }
  ],
  "total": 123
}
```

## Security
- Only accessible to users with `admin` or `super_admin` roles.
- Uses Supabase Service Role key for secure, server-side queries.
- Logs are immutable and ordered by `created_at` descending.
