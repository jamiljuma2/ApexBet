// deno-lint-ignore-file no-explicit-any
// @ts-ignore: Deno runtime provides these imports and env
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
// @ts-ignore: Deno runtime provides these imports and env
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

interface AdminUser {
  id: string;
  email: string;
  full_name: string;
  role: string;
  status: string;
  created_at: string;
  last_login: string | null;
  wallet_balance: number;
}

serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
      },
    });
  }
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
  // Debug log: print user object
  console.log('Edge Function user object:', JSON.stringify(user));
  // Check for admin role in user_metadata or raw_user_meta_data
  const userRole = user?.user?.user_metadata?.role || user?.user?.raw_user_meta_data?.role;
  if (error || !user || !(userRole === "admin" || userRole === "super_admin")) {
    return new Response("Forbidden", { status: 403 });
  }

  // Parse query params for pagination/filtering
  const url = new URL(req.url);
  const limit = parseInt(url.searchParams.get("limit") || "50", 10);
  const offset = parseInt(url.searchParams.get("offset") || "0", 10);
  const status = url.searchParams.get("status") || undefined;
  const role = url.searchParams.get("role") || undefined;
  const search = url.searchParams.get("search") || undefined;

  let query = supabase
    .from("users")
    .select("id, email, full_name, role, status, created_at, last_login, wallets(balance)", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);
  if (status) query = query.eq("status", status);
  if (role) query = query.eq("role", role);
  if (search) query = query.ilike("email", `%${search}%`);

  const { data, count, error: queryError } = await query;
  if (queryError) {
    return new Response(JSON.stringify({ error: queryError.message }), {
      status: 500,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
      },
    });
  }

  // Flatten wallet balance
  const users: AdminUser[] = (data || []).map((u: any) => ({
    id: u.id,
    email: u.email,
    full_name: u.full_name,
    role: u.role,
    status: u.status,
    created_at: u.created_at,
    last_login: u.last_login,
    wallet_balance: u.wallets?.[0]?.balance ?? 0,
  }));

  return new Response(JSON.stringify({ users, total: count }), {
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  });
});
