import { NextResponse } from "next/server";
import { getProducts } from "@/lib/catalog";
import { createAdminSupabase, supabaseConfigured } from "@/lib/supabase/server";

/**
 * Returns, for a given event date, which product IDs are already booked.
 * The page combines this with the full catalog to mark items available/booked.
 *
 * Without Supabase configured, nothing is booked (demo mode) so the calendar
 * is fully interactive for previewing the design.
 */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const date = searchParams.get("date");
  if (!date) {
    return NextResponse.json({ error: "date is required" }, { status: 400 });
  }

  const products = await getProducts();

  // Count how many of each product are already booked that day, then compare
  // against how many Bounce FX owns (quantity-aware — not just booked/not).
  const counts: Record<string, number> = {};
  if (supabaseConfigured) {
    try {
      const supabase = createAdminSupabase();
      const { data } = await supabase
        .from("bookings")
        .select("product_ids,status")
        .eq("event_date", date)
        .in("status", ["pending", "confirmed"]);
      (data ?? []).forEach((b: { product_ids: string[] }) =>
        (b.product_ids ?? []).forEach((id) => {
          counts[id] = (counts[id] ?? 0) + 1;
        })
      );
    } catch {
      /* none booked */
    }
  }

  const availability = products.map((p) => {
    const owned = p.quantity ?? 1;
    const booked = counts[p.id] ?? 0;
    return {
      id: p.id,
      name: p.name,
      category: p.category,
      price_per_day: p.price_per_day,
      image_url: p.image_url,
      available: booked < owned,
      remaining: Math.max(owned - booked, 0),
      owned,
    };
  });

  return NextResponse.json({ date, availability });
}
