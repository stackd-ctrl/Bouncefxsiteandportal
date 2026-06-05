import type { Booking } from "./types";
import { DEMO_BOOKINGS } from "./demo-bookings";
import { createAdminSupabase, supabaseConfigured } from "./supabase/server";

export async function getBookings(): Promise<Booking[]> {
  if (!supabaseConfigured) return DEMO_BOOKINGS;
  try {
    const supabase = createAdminSupabase();
    const { data, error } = await supabase
      .from("bookings")
      .select("*")
      .order("event_date", { ascending: true });
    if (error || !data) return [];
    return data as Booking[];
  } catch {
    return [];
  }
}
