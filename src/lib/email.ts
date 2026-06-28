import { Resend } from "resend";
import { money, prettyDate } from "./format";

const key = process.env.RESEND_API_KEY;
const from =
  process.env.RESEND_FROM_EMAIL ||
  "Bounce FX <bookings@bouncefxpartyrentals.com>";
// Where customer replies land — the real, monitored business inbox (Google
// Workspace), so a reply to an automated email reaches Bounce FX.
const replyTo = process.env.REPLY_TO_EMAIL || "Info@bouncefxpartyrentals.com";

export const emailConfigured = Boolean(key);

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
}

export async function sendBookingConfirmation(b: BookingEmail) {
  if (!key) return { skipped: true };
  const resend = new Resend(key);
  const remaining = Math.round((b.total - b.deposit) * 100) / 100;

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
