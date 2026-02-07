# ApexBet – API Contracts

## Supabase (client)

- **Auth**: `signUp`, `signInWithPassword`, `signOut`, `resetPasswordForEmail`, `updateUser` (Supabase Auth).
- **Data**: All reads/writes go through Supabase client with RLS. Key tables: `profiles`, `wallets`, `transactions`, `bet_slips`, `bets`, `sports`, `competitions`, `events`, `markets`, `selections`, `jackpots`, `jackpot_entries`, `notifications`.

## RPCs (PostgreSQL)

| Function | Caller | Purpose |
|----------|--------|---------|
| `wallet_debit(p_user_id, p_amount_kes, p_type, p_reference_id, p_metadata)` | authenticated / service_role | Debit wallet (bet, withdrawal). Returns transaction UUID. |
| `wallet_credit(...)` | service_role | Credit wallet (deposit, bet_win, refund). |
| `place_bet_slip(p_user_id, p_total_stake_kes, p_selections_json)` | authenticated | Place accumulator: one debit, one slip, N bets. `p_selections_json`: `[{ "selection_id", "event_id", "odds" }, ...]`. |
| `insert_pending_lipana_deposit(p_checkout_request_id, p_transaction_id)` | authenticated | Store pending Lipana deposit for webhook lookup (current user). |
| `settle_event_bets(p_event_id)` | service_role | After setting `selections.is_winner`, settle all slips that have a leg on this event and have all legs decided. |

## Next.js API routes

| Method | Route | Body | Description |
|--------|--------|------|-------------|
| POST | `/api/deposit` | `{ amount, phone }` | Initiate M-Pesa STK Push via Lipana. Requires auth. Min 10 KES. |
| POST | `/api/withdraw` | `{ amount, phone }` | Debit wallet and send payout via Lipana to phone. Requires auth. On Lipana failure, balance is refunded. |
| POST | `/api/webhooks/lipana` | Lipana webhook JSON | Handles `payment.success`; verifies `X-Lipana-Signature`; credits wallet. Idempotent. |

## Lipana (M-Pesa)

Payments are configured and handled via **Lipana** (https://api.lipana.dev/v1).

- **Deposit**: App calls `POST /api/deposit` → server calls Lipana `POST /v1/transactions/push-stk` with `LIPANA_SECRET_KEY`, then stores pending row in `mpesa_callbacks` via `insert_pending_lipana_deposit`. On success, Lipana sends a webhook to `POST /api/webhooks/lipana` with `payment.success`; server verifies `X-Lipana-Signature` with `LIPANA_WEBHOOK_SECRET`, looks up user by `checkoutRequestID`, credits wallet, marks callback processed.
- **Withdraw**: App calls `POST /api/withdraw` → server debits wallet then calls Lipana `POST /v1/payouts/phone`. If Lipana fails, server refunds via `wallet_credit` (requires `SUPABASE_SERVICE_ROLE_KEY`).

## Webhooks

- **Lipana**: Set your webhook URL in Lipana Dashboard to `https://your-domain.com/api/webhooks/lipana`. Use `LIPANA_WEBHOOK_SECRET` to verify the `X-Lipana-Signature` header (HMAC-SHA256 of raw body). Always verify before crediting.
