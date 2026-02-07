// deno-lint-ignore-file no-explicit-any
// @ts-ignore: Deno runtime provides these imports and env
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
// @ts-ignore: Deno runtime provides these imports and env
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

interface AdminReport {
  id: string;
  type: string;
  generated_at: string;
  filters: any;
  data: any;
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

  // Parse query params for filtering
  const url = new URL(req.url);
  const type = url.searchParams.get("type") || undefined;
  const from = url.searchParams.get("from") || undefined;
  const to = url.searchParams.get("to") || undefined;

  let query = supabase
    .from("reports")
    .select("id, type, generated_at, filters, data", { count: "exact" })
    .order("generated_at", { ascending: false });
  if (type) query = query.eq("type", type);
  if (from) query = query.gte("generated_at", from);
  if (to) query = query.lte("generated_at", to);

  const { data, count, error: queryError } = await query;
  if (queryError) {
    return new Response(JSON.stringify({ error: queryError.message }), { status: 500 });
  }

  const reports: AdminReport[] = (data || []).map((r: any) => ({
    id: r.id,
    type: r.type,
    generated_at: r.generated_at,
    filters: r.filters,
    data: r.data,
  }));

  return new Response(JSON.stringify({ reports, total: count }), {
    headers: { "Content-Type": "application/json" },
  });
});
