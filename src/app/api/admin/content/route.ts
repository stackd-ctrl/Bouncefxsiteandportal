import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getAdminSession } from "@/lib/auth";
import { writeContent } from "@/lib/content";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const session = await getAdminSession();
  if (!session.authed) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const body = await req.json();
    const merged = await writeContent({
      products: body.products,
      bundles: body.bundles,
      site: body.site,
      media: body.media,
    });
    // Refresh the whole site so edits show everywhere.
    revalidatePath("/", "layout");
    return NextResponse.json({ ok: true, content: merged });
  } catch {
    return NextResponse.json(
      { error: "Could not save changes." },
      { status: 500 }
    );
  }
}
