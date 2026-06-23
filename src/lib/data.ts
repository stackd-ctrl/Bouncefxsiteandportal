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
    price_per_day: 2.0,
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

// Bundle contents & pricing supplied by the client (2026-06-22). `individual_value`
// is the true à-la-carte total of the included items at our per-day rates
// (bounce house $275, 6ft table $8, chair $2.00, 20x20 tent $300), so the
// "you save" figure on each card is real, not estimated.
const BOUNCE = "33333333-3333-4333-8333-333333333333";
const TABLE = "44444444-4444-4444-8444-444444444444";
const CHAIR = "66666666-6666-4666-8666-666666666666";
const TENT = "55555555-5555-4555-8555-555555555555";

export const BUNDLES: Bundle[] = [
  {
    id: "b1111111-1111-4111-8111-111111111111",
    name: "Small Party Package",
    tier: "bronze",
    description:
      "The perfect starter setup for an intimate backyard celebration — one bounce house plus seating for a small crew.",
    product_ids: [BOUNCE, TABLE, CHAIR],
    bundle_price: 315,
    individual_value: 323, // 275 + 2×8 + 16×2.00
    highlights: [
      "1 bounce house",
      "2 banquet tables",
      "16 folding chairs",
      "Delivery, setup & pickup included",
    ],
  },
  {
    id: "b2222222-2222-4222-8222-222222222222",
    name: "Medium Party Package",
    tier: "silver",
    description:
      "Our most popular package — a bounce house with double the seating for a full guest list.",
    product_ids: [BOUNCE, TABLE, CHAIR],
    bundle_price: 365,
    individual_value: 371, // 275 + 4×8 + 32×2.00
    highlights: [
      "1 bounce house",
      "4 banquet tables",
      "32 folding chairs",
      "Delivery, setup & pickup included",
    ],
  },
  {
    id: "b3333333-3333-4333-8333-333333333333",
    name: "Large Party Package",
    tier: "gold",
    description:
      "Go big. A bounce house plus seating for a large gathering — built for block parties and big celebrations.",
    product_ids: [BOUNCE, TABLE, CHAIR],
    bundle_price: 415,
    individual_value: 419, // 275 + 6×8 + 48×2.00
    highlights: [
      "1 bounce house",
      "6 banquet tables",
      "48 folding chairs",
      "Delivery, setup & pickup included",
    ],
  },
  {
    id: "b4444444-4444-4444-8444-444444444444",
    name: "Tent Bundle Deal",
    badge: "Highly Requested",
    description:
      "Shade-first setup. A 20x20 high-peak tent with tables and chairs to keep everyone comfortable rain or shine.",
    product_ids: [TENT, TABLE, CHAIR],
    bundle_price: 350,
    individual_value: 420, // 300 + 5×8 + 40×2.00
    highlights: [
      "20x20 high-peak party tent",
      "5 banquet tables",
      "40 folding chairs",
      "Delivery, setup & pickup included",
    ],
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

export type Review = {
  id: string;
  name: string;
  rating: number;
  text: string;
  /** Reviewer context as shown on Google, e.g. "Local Guide · 14 reviews". */
  meta?: string;
  date: string; // ISO
};

// Real Google reviews (5.0 ★ from 4 reviews) from the Bounce FX Google Business
// profile, captured 2026-06-22. To add a new one, copy the reviewer's name,
// star count, text and date here.
export const REVIEWS: Review[] = [
  {
    id: "g-kmos",
    name: "K Mos",
    rating: 5,
    text: "10/10 would recommend! Professional, reasonably priced and on-time services. The customer service was phenomenal! I was hesitant and didn't know what I wanted, and he was so patient with me. I will definitely not hesitate to use them for all of my family's needs.",
    meta: "4 reviews · Google",
    date: "2026-06-18",
  },
  {
    id: "g-anne-ashley",
    name: "Anne Ashley",
    rating: 5,
    text: "I had the opportunity to use Bounce FX Party Rentals for my son's birthday celebration and I was so impressed! The team was so professional! My son and his friends had a wonderful time. I would utilize their services again!",
    meta: "3 reviews · Google",
    date: "2026-06-18",
  },
  {
    id: "g-full-life-journey",
    name: "Full Life Journey",
    rating: 5,
    text: "The service was great. Easy to reserve. Delivery was on time. Bounce house was clean and in great shape. Pickup was done as scheduled and the area was left clean.",
    meta: "3 reviews · Google",
    date: "2026-06-18",
  },
  {
    id: "g-keshaun-clark",
    name: "Keshaun Clark",
    rating: 5,
    text: "I cannot say enough great things about this company!",
    meta: "Local Guide · 14 reviews · Google",
    date: "2026-06-18",
  },
];

// Link out to the Bounce FX Google reviews. TODO: swap for the exact Google Maps
// profile URL (or "write a review" deep link) once the client provides it.
export const GOOGLE_REVIEWS_URL =
  "https://www.google.com/search?q=Bounce+FX+Party+Rentals+Fredericksburg+VA+reviews";

export function getProductById(id: string): Product | undefined {
  return PRODUCTS.find((p) => p.id === id);
}

export function getBundleById(id: string): Bundle | undefined {
  return BUNDLES.find((b) => b.id === id);
}
