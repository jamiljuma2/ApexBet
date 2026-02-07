# Admin Transactions Edge Function

This Supabase Edge Function provides secure, paginated, and filterable access to wallet transaction and deposit/withdrawal data for the sportsbook admin dashboard.

## Endpoint
- **Path:** `/functions/v1/admin-transactions`
- **Method:** `GET`
- **Auth:** Requires `admin` or `super_admin` role (JWT in `Authorization` header)

## Query Parameters
- `limit` (optional): Number of transactions to return (default: 50)
- `offset` (optional): Offset for pagination (default: 0)
- `status` (optional): Filter by transaction status
- `user_id` (optional): Filter by user ID
- `type` (optional): Filter by transaction type
- `search` (optional): Search by reference (case-insensitive)

## Response Example
```json
{
  "transactions": [
    {
      "id": "txn-uuid",
      "user_id": "user-uuid",
      "type": "deposit",
      "amount": 1000,
      "status": "completed",
      "created_at": "2026-02-07T12:00:00Z",
      "reference": "MPESA12345"
    }
  ],
  "total": 123
}
```

## Security
- Only accessible to users with `admin` or `super_admin` roles.
- Uses Supabase Service Role key for secure, server-side queries.
