import { NextResponse } from "next/server";
import { getDeliveryQuote } from "@/lib/delivery";

export async function POST(req: Request) {
  try {
    const { destination } = await req.json();
    if (!destination || typeof destination !== "string") {
      return NextResponse.json(
        { error: "destination is required" },
        { status: 400 }
      );
    }
    const quote = await getDeliveryQuote(destination);
    return NextResponse.json(quote);
  } catch {
    return NextResponse.json(
      { error: "Could not calculate delivery" },
      { status: 500 }
    );
  }
}
