// deno-lint-ignore-file no-explicit-any
// @ts-ignore: Deno runtime provides these imports and env
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
// @ts-ignore: Deno runtime provides these imports and env
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Types for metrics response
interface Metrics {
  total_users: number;
  active_bets: number;
  daily_revenue: number;
  pending_withdrawals: number;
  chart_data: {
    users: Array<{ date: string; count: number }>;
    revenue: Array<{ date: string; amount: number }>;
    bets: Array<{ date: string; count: number }>;
  };
}

serve(async (req: Request) => {
  // Auth check (admin only)
  // @ts-ignore: Deno runtime provides Deno.env
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  // @ts-ignore: Deno runtime provides Deno.env
  const supabaseServiceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!supabaseUrl || !supabaseServiceRoleKey) {
    return new Response("Supabase env vars not set", { status: 500 });
  }
  const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);
  const authHeader = req.headers.get("Authorization");
  if (!authHeader) return new Response("Unauthorized", { status: 401 });
  const jwt = authHeader.replace("Bearer ", "");
  const { data: user, error } = await supabase.auth.getUser(jwt);
  const userRole = user?.user?.role as string | undefined;
  if (error || !user || !(userRole === "admin" || userRole === "super_admin")) {
    return new Response("Forbidden", { status: 403 });
  }

  // Metrics queries
  const [
    { count: total_users },
    { count: active_bets },
    { sum: daily_revenue },
    { count: pending_withdrawals },
  ] = await Promise.all([
    supabase.from("users").select("*", { count: "exact", head: true }),
    supabase.from("bets").select("*", { count: "exact", head: true }).eq("status", "active"),
    supabase
      .from("wallet_transactions")
      .select("amount", { head: false })
      .gte("created_at", new Date().toISOString().slice(0, 10))
      .then((r: any) => ({
        sum:
          (r.data?.reduce(
            (acc: number, t: { amount: number | string }) => acc + Number(t.amount),
            0
          ) as number) || 0,
      })),
    supabase.from("withdrawals").select("*", { count: "exact", head: true }).eq("status", "pending"),
  ]);

  // Placeholder chart data
  const chart_data = {
    users: [
      { date: "2026-02-01", count: 100 },
      { date: "2026-02-02", count: 120 },
    ],
    revenue: [
      { date: "2026-02-01", amount: 10000 },
      { date: "2026-02-02", amount: 12000 },
    ],
    bets: [
      { date: "2026-02-01", count: 50 },
      { date: "2026-02-02", count: 60 },
    ],
  };

  const metrics: Metrics = {
    total_users: total_users ?? 0,
    active_bets: active_bets ?? 0,
    daily_revenue: daily_revenue ?? 0,
    pending_withdrawals: pending_withdrawals ?? 0,
    chart_data,
  };

  return new Response(JSON.stringify(metrics), {
    headers: { "Content-Type": "application/json" },
  });
});
