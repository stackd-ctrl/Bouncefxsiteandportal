import { NextResponse } from "next/server";
import { sendContactMessage } from "@/lib/email";
import { addLeadFromContact } from "@/lib/content";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, message } = body;
    if (!name || !email || !message) {
      return NextResponse.json(
        { error: "Name, email and message are required." },
        { status: 400 }
      );
    }
    await sendContactMessage({
      name,
      email,
      phone: body.phone,
      eventDate: body.eventDate,
      message,
    });
    // Also capture the inquiry as a CRM lead so it shows up in Customers.
    await addLeadFromContact({ name, email, phone: body.phone, message });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { error: "Something went wrong." },
      { status: 500 }
    );
  }
}
