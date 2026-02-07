// deno-lint-ignore-file no-explicit-any
// @ts-ignore: Deno runtime provides these imports and env
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
// @ts-ignore: Deno runtime provides these imports and env
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

interface AdminResult {
  id: string;
  event_id: string;
  market: string;
  result: string;
  locked: boolean;
  created_at: string;
  updated_at: string;
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
  const event_id = url.searchParams.get("event_id") || undefined;
  const market = url.searchParams.get("market") || undefined;
  const locked = url.searchParams.get("locked") || undefined;
  const search = url.searchParams.get("search") || undefined;

  let query = supabase
    .from("match_results")
    .select("id, event_id, market, result, locked, created_at, updated_at", { count: "exact" })
    .order("updated_at", { ascending: false })
    .range(offset, offset + limit - 1);
  if (event_id) query = query.eq("event_id", event_id);
  if (market) query = query.eq("market", market);
  if (locked) query = query.eq("locked", locked === "true");
  if (search) query = query.ilike("result", `%${search}%`);

  const { data, count, error: queryError } = await query;
  if (queryError) {
    return new Response(JSON.stringify({ error: queryError.message }), { status: 500 });
  }

  const results: AdminResult[] = (data || []).map((r: any) => ({
    id: r.id,
    event_id: r.event_id,
    market: r.market,
    result: r.result,
    locked: r.locked,
    created_at: r.created_at,
    updated_at: r.updated_at,
  }));

  return new Response(JSON.stringify({ results, total: count }), {
    headers: { "Content-Type": "application/json" },
  });
});
