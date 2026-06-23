import type { Booking } from "./types";
import { createAdminSupabase, supabaseConfigured } from "./supabase/server";

export async function getBookings(): Promise<Booking[]> {
  if (!supabaseConfigured) return [];
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
