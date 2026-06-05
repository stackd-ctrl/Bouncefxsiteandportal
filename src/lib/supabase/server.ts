import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { createClient as createServiceClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const service = process.env.SUPABASE_SERVICE_ROLE_KEY;

/** True only when real Supabase credentials are configured. */
export const supabaseConfigured = Boolean(url && anon);

/**
 * Cookie-aware server client (respects RLS / auth session). Used by the admin
 * dashboard and any place that needs the logged-in user.
 */
export function createServerSupabase() {
  const cookieStore = cookies();
  return createServerClient(url!, anon!, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        cookiesToSet: { name: string; value: string; options?: any }[]
      ) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        } catch {
          // Called from a Server Component — safe to ignore.
        }
      },
    },
  });
}

/**
 * Service-role client that bypasses RLS. Server-only — never expose to the
 * browser. Used by webhooks and trusted server actions to write bookings.
 */
export function createAdminSupabase() {
  if (!url || !service) {
    throw new Error("Supabase service role credentials are not configured.");
  }
  return createServiceClient(url, service, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
