import { NextResponse } from "next/server";
import { getProducts, getBundles } from "@/lib/catalog";
import { money } from "@/lib/format";
import { FREE_RADIUS_MILES, PER_MILE_RATE } from "@/lib/delivery";
import type { Product, Bundle } from "@/lib/types";

interface ChatLink {
  label: string;
  href: string;
}
interface ChatReply {
  reply: string;
  links?: ChatLink[];
  suggestions?: string[];
}

const DEFAULT_SUGGESTIONS = [
  "What do you rent?",
  "How much is a bounce house?",
  "Do you deliver to my area?",
  "I'm planning a party for 50 guests",
];

function parseGuests(text: string): number | null {
  const m = text.match(/(\d{1,4})\s*(guests?|people|kids|ppl|persons?)/i);
  if (m) return parseInt(m[1], 10);
  const m2 = text.match(/for\s+(\d{1,4})/i);
  if (m2) return parseInt(m2[1], 10);
  return null;
}

function recommend(
  guests: number,
  products: Product[],
  bundles: Bundle[]
): ChatReply {
  const tables = Math.ceil(guests / 8);
  const chairs = guests;
  const wantsTent = guests >= 30;
  const tier =
    guests >= 50 ? "gold" : guests >= 30 ? "silver" : "bronze";
  const bundle = bundles.find((b) => b.tier === tier) ?? bundles[0];
  const lines = [
    `For ${guests} guests, here's what I'd suggest:`,
    `• ${chairs} folding chairs`,
    `• ${tables} six-foot banquet tables`,
    wantsTent ? "• A 20x20 high-peak tent for shade" : "",
    guests >= 25 ? "• A bounce house or slide combo to headline it" : "",
  ].filter(Boolean);
  if (bundle) {
    lines.push(
      "",
      `The easiest way is our ${bundle.name} (${money(
        bundle.bundle_price
      )}) — it covers most of that in one package.`
    );
  }
  return {
    reply: lines.join("\n"),
    links: [
      { label: `View the ${bundle?.name ?? "bundles"}`, href: "/bundles" },
      { label: "Build your party", href: "/build" },
    ],
    suggestions: ["Do you deliver to my area?", "Check availability"],
  };
}

