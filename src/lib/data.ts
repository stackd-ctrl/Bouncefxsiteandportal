import type { Product, Bundle } from "./types";

/**
 * Static fallback catalog.
 *
 * These mirror the rows seeded into Supabase (`supabase/seed.ts`) and use the
 * same fixed UUIDs, so the site renders identically whether or not Supabase
 * credentials are present. Once Supabase is connected, live data takes over.
 *
 * Image URLs are placeholders (Unsplash). Swap `image_url` for the real
 * Squarespace product photos when available.
 */
export const PRODUCTS: Product[] = [
  {
    id: "11111111-1111-4111-8111-111111111111",
    name: "Dual Lane Slide Combo",
    description:
      "Race a friend to the bottom! This double-lane inflatable slide combo packs a bounce area, climb wall, and two slick racing lanes into one showstopper. The crowd favorite at any backyard bash.",
    price_per_day: 275,
    category: "inflatable",
    image_url:
      "/products/dual-lane.png",
    is_available: true,
  },
  {
    id: "22222222-2222-4222-8222-222222222222",
    name: "Purplish Dual Lane Combo Playhouse",
    description:
      "A vibrant purple combo unit with a roomy bounce house, basketball hoop, climb-and-slide, and pop-out obstacles. Endless fun for birthdays and block parties.",
    price_per_day: 275,
    category: "inflatable",
    image_url:
      "/products/purplish.png",
    is_available: true,
  },
  {
    id: "33333333-3333-4333-8333-333333333333",
    name: "Grand Party Dome 20x20 Bounce House",
    description:
      "Our biggest bounce yet — a massive 20x20 dome with soaring ceilings and space for the whole crew. Perfect for schools, churches, and large-scale community events.",
    price_per_day: 275,
    category: "inflatable",
    image_url:
      "/products/grand-dome.png",
    is_available: true,
  },
  {
    id: "44444444-4444-4444-8444-444444444444",
    name: "6FT Heavy Duty Folding Banquet Table",
    description:
      "Commercial-grade 6ft folding banquet table with a tough blow-molded top and locking steel legs. Seats up to 8 — the workhorse of any spread.",
    price_per_day: 8,
    category: "table",
    image_url:
      "/products/table.png",
    is_available: true,
  },
  {
    id: "55555555-5555-4555-8555-555555555555",
    name: "20x20 Premium High Peak Party Tent",
    description:
      "A stunning 20x20 high-peak frame tent that keeps the party going rain or shine. Elegant sweeping lines, sturdy frame, and shade for roughly 40 seated guests.",
    price_per_day: 300,
    category: "tent",
    image_url:
      "/products/tent.png",
    is_available: true,
  },
  {
    id: "66666666-6666-4666-8666-666666666666",
    name: "White Folding Chair Heavy Duty",
    description:
      "Clean white heavy-duty folding chairs rated for everyday event use. Comfortable, stackable, and crisp — order as many as you need.",
    price_per_day: 2.5,
    category: "chair",
    image_url:
      "/products/chair.png",
    is_available: true,
  },
];

// Inventory counts + footprints (feet) — powers quantity-aware availability and
// the space/fit checker. Kept here so the static catalog mirrors Supabase.
const PRODUCT_META: Record<
  string,
  { quantity: number; footprint: [number, number] }
> = {
  "11111111-1111-4111-8111-111111111111": { quantity: 2, footprint: [25, 18] },
  "22222222-2222-4222-8222-222222222222": { quantity: 1, footprint: [25, 18] },
  "33333333-3333-4333-8333-333333333333": { quantity: 1, footprint: [22, 22] },
  "44444444-4444-4444-8444-444444444444": { quantity: 40, footprint: [6, 2.5] },
  "55555555-5555-4555-8555-555555555555": { quantity: 4, footprint: [22, 22] },
  "66666666-6666-4666-8666-666666666666": { quantity: 200, footprint: [1.5, 1.5] },
};
PRODUCTS.forEach((p) => {
  const m = PRODUCT_META[p.id];
  if (m) {
    p.quantity = m.quantity;
    p.footprint = m.footprint;
  }
});

