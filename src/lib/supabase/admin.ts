import { createClient } from '@supabase/supabase-js';

/**
 * Server-only Supabase client with service role key.
 * Use for admin operations (e.g. inserting into mpesa_callbacks from webhook).
 * Never expose this client or the service role key to the browser.
 */
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY and NEXT_PUBLIC_SUPABASE_URL must be set for admin operations');
  }
  return createClient(url, key);
}
