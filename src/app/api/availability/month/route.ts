import { NextResponse } from "next/server";
import { getProducts } from "@/lib/catalog";
import { createAdminSupabase, supabaseConfigured } from "@/lib/supabase/server";

/**
 * Booking "load" per day for a month — used to render the availability
 * heat-map calendar. Returns { loads: { "YYYY-MM-DD": 0..1 } } where the value
 * is bookedItems / totalItems for that date.
 *
 * Without Supabase configured, no bookings exist yet, so every day reports as
 * available (empty load map).
 */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const year = Number(searchParams.get("year"));
  const month = Number(searchParams.get("month")); // 1-12
  if (!year || !month) {
    return NextResponse.json({ error: "year and month required" }, { status: 400 });
  }

  const products = await getProducts();
  const total = Math.max(products.length, 1);
  const daysInMonth = new Date(year, month, 0).getDate();
  const loads: Record<string, number> = {};

  if (supabaseConfigured) {
    try {
      const supabase = createAdminSupabase();
      const start = `${year}-${String(month).padStart(2, "0")}-01`;
      const end = `${year}-${String(month).padStart(2, "0")}-${String(
        daysInMonth
      ).padStart(2, "0")}`;
      const { data } = await supabase
        .from("bookings")
        .select("event_date,product_ids,status")
        .gte("event_date", start)
        .lte("event_date", end)
        .in("status", ["pending", "confirmed"]);

      const byDate = new Map<string, Set<string>>();
      (data ?? []).forEach((b: { event_date: string; product_ids: string[] }) => {
        const set = byDate.get(b.event_date) ?? new Set<string>();
        (b.product_ids ?? []).forEach((id) => set.add(id));
        byDate.set(b.event_date, set);
      });
      byDate.forEach((set, date) => {
        loads[date] = Math.min(set.size / total, 1);
      });
      return NextResponse.json({ loads });
    } catch {
      // fall through to demo pattern
    }
  }

  // No backend yet → no bookings → every day is open.
  return NextResponse.json({ loads });
}
