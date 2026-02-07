# ApexBet – System Architecture

## Overview

ApexBet is a sportsbook web application (web-only, responsive) with Supabase as backend and Next.js (App Router) + React frontend. All monetary amounts are in KES (Kenyan Shilling). M-Pesa is used for deposits and withdrawals.

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS, Framer Motion, Zustand, TanStack Query |
| Backend | Supabase (PostgreSQL, Auth, RLS, Edge Functions, Realtime, Storage) |
| Payments | M-Pesa STK Push (deposit), wallet ledger (withdraw) |
| Real-time | Supabase Realtime (optional for live odds); WebSockets can be added via Socket.IO |

## Module Overview

1. **Auth Service** – Supabase Auth (email/password). Profiles and wallets created via DB trigger on signup. OTP for phone/email can be implemented via Edge Functions + Twilio/SendGrid.
2. **Wallet & Payments** – Internal ledger in `wallets` and `transactions`. Deposit: M-Pesa STK Push Edge Function → callback Edge Function → `wallet_credit`. Withdrawal: API route → `wallet_debit` (actual M-Pesa B2C can be added via Edge Function).
3. **Betting Engine** – `place_bet_slip` RPC: one debit, one slip, N bet rows. Settlement: `settle_event_bets(event_id)` after admin sets selection winners and confirms result.
4. **Odds Management** – Stored in `selections.odds`; admins (or feeds) update. Lock via `odds_locked` when needed.
5. **Live Betting** – Events with `is_live = true`; odds can be updated in real time; Supabase Realtime can broadcast odds changes.
6. **User Management** – Profiles, limits, self-exclusion in `profiles`; admin roles in `user_role` enum.
7. **Admin & Risk** – Admin dashboard; RLS `is_admin()`; audit in `audit_logs`.
8. **Reporting** – Queries on `transactions`, `bet_slips`, `bets`; can be exposed as views or API routes.
9. **Notifications** – Table `notifications`; delivery (SMS/email) via Edge Functions and third-party providers.
10. **Audit & Logging** – `audit_logs` for immutable trail; triggers or application code can insert on sensitive actions.

## Database Highlights

- **profiles** – Extends auth.users; role, daily_limit_kes, self_excluded_until.
- **wallets** – One per user; balance_kes, locked_kes.
- **transactions** – Ledger; type, amount_kes, balance_before/after, reference_id (e.g. slip_id).
- **events** – Matches; status, is_live, result_confirmed.
- **markets** – Per event; type (1x2, over_under, etc.).
- **selections** – Outcomes with odds; is_winner set on settlement.
- **bets** – Single leg; slip_id links to bet_slips.
- **bet_slips** – One stake, combined odds, status (pending/won/lost).
- **jackpots** – Daily/mega/fixed_odds; jackpot_events, jackpot_entries.
- **mpesa_callbacks** – Idempotency and user_id for STK callback.
- **audit_logs** – action, resource_type, resource_id, old/new values.

## Security

- RLS on all user-scoped and admin tables; public read for sports/events/markets/selections/jackpots.
- `wallet_debit` / `wallet_credit` and `place_bet_slip` are SECURITY DEFINER with strict checks.
- No secrets in client; M-Pesa credentials in Edge Function secrets only.
- Idempotent M-Pesa callback (processed_at) to avoid double credit.

## Real-time

- Supabase Realtime can subscribe to `selections` (odds), `events` (score, status), `wallets` (balance) for live UI updates.
- Optional: Socket.IO server for high-frequency odds if needed.

## Deployment

- Next.js: Vercel or any Node host.
- Supabase: Hosted project; run migrations in SQL Editor or via CLI.
- Edge Functions: Deploy with `supabase functions deploy`; set secrets in dashboard.
