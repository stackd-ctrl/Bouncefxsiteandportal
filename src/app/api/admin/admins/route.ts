import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getAdminSession } from "@/lib/auth";
import { readContent, writeContent } from "@/lib/content";
import { createAdminSupabase, supabaseConfigured } from "@/lib/supabase/server";

export const runtime = "nodejs";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function ownerEmail(): string | null {
  return process.env.ADMIN_EMAIL?.toLowerCase() ?? null;
}

/** Return the current admin list (owner first, then allow-list). */
async function listAdmins() {
  const { admins } = await readContent();
  return { owner: ownerEmail(), admins };
}

export async function GET() {
  const session = await getAdminSession();
  if (!session.authed) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return NextResponse.json(await listAdmins());
}

export async function POST(req: Request) {
  const session = await getAdminSession();
  // Only the bootstrap owner may change who has access.
  if (!session.authed || !session.isOwner) {
    return NextResponse.json(
      { error: "Only the owner can manage admins." },
      { status: 403 }
    );
  }
  if (!supabaseConfigured) {
    return NextResponse.json(
      { error: "Connect Supabase to manage admins." },
      { status: 400 }
    );
  }

  let body: { action?: string; email?: string; password?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const action = body.action;
  const email = body.email?.trim().toLowerCase() ?? "";
  if (!EMAIL_RE.test(email)) {
    return NextResponse.json(
      { error: "Enter a valid email address." },
      { status: 400 }
    );
  }
  if (email === ownerEmail()) {
    return NextResponse.json(
      { error: "That's the owner account — it always has access." },
      { status: 400 }
    );
  }

  const { admins } = await readContent();

  if (action === "remove") {
    await writeContent({ admins: admins.filter((a) => a !== email) });
    revalidatePath("/admin");
    return NextResponse.json(await listAdmins());
  }

  if (action === "add") {
    // Optionally provision the login so the new admin can sign in immediately.
    const password = body.password?.trim();
    if (password) {
      if (password.length < 8) {
        return NextResponse.json(
          { error: "Temporary password must be at least 8 characters." },
          { status: 400 }
        );
      }
      try {
        const sb = createAdminSupabase();
        const { error } = await sb.auth.admin.createUser({
          email,
          password,
          email_confirm: true,
        });
        // Ignore "already registered" — they may already have a login; we just
        // want them on the allow-list. Surface any other failure.
        if (
          error &&
          !/already.*(registered|exists)/i.test(error.message ?? "")
        ) {
          return NextResponse.json(
            { error: `Could not create login: ${error.message}` },
            { status: 400 }
          );
        }
      } catch {
        return NextResponse.json(
          { error: "Could not create the login account." },
          { status: 500 }
        );
      }
    }

    const nextAdmins = admins.includes(email) ? admins : [...admins, email];
    await writeContent({ admins: nextAdmins });
    revalidatePath("/admin");
    return NextResponse.json({
      ...(await listAdmins()),
      provisioned: Boolean(password),
    });
  }

  return NextResponse.json({ error: "Unknown action." }, { status: 400 });
}