export const BUNDLES: Bundle[] = [
  {
    id: "b1111111-1111-4111-8111-111111111111",
    name: "Bronze Bundle",
    tier: "bronze",
    description:
      "The essentials done right. Seating and tables for an intimate gathering of up to 50 guests — just add cake.",
    product_ids: [
      "44444444-4444-4444-8444-444444444444",
      "66666666-6666-4666-8666-666666666666",
    ],
    bundle_price: 175,
    individual_value: 215,
    highlights: [
      "50 white heavy-duty folding chairs",
      "8 six-foot banquet tables",
      "Delivery, setup & pickup included",
      "Seats up to 50 guests",
    ],
  },
  {
    id: "b2222222-2222-4222-8222-222222222222",
    name: "Silver Bundle",
    tier: "silver",
    description:
      "Shade and seating for the full crew. Add our premium high-peak tent to the seating package and keep the party comfortable all day.",
    product_ids: [
      "44444444-4444-4444-8444-444444444444",
      "66666666-6666-4666-8666-666666666666",
      "55555555-5555-4555-8555-555555555555",
    ],
    bundle_price: 425,
    individual_value: 515,
    highlights: [
      "Everything in Bronze",
      "20x20 premium high-peak party tent",
      "Rain-or-shine coverage",
      "Seats up to 60 guests",
    ],
  },
  {
    id: "b3333333-3333-4333-8333-333333333333",
    name: "Gold Bundle",
    tier: "gold",
    description:
      "The full Bounce FX experience. Seating, tables, a tent, AND a headline bounce house — everything you need for an unforgettable event.",
    product_ids: [
      "44444444-4444-4444-8444-444444444444",
      "66666666-6666-4666-8666-666666666666",
      "55555555-5555-4555-8555-555555555555",
      "33333333-3333-4333-8333-333333333333",
    ],
    bundle_price: 675,
    individual_value: 790,
    highlights: [
      "Everything in Silver",
      "Grand Party Dome 20x20 bounce house",
      "The total all-in-one party setup",
      "Built for big celebrations",
    ],
  },
];

export const TESTIMONIALS = [
  {
    name: "Maya R.",
    role: "Birthday party · Stafford, VA",
    quote:
      "The dual lane slide was the hit of my son's party — kids didn't stop for three hours straight! Setup was fast and the team was so friendly.",
    color: "party.red",
  },
  {
    name: "Pastor James W.",
    role: "Church fall festival · Fredericksburg",
    quote:
      "We rented the big dome and two tents for our festival. On time, spotless, and stress-free from start to finish. We'll be back every year.",
    color: "party.blue",
  },
  {
    name: "Danielle K.",
    role: "Corporate family day · Spotsylvania",
    quote:
      "Booking online with the deposit was so easy, and the delivery calculator told us the cost up front. Professional, fun, and zero surprises.",
    color: "party.green",
  },
];

// Real Bounce FX event photos first, then a couple of relevant party scenes.
export const GALLERY = [
  "/hero-grand-dome.png",
  "/events/combo-outdoor.png",
  "/events/slide-interior.png",
  "/events/extra-large.png",
  "/events/basketball.png",
  "https://images.unsplash.com/photo-1530103862676-de8c9debad1d?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1464047736614-af63643285bf?auto=format&fit=crop&w=900&q=80",
];

export const CATEGORIES: { key: string; label: string; emoji: string }[] = [
  { key: "all", label: "All Rentals", emoji: "🎉" },
  { key: "inflatable", label: "Inflatables", emoji: "🏰" },
  { key: "table", label: "Tables", emoji: "🪑" },
  { key: "chair", label: "Chairs", emoji: "💺" },
  { key: "tent", label: "Tents", emoji: "⛺" },
  { key: "bundle", label: "Bundles", emoji: "🎁" },
];

export const REVIEWS = [
  {
    id: "r1",
    name: "Maya R.",
    rating: 5,
    text: "The dual lane slide was the hit of my son's party — kids didn't stop for three hours straight! Setup was fast and the team was so friendly.",
    event_type: "Birthday",
    city: "Stafford, VA",
    date: "2026-05-18",
  },
  {
    id: "r2",
    name: "Pastor James W.",
    rating: 5,
    text: "We rented the Grand Dome and two tents for our fall festival. On time, spotless, and stress-free from start to finish. We'll be back every year.",
    event_type: "Church",
    city: "Fredericksburg, VA",
    date: "2026-05-02",
  },
  {
    id: "r3",
    name: "Danielle K.",
    rating: 5,
    text: "Booking online with the deposit was so easy, and the delivery calculator told us the cost up front. Professional, fun, and zero surprises.",
    event_type: "Corporate",
    city: "Spotsylvania, VA",
    date: "2026-04-21",
  },
  {
    id: "r4",
    name: "Tonya B.",
    rating: 5,
    text: "Our HOA block party was a blast. The chairs and tables showed up clean and early, and pickup was just as smooth. Highly recommend!",
    event_type: "Community",
    city: "Woodbridge, VA",
    date: "2026-04-09",
  },
  {
    id: "r5",
    name: "Marcus & Lena",
    rating: 5,
    text: "Purplish combo was gorgeous and the kids loved the water slide. Communication was great the whole way. Worth every penny.",
    event_type: "Birthday",
    city: "King George, VA",
    date: "2026-03-30",
  },
  {
    id: "r6",
    name: "Coach Rivera",
    rating: 5,
    text: "Used Bounce FX for our school field day — they handled a big setup like pros and the kids had the best day. Booking again next year.",
    event_type: "School",
    city: "Fredericksburg, VA",
    date: "2026-03-15",
  },
];

export function getProductById(id: string): Product | undefined {
  return PRODUCTS.find((p) => p.id === id);
}

export function getBundleById(id: string): Bundle | undefined {
  return BUNDLES.find((b) => b.id === id);
}
