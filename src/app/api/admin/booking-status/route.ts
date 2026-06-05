import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth";
import { createAdminSupabase, supabaseConfigured } from "@/lib/supabase/server";
import type { BookingStatus } from "@/lib/types";

const VALID: BookingStatus[] = [
  "pending",
  "confirmed",
  "completed",
  "cancelled",
];

export async function POST(req: Request) {
  const session = await getAdminSession();
  if (!session.authed) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id, status } = await req.json();
  if (!id || !VALID.includes(status)) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  // Demo mode — nothing to persist; pretend success so the UI updates.
  if (!supabaseConfigured || session.demo) {
    return NextResponse.json({ ok: true, demo: true });
  }

  try {
    const supabase = createAdminSupabase();
    const { error } = await supabase
      .from("bookings")
      .update({ status })
      .eq("id", id);
    if (error) throw error;
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }
}
