import { createServerSupabase, supabaseConfigured } from "./supabase/server";
import { readContent } from "./content";

export interface AdminSession {
  authed: boolean;
  email: string | null;
  /** True when running without Supabase (preview/demo mode). */
  demo: boolean;
  /** True when the signed-in user is the bootstrap owner (ADMIN_EMAIL).
   *  Only the owner can add/remove other admins. */
  isOwner: boolean;
}

/**
 * Resolve the current admin session.
 *
 * - Without Supabase: demo/preview mode is open ONLY in local dev (or when
 *   ADMIN_DEMO=1 is explicitly set). In production this fails closed so the
 *   admin can never be reached unauthenticated by accident.
 * - With Supabase: access is granted to the bootstrap owner (ADMIN_EMAIL) OR
 *   any email on the managed allow-list (content.admins). A missing ADMIN_EMAIL
 *   with an empty allow-list is treated as deny-all (never allow-any).
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
      const owner = process.env.ADMIN_EMAIL?.toLowerCase();
      const email = user?.email?.toLowerCase() ?? null;

      if (!email) {
        return { authed: false, email: null, demo: false, isOwner: false };
      }

      const isOwner = Boolean(owner && email === owner);
      // Extra admins are stored in the content store (lowercased on save).
      let onAllowList = false;
      if (!isOwner) {
        try {
          const { admins } = await readContent();
          onAllowList = admins.includes(email);
        } catch {
          onAllowList = false;
        }
      }

      return {
        authed: isOwner || onAllowList,
        email: user?.email ?? null,
        demo: false,
        isOwner,
      };
    } catch {
      return { authed: false, email: null, demo: false, isOwner: false };
    }
  }

  // No Supabase = no real data (bookings are sample, edits are ephemeral). Open
  // the admin in local dev, or on a hosted prototype when ADMIN_DEMO=1 is set.
  // Locked by default in production so a stray deploy isn't left wide open.
  const demoAllowed =
    process.env.NODE_ENV !== "production" || process.env.ADMIN_DEMO === "1";
  return {
    authed: demoAllowed,
    email: null,
    demo: demoAllowed,
    isOwner: demoAllowed,
  };
}
