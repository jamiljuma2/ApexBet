# ApexBet – Deployment Guide

## Prerequisites

- Node.js 18+
- npm or yarn
- Supabase account
- Lipana account (for M-Pesa deposits and payouts)

## 1. Supabase setup

1. Create a new project at [supabase.com](https://supabase.com).
2. In **SQL Editor**, run the migrations in order:
   - `supabase/migrations/00001_initial_schema.sql`
   - `supabase/migrations/00002_rls_policies.sql`
   - `supabase/migrations/00003_wallet_and_bet_functions.sql`
   - `supabase/migrations/00004_seed_sports_events.sql`
   - `supabase/migrations/00005_bet_settlement.sql`
   - `supabase/migrations/00006_lipana_pending_deposit.sql`
3. In **Authentication > Providers**, enable Email and optionally Phone.
4. Copy **Project URL**, **anon** key, and **service_role** key (keep service role secret).

## 2. Environment variables

Create `.env.local` in the project root:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

LIPANA_SECRET_KEY=lip_sk_test_...   # or lip_sk_live_... for production
LIPANA_WEBHOOK_SECRET=your_webhook_secret
```

- **SUPABASE_SERVICE_ROLE_KEY**: Required for Lipana webhook (credit wallet) and for refunds on failed payouts. Never expose to the client.
- **LIPANA_***: From [Lipana Dashboard](https://lipana.dev). Webhook secret is under Webhooks; set the webhook URL to `https://your-domain.com/api/webhooks/lipana`.

## 3. Next.js app

```bash
npm install --legacy-peer-deps
npm run build
npm start
```

For development: `npm run dev`.

## 4. First admin user

After signing up a user, promote to admin in SQL Editor:

```sql
UPDATE public.profiles SET role = 'super_admin' WHERE email = 'your@email.com';
```

## 5. Production checklist

- [ ] Use strong Supabase anon key and RLS; never expose service role key to the client.
- [ ] Set Lipana webhook URL to `https://your-domain.com/api/webhooks/lipana` and verify signature in code (already implemented).
- [ ] Enable HTTPS and set correct redirect URLs in Supabase Auth settings.
- [ ] Optional: rate limiting (e.g. Upstash) on auth and payment endpoints.
- [ ] Optional: backup and point-in-time recovery in Supabase.

See [PAYMENTS_LIPANA.md](PAYMENTS_LIPANA.md) for full payment setup.
