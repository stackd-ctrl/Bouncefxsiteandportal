import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getAdminSession } from "@/lib/auth";
import { writeContent } from "@/lib/content";

export const runtime = "nodejs";

/**
 * Allow empty, relative ("/…"), http(s), or inline image data URLs only.
 * Blocks javascript:/data:text/html etc. (stored-XSS). `data:image/*` is safe
 * in an <img> context and is used by the read-only-host prototype upload path.
 */
function isSafeUrl(v: unknown): boolean {
  if (typeof v !== "string" || v.trim() === "") return true;
  const s = v.trim();
  if (s.startsWith("/")) return true;
  if (/^data:image\/(png|jpeg|jpg|webp|gif);base64,/i.test(s)) return true;
  try {
    const u = new URL(s);
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
}

function collectUrls(body: any): unknown[] {
  const urls: unknown[] = [];
  if (body.site) urls.push(body.site.instagram, body.site.facebook);
  if (body.media) {
    urls.push(body.media.logo, body.media.hero);
    if (Array.isArray(body.media.gallery)) urls.push(...body.media.gallery);
  }
  for (const map of [body.products, body.bundles]) {
    if (map && typeof map === "object") {
      for (const o of Object.values<any>(map)) {
        if (o) {
          urls.push(o.image_url);
          if (Array.isArray(o.images)) urls.push(...o.images);
        }
      }
    }
  }
  return urls;
}

export async function POST(req: Request) {
  const session = await getAdminSession();
  if (!session.authed) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const body = await req.json();

    if (!collectUrls(body).every(isSafeUrl)) {
      return NextResponse.json(
        { error: "Image and social links must be http(s) or uploaded files." },
        { status: 400 }
      );
    }

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
