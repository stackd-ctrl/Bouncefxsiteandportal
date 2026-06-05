import { createServerSupabase, supabaseConfigured } from "./supabase/server";

export interface AdminSession {
  authed: boolean;
  email: string | null;
  /** True when running without Supabase (preview/demo mode). */
  demo: boolean;
}

/**
 * Resolve the current admin session.
 *
 * - Without Supabase: demo/preview mode is open ONLY in local dev (or when
 *   ADMIN_DEMO=1 is explicitly set). In production this fails closed so the
 *   admin can never be reached unauthenticated by accident.
 * - With Supabase: a logged-in user whose email matches ADMIN_EMAIL is allowed.
 *   A missing ADMIN_EMAIL is treated as deny-all (never allow-any).
 */
export async function getAdminSession(): Promise<AdminSession> {
  // When Supabase IS configured there is (potentially) real customer data, so we
  // ALWAYS require an authenticated owner — an env var alone can never bypass it.
  if (supabaseConfigured) {
    try {
      const supabase = createServerSupabase();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      const allowed = process.env.ADMIN_EMAIL?.toLowerCase();
      const email = user?.email?.toLowerCase() ?? null;
      // Deny-all when ADMIN_EMAIL is unset — never fall open to any logged-in user.
      const authed = Boolean(allowed && email && email === allowed);
      return { authed, email: user?.email ?? null, demo: false };
    } catch {
      return { authed: false, email: null, demo: false };
    }
  }

  // No Supabase = no real data (bookings are sample, edits are ephemeral). Open
  // the admin in local dev, or on a hosted prototype when ADMIN_DEMO=1 is set.
  // Locked by default in production so a stray deploy isn't left wide open.
  const demoAllowed =
    process.env.NODE_ENV !== "production" || process.env.ADMIN_DEMO === "1";
  return { authed: demoAllowed, email: null, demo: demoAllowed };
}
