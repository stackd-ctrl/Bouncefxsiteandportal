import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { getAdminSession } from "@/lib/auth";
import { createAdminSupabase, supabaseConfigured } from "@/lib/supabase/server";

export const runtime = "nodejs";

const ALLOWED = ["image/png", "image/jpeg", "image/webp", "image/gif"];

export async function POST(req: Request) {
  const session = await getAdminSession();
  if (!session.authed) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const form = await req.formData();
    const file = form.get("file");
    if (!(file instanceof File)) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }
    if (!ALLOWED.includes(file.type)) {
      return NextResponse.json(
        { error: "Please upload a PNG, JPG, WEBP, or GIF." },
        { status: 400 }
      );
    }
    if (file.size > 8 * 1024 * 1024) {
      return NextResponse.json(
        { error: "Image must be under 8MB." },
        { status: 400 }
      );
    }

    const ext = (file.name.split(".").pop() || "png")
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "");
    const safeBase = file.name
      .replace(/\.[^.]+$/, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .slice(0, 40);
    // unique-ish name without Date.now (stable per call); use size+random hex
    const rand = Math.abs(
      (file.size * 2654435761) % 0xffffffff
    ).toString(16);
    const fileName = `${safeBase || "image"}-${rand}.${ext}`;
    const buffer = Buffer.from(await file.arrayBuffer());

    // Supabase Storage (persists on read-only hosts like Vercel).
    if (supabaseConfigured) {
      const sb = createAdminSupabase();
      const { error } = await sb.storage
        .from("media")
        .upload(fileName, buffer, { contentType: file.type, upsert: true });
      if (error) throw error;
      const { data: pub } = sb.storage.from("media").getPublicUrl(fileName);
      return NextResponse.json({ url: pub.publicUrl });
    }

    // Local file fallback.
    const dir = path.join(process.cwd(), "public", "uploads");
    await fs.mkdir(dir, { recursive: true });
    await fs.writeFile(path.join(dir, fileName), buffer);
    return NextResponse.json({ url: `/uploads/${fileName}` });
  } catch {
    return NextResponse.json(
      {
        error:
          "Upload failed. On read-only hosting (e.g. Vercel) connect Supabase Storage.",
      },
      { status: 500 }
    );
  }
}
