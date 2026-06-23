import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth";
import { createAdminSupabase, supabaseConfigured } from "@/lib/supabase/server";

// Fields the owner is allowed to edit on a booking from the CRM.
const ALLOWED = [
  "customer_name",
  "customer_email",
  "customer_phone",
  "event_address",
  "event_type",
  "event_date",
  "special_requests",
  "status",
  "archived",
] as const;

export async function POST(req: Request) {
  const session = await getAdminSession();
  if (!session.authed) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  if (!body?.id || typeof body.id !== "string") {
    return NextResponse.json({ error: "Missing booking id" }, { status: 400 });
  }

  const patch: Record<string, unknown> = {};
  for (const key of ALLOWED) {
    if (key in body && body[key] !== undefined) patch[key] = body[key];
  }
  if (Object.keys(patch).length === 0) {
    return NextResponse.json({ error: "Nothing to update" }, { status: 400 });
  }

  // Demo mode — no DB; the client keeps the change in local state.
  if (!supabaseConfigured || session.demo) {
    return NextResponse.json({ ok: true, demo: true });
  }

  try {
    const supabase = createAdminSupabase();
    const { error } = await supabase
      .from("bookings")
      .update(patch)
      .eq("id", body.id);
    if (error) throw error;
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }
}
