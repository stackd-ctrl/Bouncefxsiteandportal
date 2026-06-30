/**
 * Calendar helpers for bookings.
 *
 * - `googleCalendarUrl` builds a one-click "Add to Google Calendar" link for the
 *   customer's confirmation email.
 * - `buildBookingIcs` builds an RFC 5545 .ics file. Attached to the customer
 *   email (METHOD:PUBLISH) so Apple/Outlook users can add it too, and attached
 *   to the owner notification (METHOD:REQUEST, owner as ATTENDEE) so the booking
 *   drops straight into the owner's Google Calendar.
 *
 * Events are all-day on the event date — rentals don't have a fixed clock time,
 * and all-day avoids any timezone drift.
 */

export interface BookingEvent {
  /** Event date as "YYYY-MM-DD". */
  eventDate: string;
  summary: string;
  description: string;
  location?: string;
  /** Stable unique id so re-sends update rather than duplicate the event. */
  uid: string;
}

/** "2026-07-15" -> "20260715" */
function ymd(date: string): string {
  return date.replace(/-/g, "").slice(0, 8);
}

/** Day after the event date, as "YYYYMMDD" (all-day DTEND is exclusive). */
function nextDayYmd(date: string): string {
  const [y, m, d] = date.split("-").map(Number);
  const dt = new Date(Date.UTC(y, (m || 1) - 1, (d || 1) + 1));
  return dt.toISOString().slice(0, 10).replace(/-/g, "");
}

/** UTC timestamp as "YYYYMMDDTHHMMSSZ". */
function stamp(now: Date): string {
  return now.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
}

/** Escape text per RFC 5545 (backslash, newline, comma, semicolon). */
function esc(s: string): string {
  return s
    .replace(/\\/g, "\\\\")
    .replace(/\n/g, "\\n")
    .replace(/,/g, "\\,")
    .replace(/;/g, "\\;");
}

/** Fold lines longer than 75 octets per RFC 5545. */
function fold(line: string): string {
  if (line.length <= 73) return line;
  const parts: string[] = [line.slice(0, 73)];
  let rest = line.slice(73);
  while (rest.length) {
    parts.push(" " + rest.slice(0, 72));
    rest = rest.slice(72);
  }
  return parts.join("\r\n");
}

export function buildBookingIcs(
  ev: BookingEvent,
  opts: {
    method?: "PUBLISH" | "REQUEST";
    organizerEmail?: string;
    attendeeEmail?: string;
  } = {}
): string {
  const method = opts.method ?? "PUBLISH";
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Bounce FX Party Rentals//Booking//EN",
    "CALSCALE:GREGORIAN",
    `METHOD:${method}`,
    "BEGIN:VEVENT",
    `UID:${ev.uid}`,
    `DTSTAMP:${stamp(new Date())}`,
    `DTSTART;VALUE=DATE:${ymd(ev.eventDate)}`,
    `DTEND;VALUE=DATE:${nextDayYmd(ev.eventDate)}`,
    `SUMMARY:${esc(ev.summary)}`,
    `DESCRIPTION:${esc(ev.description)}`,
  ];
  if (ev.location) lines.push(`LOCATION:${esc(ev.location)}`);
  if (opts.organizerEmail) {
    lines.push(
      `ORGANIZER;CN=Bounce FX Party Rentals:mailto:${opts.organizerEmail}`
    );
  }
  if (opts.attendeeEmail) {
    lines.push(
      `ATTENDEE;CN=${opts.attendeeEmail};RSVP=FALSE:mailto:${opts.attendeeEmail}`
    );
  }
  lines.push("STATUS:CONFIRMED", "END:VEVENT", "END:VCALENDAR");
  return lines.map(fold).join("\r\n");
}

export function googleCalendarUrl(ev: BookingEvent): string {
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: ev.summary,
    dates: `${ymd(ev.eventDate)}/${nextDayYmd(ev.eventDate)}`,
    details: ev.description,
  });
  if (ev.location) params.set("location", ev.location);
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}
