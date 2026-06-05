import { NextResponse } from "next/server";
import { sendContactMessage } from "@/lib/email";

/**
 * Review submission. In production this would persist to Supabase and queue for
 * moderation; for now it emails the team (if Resend is configured) and returns
 * success so the UI can thank the customer.
 */
export async function POST(req: Request) {
  try {
    const { name, rating, text, city } = await req.json();
    if (!name || !text) {
      return NextResponse.json(
        { error: "Name and review are required." },
        { status: 400 }
      );
    }
    await sendContactMessage({
      name,
      email: "noreply@bouncefxpartyrentals.com",
      message: `New ${rating || 5}-star review from ${name} (${
        city || "—"
      }):\n\n${text}`,
    });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Something went wrong." }, { status: 500 });
  }
}
