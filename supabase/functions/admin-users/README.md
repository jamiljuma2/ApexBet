# Admin Users Edge Function

This Supabase Edge Function provides secure, paginated, and filterable access to user management data for the sportsbook admin dashboard.

## Endpoint
- **Path:** `/functions/v1/admin-users`
- **Method:** `GET`
- **Auth:** Requires `admin` or `super_admin` role (JWT in `Authorization` header)

## Query Parameters
- `limit` (optional): Number of users to return (default: 50)
- `offset` (optional): Offset for pagination (default: 0)
- `status` (optional): Filter by user status
- `role` (optional): Filter by user role
- `search` (optional): Search by email (case-insensitive)

## Response Example
```json
{
  "users": [
    {
      "id": "uuid",
      "email": "admin@example.com",
      "full_name": "Admin User",
      "role": "admin",
      "status": "active",
      "created_at": "2026-02-07T12:00:00Z",
      "last_login": "2026-02-07T13:00:00Z",
      "wallet_balance": 1000
    }
  ],
  "total": 123
}
```

## Security
- Only accessible to users with `admin` or `super_admin` roles.
- Uses Supabase Service Role key for secure, server-side queries.
