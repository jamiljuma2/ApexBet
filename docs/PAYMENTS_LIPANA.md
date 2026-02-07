# ApexBet – Payments with Lipana

ApexBet uses **Lipana** (https://lipana.dev) for M-Pesa deposits (STK Push) and withdrawals (payouts to phone).

## Setup

1. **Account**: Sign up at Lipana and complete onboarding.
2. **API keys**: In Dashboard > API Keys, create a key pair. Use the **secret key** (`lip_sk_test_...` or `lip_sk_live_...`) only on the server.
3. **Environment**:
   - `LIPANA_SECRET_KEY` – Your Lipana secret key (server-side only).
   - `LIPANA_WEBHOOK_SECRET` – From Dashboard > Webhooks; used to verify webhook signatures.
4. **Webhook URL**: In Lipana Dashboard > Webhooks, set the URL to:
   - `https://your-domain.com/api/webhooks/lipana`
   - For local testing use a tunnel (e.g. ngrok) and point Lipana to it.

## Deposit flow

1. User enters phone and amount on Deposit page.
2. Frontend calls `POST /api/deposit` with `{ amount, phone }`.
3. Server calls Lipana `POST /v1/transactions/push-stk` (min 10 KES).
4. Server stores pending deposit in `mpesa_callbacks` via `insert_pending_lipana_deposit(checkoutRequestID, transactionId)` so the webhook can identify the user.
5. User completes payment on their phone.
6. Lipana sends `payment.success` to your webhook URL with `X-Lipana-Signature`.
7. Server verifies signature, finds row by `checkoutRequestID`, credits wallet with `wallet_credit`, marks row as processed.

## Withdraw flow

1. User enters phone and amount on Withdraw page.
2. Frontend calls `POST /api/withdraw` with `{ amount, phone }`.
3. Server debits wallet with `wallet_debit`.
4. Server calls Lipana `POST /v1/payouts/phone` to send funds to the phone.
5. If Lipana returns an error, server refunds the user with `wallet_credit` (requires `SUPABASE_SERVICE_ROLE_KEY`).

## Security

- Never expose `LIPANA_SECRET_KEY` or `LIPANA_WEBHOOK_SECRET` in client code or repos.
- Always verify `X-Lipana-Signature` before processing webhooks (HMAC-SHA256 of raw body with webhook secret).
- Use sandbox keys (`lip_sk_test_...`) for development; switch to live keys for production.

## Testing

- Use Lipana **sandbox** and test phone numbers from their docs.
- Test webhook with the test feature in Lipana Dashboard and ensure your endpoint returns 200 and that the wallet is credited only once (idempotency).
