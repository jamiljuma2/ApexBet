// deno-lint-ignore-file no-explicit-any
// @ts-ignore: Deno runtime provides these imports and env
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
// @ts-ignore: Deno runtime provides these imports and env
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

interface AdminTransaction {
  id: string;
  user_id: string;
  type: string;
  amount: number;
  status: string;
  created_at: string;
  reference: string;
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
  const type = url.searchParams.get("type") || undefined;
  const search = url.searchParams.get("search") || undefined;

  let query = supabase
    .from("wallet_transactions")
    .select("id, user_id, type, amount, status, created_at, reference", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);
  if (status) query = query.eq("status", status);
  if (user_id) query = query.eq("user_id", user_id);
  if (type) query = query.eq("type", type);
  if (search) query = query.ilike("reference", `%${search}%`);

  const { data, count, error: queryError } = await query;
  if (queryError) {
    return new Response(JSON.stringify({ error: queryError.message }), { status: 500 });
  }

  const transactions: AdminTransaction[] = (data || []).map((t: any) => ({
    id: t.id,
    user_id: t.user_id,
    type: t.type,
    amount: t.amount,
    status: t.status,
    created_at: t.created_at,
    reference: t.reference,
  }));

  return new Response(JSON.stringify({ transactions, total: count }), {
    headers: { "Content-Type": "application/json" },
  });
});
