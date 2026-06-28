import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getAdminSession } from "@/lib/auth";
import { createAdminSupabase, supabaseConfigured } from "@/lib/supabase/server";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const session = await getAdminSession();
  if (!session.authed) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  if (!body?.id || typeof body.id !== "string") {
    return NextResponse.json({ error: "Missing booking id" }, { status: 400 });
  }

  // Demo mode — no DB; the client drops the row from local state.
  if (!supabaseConfigured || session.demo) {
    return NextResponse.json({ ok: true, demo: true });
  }

  try {
    const supabase = createAdminSupabase();
    const { error } = await supabase.from("bookings").delete().eq("id", body.id);
    if (error) throw error;
    revalidatePath("/admin");
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Delete failed" }, { status: 500 });
  }
}
