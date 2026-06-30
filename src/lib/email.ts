import { Resend } from "resend";
import { money, prettyDate } from "./format";
import { buildBookingIcs, googleCalendarUrl, type BookingEvent } from "./calendar";

const key = process.env.RESEND_API_KEY;
const from =
  process.env.RESEND_FROM_EMAIL ||
  "Bounce FX <bookings@bouncefxpartyrentals.com>";
// Where customer replies land — the real, monitored business inbox (Google
// Workspace), so a reply to an automated email reaches Bounce FX.
const replyTo = process.env.REPLY_TO_EMAIL || "Info@bouncefxpartyrentals.com";
// Inbox that receives new-booking notifications + calendar invites. Defaults to
// the monitored business inbox; set OWNER_CALENDAR_EMAIL to route booking
// invites into a specific Google Calendar (e.g. the owner's personal Gmail).
const ownerCalendarEmail =
  process.env.OWNER_CALENDAR_EMAIL || "Info@bouncefxpartyrentals.com";
const organizerEmail = "bookings@bouncefxpartyrentals.com";

export const emailConfigured = Boolean(key);

/** Stable per-booking event id so re-sends update rather than duplicate. */
function bookingUid(b: {
  confirmationNumber?: string;
  orderNumber?: string | number;
  eventDate: string;
  to?: string;
}): string {
  const seed =
    b.confirmationNumber ?? String(b.orderNumber ?? b.to ?? b.eventDate);
  return `${seed}-${b.eventDate}@bouncefxpartyrentals.com`;
}

interface BookingEmail {
  to: string;
  customerName: string;
  eventDate: string;
  items: string;
  total: number;
  deposit: number;
  deliveryFee: number;
  confirmationNumber?: string;
  orderNumber?: string | number;
  eventAddress?: string;
}

interface OwnerBookingEmail extends BookingEmail {
  customerEmail: string;
  customerPhone?: string;
}

