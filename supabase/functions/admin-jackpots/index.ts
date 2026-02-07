// deno-lint-ignore-file no-explicit-any
// @ts-ignore: Deno runtime provides these imports and env
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
// @ts-ignore: Deno runtime provides these imports and env
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

interface AdminJackpot {
  id: string;
  name: string;
  amount: number;
  status: string;
  timer_end: string;
  created_at: string;
  updated_at: string;
  entries: number;
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
  const search = url.searchParams.get("search") || undefined;

  let query = supabase
    .from("jackpots")
    .select("id, name, amount, status, timer_end, created_at, updated_at, jackpot_entries(count)", { count: "exact" })
    .order("updated_at", { ascending: false })
    .range(offset, offset + limit - 1);
  if (status) query = query.eq("status", status);
  if (search) query = query.ilike("name", `%${search}%`);

  const { data, count, error: queryError } = await query;
  if (queryError) {
    return new Response(JSON.stringify({ error: queryError.message }), { status: 500 });
  }

  // Flatten entries count
  const jackpots: AdminJackpot[] = (data || []).map((j: any) => ({
    id: j.id,
    name: j.name,
    amount: j.amount,
    status: j.status,
    timer_end: j.timer_end,
    created_at: j.created_at,
    updated_at: j.updated_at,
    entries: j.jackpot_entries?.[0]?.count ?? 0,
  }));

  return new Response(JSON.stringify({ jackpots, total: count }), {
    headers: { "Content-Type": "application/json" },
  });
});
