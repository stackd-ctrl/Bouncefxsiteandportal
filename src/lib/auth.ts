import { createServerSupabase, supabaseConfigured } from "./supabase/server";

export interface AdminSession {
  authed: boolean;
  email: string | null;
  /** True when running without Supabase (preview/demo mode). */
  demo: boolean;
}

/**
 * Resolve the current admin session. In demo mode (no Supabase) we treat the
 * dashboard as open so the owner can preview it. With Supabase configured,
 * only a logged-in user whose email matches ADMIN_EMAIL is allowed.
 */
export async function getAdminSession(): Promise<AdminSession> {
  if (!supabaseConfigured) {
    return { authed: true, email: null, demo: true };
  }
  try {
    const supabase = createServerSupabase();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    const allowed = process.env.ADMIN_EMAIL?.toLowerCase();
    const email = user?.email?.toLowerCase() ?? null;
    const authed = Boolean(
      email && (!allowed || email === allowed)
    );
    return { authed, email: user?.email ?? null, demo: false };
  } catch {
    return { authed: false, email: null, demo: false };
  }
}