export async function sendBookingConfirmation(b: BookingEmail) {
  if (!key) return { skipped: true };
  const resend = new Resend(key);
  const remaining = Math.round((b.total - b.deposit) * 100) / 100;

  // Calendar: a one-click Google link + an .ics attachment (Apple/Outlook).
  const customerEvent: BookingEvent = {
    eventDate: b.eventDate,
    summary: "Bounce FX Party Rental",
    description: `Your Bounce FX rental: ${b.items}.${
      b.confirmationNumber ? ` Confirmation ${b.confirmationNumber}.` : ""
    } Balance due on event day: ${money(remaining)}. Questions? Reply to your confirmation email or call 571-264-9996.`,
    location: b.eventAddress || undefined,
    uid: bookingUid(b),
  };
  const gcalUrl = googleCalendarUrl(customerEvent);
  const ics = buildBookingIcs(customerEvent, { method: "PUBLISH" });
  const calendarBlock = `
    <div style="text-align:center;margin:8px 0 4px">
      <a href="${gcalUrl}" target="_blank" style="display:inline-block;padding:11px 22px;background:#16161d;color:#fff;border-radius:999px;font-weight:700;font-size:14px;text-decoration:none">📅 Add to Google Calendar</a>
      <div style="font-size:12px;color:#999;margin-top:6px">Or open the attached calendar file (.ics).</div>
    </div>`;

  const confBlock = b.confirmationNumber
    ? `<div style="margin:16px 0;padding:14px;border:2px solid #eee;border-radius:14px;text-align:center;background:#FFF8E6">
        <div style="font-size:11px;letter-spacing:1px;text-transform:uppercase;color:#888">Confirmation number</div>
        <div style="font-size:22px;font-weight:800;color:#E63946;letter-spacing:1px">${
          b.confirmationNumber
        }</div>${
        b.orderNumber
          ? `<div style="font-size:11px;color:#999;margin-top:2px">Order #${b.orderNumber}</div>`
          : ""
      }
      </div>`
    : "";

  const html = `
  <div style="font-family:'DM Sans',Arial,sans-serif;max-width:560px;margin:0 auto;border:3px solid #16161d;border-radius:24px;overflow:hidden">
    <div style="background:#FFCB2B;padding:24px;text-align:center;border-bottom:3px solid #16161d">
      <div style="font-size:40px">🎈</div>
      <h1 style="margin:8px 0 0;font-size:26px;color:#16161d">You're booked!</h1>
    </div>
    <div style="padding:24px;color:#16161d">
      <p style="font-size:16px">Hi ${b.customerName}, your party is officially on the calendar. 🎉</p>
      ${confBlock}
      <table style="width:100%;border-collapse:collapse;margin:16px 0;font-size:15px">
        <tr><td style="padding:8px 0;color:#555">Event date</td><td style="text-align:right;font-weight:600">${prettyDate(
          b.eventDate
        )}</td></tr>
        <tr><td style="padding:8px 0;color:#555">Items</td><td style="text-align:right;font-weight:600">${
          b.items
        }</td></tr>
        <tr><td style="padding:8px 0;color:#555">Delivery</td><td style="text-align:right;font-weight:600">${
          b.deliveryFee === 0 ? "FREE" : money(b.deliveryFee)
        }</td></tr>
        <tr><td style="padding:8px 0;color:#555;border-top:2px solid #eee">Total</td><td style="text-align:right;font-weight:700;border-top:2px solid #eee">${money(
          b.total
        )}</td></tr>
        <tr><td style="padding:8px 0;color:#2ECC71">Deposit paid</td><td style="text-align:right;font-weight:700;color:#2ECC71">${money(
          b.deposit
        )}</td></tr>
        <tr><td style="padding:8px 0;color:#555">Balance due on event day</td><td style="text-align:right;font-weight:600">${money(
          remaining
        )}</td></tr>
      </table>
      ${calendarBlock}
      <p style="font-size:14px;color:#555">We'll reach out before your date to confirm setup details. Questions? Just reply to this email.</p>
      <p style="font-size:14px;margin-top:20px"><strong>Bounce FX Party Rentals</strong><br/>Make Your Event Memorable.</p>
    </div>
  </div>`;

  try {
    await resend.emails.send({
      from,
      to: b.to,
      replyTo,
      subject: `🎉 Your Bounce FX booking is confirmed for ${prettyDate(
        b.eventDate
      )}`,
      html,
      attachments: [
        {
          filename: "bounce-fx-booking.ics",
          content: Buffer.from(ics).toString("base64"),
        },
      ],
    });
    return { sent: true };
  } catch {
    return { error: true };
  }
}

/**
 * Notifies the business of a new booking and drops it into their Google Calendar
 * via an .ics invite (METHOD:REQUEST with the owner as attendee — Gmail
 * auto-adds it). Routed to OWNER_CALENDAR_EMAIL (defaults to the business inbox).
 */
export async function sendOwnerBookingNotification(b: OwnerBookingEmail) {
  if (!key) return { skipped: true };
  const resend = new Resend(key);
  const remaining = Math.round((b.total - b.deposit) * 100) / 100;

  const event: BookingEvent = {
    eventDate: b.eventDate,
    summary: `Rental — ${b.customerName}`,
    description: `Customer: ${b.customerName} (${b.customerEmail}${
      b.customerPhone ? `, ${b.customerPhone}` : ""
    })\\nItems: ${b.items}\\nTotal: ${money(b.total)} | Deposit paid: ${money(
      b.deposit
    )} | Balance due: ${money(remaining)}${
      b.confirmationNumber ? `\\nConfirmation: ${b.confirmationNumber}` : ""
    }`,
    location: b.eventAddress || undefined,
    uid: bookingUid(b),
  };
  const ics = buildBookingIcs(event, {
    method: "REQUEST",
    organizerEmail,
    attendeeEmail: ownerCalendarEmail,
  });

  const html = `
  <div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto">
    <h2 style="color:#16161d">🎈 New booking — ${b.customerName}</h2>
    <table style="width:100%;border-collapse:collapse;font-size:15px">
      <tr><td style="padding:6px 0;color:#555">Event date</td><td style="text-align:right;font-weight:600">${prettyDate(
        b.eventDate
      )}</td></tr>
      <tr><td style="padding:6px 0;color:#555">Customer</td><td style="text-align:right;font-weight:600">${
        b.customerName
      }</td></tr>
      <tr><td style="padding:6px 0;color:#555">Email</td><td style="text-align:right;font-weight:600">${
        b.customerEmail
      }</td></tr>
      <tr><td style="padding:6px 0;color:#555">Phone</td><td style="text-align:right;font-weight:600">${
        b.customerPhone || "—"
      }</td></tr>
      <tr><td style="padding:6px 0;color:#555">Address</td><td style="text-align:right;font-weight:600">${
        b.eventAddress || "—"
      }</td></tr>
      <tr><td style="padding:6px 0;color:#555">Items</td><td style="text-align:right;font-weight:600">${
        b.items
      }</td></tr>
      <tr><td style="padding:6px 0;color:#555;border-top:2px solid #eee">Total</td><td style="text-align:right;font-weight:700;border-top:2px solid #eee">${money(
        b.total
      )}</td></tr>
      <tr><td style="padding:6px 0;color:#2ECC71">Deposit paid</td><td style="text-align:right;font-weight:700;color:#2ECC71">${money(
        b.deposit
      )}</td></tr>
      <tr><td style="padding:6px 0;color:#555">Balance due</td><td style="text-align:right;font-weight:600">${money(
        remaining
      )}</td></tr>
    </table>
    <p style="font-size:13px;color:#999;margin-top:14px">This event has been added to your calendar from the attached invite.</p>
  </div>`;

  try {
    await resend.emails.send({
      from,
      to: ownerCalendarEmail,
      replyTo: b.customerEmail,
      subject: `New booking: ${b.customerName} — ${prettyDate(b.eventDate)}`,
      html,
      attachments: [
        {
          filename: "booking.ics",
          content: Buffer.from(ics).toString("base64"),
        },
      ],
    });
    return { sent: true };
  } catch {
    return { error: true };
  }
}

export async function sendContactMessage(payload: {
  name: string;
  email: string;
  phone?: string;
  eventDate?: string;
  message: string;
}) {
  if (!key) return { skipped: true };
  const resend = new Resend(key);
  try {
    await resend.emails.send({
      from,
      to: "Info@bouncefxpartyrentals.com",
      replyTo: payload.email,
      subject: `New website inquiry from ${payload.name}`,
      html: `
        <h2>New contact form submission</h2>
        <p><strong>Name:</strong> ${payload.name}</p>
        <p><strong>Email:</strong> ${payload.email}</p>
        <p><strong>Phone:</strong> ${payload.phone || "—"}</p>
        <p><strong>Event date:</strong> ${payload.eventDate || "—"}</p>
        <p><strong>Message:</strong><br/>${payload.message.replace(
          /\n/g,
          "<br/>"
        )}</p>`,
    });
    return { sent: true };
  } catch {
    return { error: true };
  }
}
