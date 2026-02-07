// deno-lint-ignore-file no-explicit-any
// @ts-ignore: Deno runtime provides these imports and env
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
// @ts-ignore: Deno runtime provides these imports and env
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

interface AdminBet {
  id: string;
  user_id: string;
  stake: number;
  potential_payout: number;
  status: string;
  created_at: string;
  settled_at: string | null;
  legs: any[];
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

  // Parse query params for pagination/filtering
  const url = new URL(req.url);
  const limit = parseInt(url.searchParams.get("limit") || "50", 10);
  const offset = parseInt(url.searchParams.get("offset") || "0", 10);
  const status = url.searchParams.get("status") || undefined;
  const user_id = url.searchParams.get("user_id") || undefined;
  const search = url.searchParams.get("search") || undefined;

  let query = supabase
    .from("bets")
    .select("id, user_id, stake, potential_payout, status, created_at, settled_at, bet_legs(*)", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);
  if (status) query = query.eq("status", status);
  if (user_id) query = query.eq("user_id", user_id);
  if (search) query = query.ilike("id", `%${search}%`);

  const { data, count, error: queryError } = await query;
  if (queryError) {
    return new Response(JSON.stringify({ error: queryError.message }), { status: 500 });
  }

  // Flatten bet legs
  const bets: AdminBet[] = (data || []).map((b: any) => ({
    id: b.id,
    user_id: b.user_id,
    stake: b.stake,
    potential_payout: b.potential_payout,
    status: b.status,
    created_at: b.created_at,
    settled_at: b.settled_at,
    legs: b.bet_legs || [],
  }));

  return new Response(JSON.stringify({ bets, total: count }), {
    headers: { "Content-Type": "application/json" },
  });
});