function answer(
  text: string,
  products: Product[],
  bundles: Bundle[]
): ChatReply {
  const t = text.toLowerCase().trim();

  // Greeting
  if (/^(hi|hey|hello|yo|sup|howdy|good (morning|afternoon|evening))\b/.test(t)) {
    return {
      reply:
        "Hey there! I'm the Bounce FX party planner. I can help you pick rentals, check delivery, or plan around your guest count. What are you celebrating?",
      suggestions: DEFAULT_SUGGESTIONS,
    };
  }

  // Guest-count recommendation
  const guests = parseGuests(t);
  if (
    guests &&
    /(guest|people|kid|party|plan|recommend|suggest|how many|need)/.test(t)
  ) {
    return recommend(guests, products, bundles);
  }
  if (/(recommend|suggest|what should|not sure|help me (pick|choose))/.test(t)) {
    return {
      reply:
        "Happy to help you pick! Roughly how many guests are you expecting, and what's the occasion (birthday, church, school, HOA)? I'll put together a setup.",
      suggestions: ["About 30 guests", "About 60 guests", "It's a birthday"],
    };
  }

  // Delivery
  if (/(deliver|delivery|far|distance|zip|mile|fee|come to|drive|travel)/.test(t)) {
    return {
      reply: `We deliver, set up, and pick up everywhere in the Fredericksburg + DMV area. It's FREE within ${FREE_RADIUS_MILES} miles of 22401, then just $${PER_MILE_RATE.toFixed(
        2
      )}/mile beyond that. Want to check your exact address?`,
      links: [{ label: "Open the delivery map", href: "/#" }],
      suggestions: ["Check availability", "How much is a bounce house?"],
    };
  }

  // Pricing
  if (/(price|cost|how much|rate|\$|cheap|expensive)/.test(t)) {
    const top = products
      .slice()
      .sort((a, b) => b.price_per_day - a.price_per_day)
      .slice(0, 6)
      .map((p) => `• ${p.name} — ${money(p.price_per_day)}/day`)
      .join("\n");
    return {
      reply: `Here's our day rates:\n${top}\n\nBundles save you more — and a flat $50 deposit holds your date.`,
      links: [
        { label: "Shop all rentals", href: "/shop" },
        { label: "See bundles", href: "/bundles" },
      ],
    };
  }

  // Availability / booking
  if (/(avail|book|reserve|date|open|free on|calendar|schedule)/.test(t)) {
    return {
      reply:
        "You can see exactly what's open on any date with our live availability calendar — green days are wide open. Pick your date and book in a couple of clicks!",
      links: [{ label: "Check availability", href: "/availability" }],
      suggestions: ["I'm planning for 40 guests", "Do you deliver?"],
    };
  }

  // Specific products
  if (/(water slide|slide|wet)/.test(t)) {
    return product(products, "slide", "We've got dual-lane slide combos and water-slide combos — racing lanes, climb walls, the works.");
  }
  if (/(dome|grand|biggest|large|big)/.test(t)) {
    return product(products, "dome", "The Grand Party Dome is our biggest — a 20x20 bounce dome perfect for schools, churches, and big crowds.");
  }
  if (/(bounce|inflatable|castle|jump)/.test(t)) {
    return product(products, "combo", "Our inflatables include the Dual Lane Slide Combo, the Purplish Combo Playhouse, and the Grand Party Dome.");
  }
  if (/(tent|shade|canopy|rain|cover)/.test(t)) {
    return product(products, "tent", "Our 20x20 Premium High Peak Tent keeps the party going rain or shine.");
  }
  if (/(table|chair|seating|seat)/.test(t)) {
    return {
      reply:
        "We've got 6ft heavy-duty banquet tables ($8/day) and white folding chairs ($2.00/day). A good rule: one table per 8 guests, one chair per guest.",
      links: [{ label: "Shop tables & chairs", href: "/shop" }],
    };
  }

  // Contact / hours
  if (/(contact|phone|call|text|email|reach|hours|talk|human|number)/.test(t)) {
    return {
      reply:
        "You can reach us anytime:\n• Call/text: 571-494-3903 or 571-264-9996\n• Email: Info@bouncefxpartyrentals.com\nWe usually reply within 24 hours.",
      links: [{ label: "Contact page", href: "/contact" }],
    };
  }

  // Military discount
  if (/(military|veteran|discount|deal|coupon|promo)/.test(t)) {
    return {
      reply:
        "Yes! We offer military discounts — just mention it when you reach out and we'll take care of you.",
      links: [{ label: "Ask about discounts", href: "/contact" }],
    };
  }

  // What do you do / rent
  if (/(what do you|rent|offer|services|catalog|products|have)/.test(t)) {
    return {
      reply:
        "We rent inflatables (bounce houses & slides), 20x20 tents, banquet tables, and folding chairs — delivered and set up for you across Fredericksburg & the DMV. Want a recommendation for your guest count?",
      links: [{ label: "Browse rentals", href: "/shop" }],
      suggestions: ["I'm planning for 50 guests", "How much for a bounce house?"],
    };
  }

  // Thanks / bye
  if (/(thank|thanks|appreciate|great|awesome|cool|bye)/.test(t)) {
    return {
      reply:
        "Anytime! Whenever you're ready, you can book your date online — and we'll handle the rest. Party on!",
      links: [{ label: "Book now", href: "/availability" }],
    };
  }

  // Fallback
  return {
    reply:
      "Great question! I can help with rentals, pricing, delivery, and planning for your guest count. For anything specific, the team is one text away at 571-494-3903.",
    suggestions: DEFAULT_SUGGESTIONS,
  };
}

function product(products: Product[], key: string, blurb: string): ChatReply {
  const match =
    products.find((p) => p.name.toLowerCase().includes(key)) ??
    products.find((p) => p.category === "inflatable");
  return {
    reply: match
      ? `${blurb}\n\n${match.name} runs ${money(match.price_per_day)}/day.`
      : blurb,
    links: match
      ? [
          { label: `Book the ${match.name}`, href: `/book?product=${match.id}` },
          { label: "Check availability", href: "/availability" },
        ]
      : [{ label: "Browse rentals", href: "/shop" }],
  };
}

export async function POST(req: Request) {
  try {
    const { message } = await req.json();
    if (!message || typeof message !== "string") {
      return NextResponse.json({ error: "message required" }, { status: 400 });
    }
    const [products, bundles] = await Promise.all([
      getProducts(),
      getBundles(),
    ]);
    const result = answer(message, products, bundles);
    return NextResponse.json(result);
  } catch {
    return NextResponse.json(
      {
        reply:
          "Sorry, I hit a snag! You can always reach the team at 571-494-3903.",
      },
      { status: 200 }
    );
  }
}
