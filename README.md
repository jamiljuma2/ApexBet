# ApexBet – Sports Betting Web Application

A production-ready sportsbook web app (Betika-like functionality) with **Next.js**, **Supabase**, and **M-Pesa** integration. Web-only, fully responsive.

## Features

- **User**: Registration, login, email verification, wallet (KES), M-Pesa deposit (STK Push), withdraw, bet slip (single & multi), betting/transaction history, profile, daily limits, self-exclusion
- **Sports**: Football, Basketball, Tennis, Virtual; pre-match and live betting; markets: 1X2, Over/Under, BTTS, Handicap, Correct Score
- **Jackpots**: Daily, Mega, Fixed Odds (structure in place)
- **Admin**: Dashboard, user/bet/transaction/event/jackpot management, audit logs, roles (Super Admin, Risk Manager, Finance Admin, Support Agent)
- **Security**: RLS, wallet functions (SECURITY DEFINER), idempotent M-Pesa callbacks, audit trail

## Tech Stack

- **Frontend**: Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS, Framer Motion, Zustand, TanStack Query
- **Backend**: Supabase (PostgreSQL, Auth, RLS, Edge Functions, Realtime)
- **Payments**: Lipana (M-Pesa STK Push, payouts); internal wallet ledger

## Quick start

1. **Clone and install**
   ```bash
   cd ApexBet
   npm install
   ```

2. **Supabase**
   - Create a project at [supabase.com](https://supabase.com).
   - Run all SQL files in `supabase/migrations/` in order (SQL Editor).
   - Copy project URL and anon key.

3. **Environment**
   ```bash
   cp .env.example .env.local
   ```
   Set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` in `.env.local`.

4. **Run**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000). Register, then promote your user to admin in Supabase:
   ```sql
   UPDATE public.profiles SET role = 'super_admin' WHERE email = 'your@email.com';
   ```

5. **Payments (optional)**  
   Configure Lipana: set `LIPANA_SECRET_KEY` and `LIPANA_WEBHOOK_SECRET` in `.env.local`, and add the webhook URL in Lipana Dashboard. See [docs/PAYMENTS_LIPANA.md](docs/PAYMENTS_LIPANA.md).

## Project structure

- `src/app` – Next.js App Router (auth, dashboard, sports, live, jackpots, admin)
- `src/components` – UI (layout, bet slip, event cards, profile form)
- `src/lib` – Supabase client (browser/server/middleware)
- `src/store` – Zustand (auth, bet slip)
- `src/types` – TypeScript types
- `supabase/migrations` – PostgreSQL schema, RLS, functions, seed
- `supabase/functions` – (Legacy M-Pesa Edge Functions; payments now use Lipana via Next.js API routes)
- `docs/` – Architecture and deployment

## Documentation

- [Architecture](docs/ARCHITECTURE.md) – Modules, DB, security, real-time
- [Deployment](docs/DEPLOYMENT.md) – Supabase, env, Edge Functions, production checklist

## Testing strategy

- **Unit**: Critical wallet/bet logic can be tested via Supabase local or pg_prove against migrations.
- **Integration**: Call `place_bet_slip` and `wallet_debit`/`wallet_credit` from tests with test user.
- **E2E**: Playwright/Cypress for login, deposit flow, add-to-slip, place bet (test environment with seed data).
- **Payments**: Use Lipana sandbox and test webhooks for deposit/withdraw flow.

## License

Proprietary. Build from scratch; no Betika branding or assets.
