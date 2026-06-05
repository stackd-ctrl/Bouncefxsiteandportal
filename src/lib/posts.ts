export interface Block {
  h?: string;
  p?: string;
  ul?: string[];
}

export interface Post {
  slug: string;
  title: string;
  excerpt: string;
  date: string;
  readMins: number;
  category: string;
  body: Block[];
}

export const POSTS: Post[] = [
  {
    slug: "how-many-tables-and-chairs",
    title: "How Many Tables & Chairs Do I Need for My Party?",
    excerpt:
      "A simple guide to sizing your seating so every guest has a spot — without over-renting.",
    date: "2026-05-28",
    readMins: 3,
    category: "Planning",
    body: [
      {
        p: "One of the most common questions we get is how much seating to rent. Here's the quick math we use for every event.",
      },
      { h: "Chairs" },
      {
        p: "Plan for one chair per guest, then add about 10% extra for late additions and kids who want their own seat. For a 50-guest party, that's roughly 55 chairs.",
      },
      { h: "Tables" },
      {
        p: "Our 6ft banquet tables comfortably seat 8 guests each. Divide your headcount by 8 and round up:",
      },
      {
        ul: [
          "25 guests → 3–4 tables",
          "50 guests → 6–7 tables",
          "100 guests → 12–13 tables",
        ],
      },
      {
        p: "Don't forget extra tables for food, gifts, and a cake station — usually 2–3 more depending on your spread.",
      },
      {
        p: "Not sure? Our Build Your Party tool does the math for you and gives a live estimate in seconds.",
      },
    ],
  },
  {
    slug: "bounce-house-safety",
    title: "Bounce House Safety: What Every Parent Should Know",
    excerpt:
      "Keep the fun rolling and the kids safe with these simple supervision and setup rules.",
    date: "2026-05-14",
    readMins: 4,
    category: "Safety",
    body: [
      {
        p: "Inflatables are a blast, but a few simple rules keep everyone safe all day long.",
      },
      { h: "Always have adult supervision" },
      {
        p: "An adult should watch the inflatable any time kids are inside — no exceptions. We recommend grouping kids by similar size and limiting the number jumping at once.",
      },
      { h: "Watch the weather" },
      {
        p: "Inflatables should be evacuated in winds of 15+ mph or during storms. We monitor the forecast for your event date and will reach out if conditions look risky.",
      },
      { h: "Quick ground rules" },
      {
        ul: [
          "No shoes, glasses, or sharp objects inside",
          "No food, drinks, or gum while jumping",
          "No flips or rough play",
          "Keep the entrance clear for safe exits",
        ],
      },
      {
        p: "Every Bounce FX unit is cleaned, inspected, and properly anchored on delivery — and we're fully licensed and insured for your peace of mind.",
      },
    ],
  },
  {
    slug: "backyard-birthday-tips",
    title: "5 Tips for an Unforgettable Backyard Birthday",
    excerpt:
      "Little touches that turn a backyard party into the one everyone remembers.",
    date: "2026-04-30",
    readMins: 3,
    category: "Ideas",
    body: [
      { p: "You don't need a big venue to throw a big party. Here's how to make your backyard the place to be." },
      { h: "1. Anchor it with a showpiece" },
      { p: "A bounce house or slide combo instantly becomes the centerpiece — and keeps kids happily busy for hours." },
      { h: "2. Add shade" },
      { p: "A high-peak tent keeps food cool and guests comfortable, rain or shine. It's the upgrade people always thank you for." },
      { h: "3. Create zones" },
      { p: "Group seating, food, and play into separate areas so the space flows and parents can relax while kids play." },
      { h: "4. Book early" },
      { p: "Spring and summer weekends fill up fast. Lock in your date with a quick 50% deposit." },
      { h: "5. Let us handle setup" },
      { p: "Delivery, setup, and pickup are always included — so you can actually enjoy the party you're hosting." },
    ],
  },
  {
    slug: "church-and-hoa-events",
    title: "Planning a Church or HOA Event Around Fredericksburg",
    excerpt:
      "Throwing a festival, block party, or community day? Here's how to pull it off smoothly.",
    date: "2026-04-12",
    readMins: 4,
    category: "Community",
    body: [
      { p: "Large community events have a few extra moving parts. We've helped dozens of churches, schools, and HOAs across the DMV — here's our playbook." },
      { h: "Go big with the Grand Dome" },
      { p: "Our 20x20 Grand Party Dome handles big crowds and is a magnet for kids of all ages — perfect for festivals and field days." },
      { h: "Plan seating in blocks" },
      { p: "For 100+ guests, think in zones: tables and chairs near food, open space near the inflatables. We'll help you map quantities." },
      { h: "Lock the date early" },
      { p: "Community events often land on the busiest weekends. Reserve well ahead, and ask us about discounts for large bookings and military families." },
      { p: "Tell us your headcount and we'll build a setup that fits your crowd and your budget." },
    ],
  },
];

export function getPost(slug: string): Post | undefined {
  return POSTS.find((p) => p.slug === slug);
}
