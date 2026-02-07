// deno-lint-ignore-file no-explicit-any
// @ts-ignore: Deno runtime provides these imports and env
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
// @ts-ignore: Deno runtime provides these imports and env
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

interface AuditLog {
  id: string;
  actor_id: string;
  action: string;
  target: string;
  details: any;
  created_at: string;
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
  const actor_id = url.searchParams.get("actor_id") || undefined;
  const action = url.searchParams.get("action") || undefined;
  const target = url.searchParams.get("target") || undefined;

  let query = supabase.from("audit_logs").select("*", { count: "exact" }).order("created_at", { ascending: false }).range(offset, offset + limit - 1);
  if (actor_id) query = query.eq("actor_id", actor_id);
  if (action) query = query.eq("action", action);
  if (target) query = query.eq("target", target);

  const { data, count, error: queryError } = await query;
  if (queryError) {
    return new Response(JSON.stringify({ error: queryError.message }), { status: 500 });
  }

  return new Response(JSON.stringify({ logs: data as AuditLog[], total: count }), {
    headers: { "Content-Type": "application/json" },
  });
});
