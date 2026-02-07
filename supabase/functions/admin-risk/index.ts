// deno-lint-ignore-file no-explicit-any
// @ts-ignore: Deno runtime provides these imports and env
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
// @ts-ignore: Deno runtime provides these imports and env
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

interface AdminRiskFlag {
  id: string;
  user_id: string;
  flag_type: string;
  reason: string;
  created_at: string;
  resolved: boolean;
  resolved_at: string | null;
}

interface SuspiciousActivityLog {
  id: string;
  user_id: string;
  activity: string;
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
  const user_id = url.searchParams.get("user_id") || undefined;
  const flag_type = url.searchParams.get("flag_type") || undefined;
  const resolved = url.searchParams.get("resolved") || undefined;
  const activity = url.searchParams.get("activity") || undefined;

  // Risk flags query
  let riskQuery = supabase
    .from("risk_flags")
    .select("id, user_id, flag_type, reason, created_at, resolved, resolved_at", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);
  if (user_id) riskQuery = riskQuery.eq("user_id", user_id);
  if (flag_type) riskQuery = riskQuery.eq("flag_type", flag_type);
  if (resolved) riskQuery = riskQuery.eq("resolved", resolved === "true");

  const { data: riskFlags, count: riskCount, error: riskError } = await riskQuery;
  if (riskError) {
    return new Response(JSON.stringify({ error: riskError.message }), { status: 500 });
  }

  // Suspicious activity logs query
  let activityQuery = supabase
    .from("suspicious_activity_logs")
    .select("id, user_id, activity, details, created_at", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);
  if (user_id) activityQuery = activityQuery.eq("user_id", user_id);
  if (activity) activityQuery = activityQuery.eq("activity", activity);

  const { data: activityLogs, count: activityCount, error: activityError } = await activityQuery;
  if (activityError) {
    return new Response(JSON.stringify({ error: activityError.message }), { status: 500 });
  }

  return new Response(
    JSON.stringify({
      risk_flags: (riskFlags || []) as AdminRiskFlag[],
      risk_total: riskCount,
      suspicious_activity_logs: (activityLogs || []) as SuspiciousActivityLog[],
      activity_total: activityCount,
    }),
    {
      headers: { "Content-Type": "application/json" },
    }
  );
});
