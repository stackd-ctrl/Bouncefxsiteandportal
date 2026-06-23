import type { Metadata } from "next";
import Link from "next/link";
import { getBundles } from "@/lib/catalog";
import { getPages } from "@/lib/content";
import BundleCard from "@/components/BundleCard";
import PageHeader from "@/components/PageHeader";
import DeliveryCalculator from "@/components/DeliveryCalculator";
import { money } from "@/lib/format";

export const metadata: Metadata = {
  title: "Bundle Packages",
  description:
    "Save with Bounce FX bundle packages — Small, Medium, Large and our Tent Bundle Deal, combining bounce houses, tables, chairs and tents.",
};

type Cell = string | boolean;

// Columns are in the same order as the BUNDLES catalog: Small, Medium, Large, Tent.
const COLUMNS = ["Small", "Medium", "Large", "Tent Deal"];
const FEATURED_COL = 1; // Medium = most popular

const COMPARISON_LABEL = "Compare every package";
const COMPARISON_ROWS: { label: string; cells: Cell[] }[] = [
  { label: "Bounce house", cells: ["1", "1", "1", false] },
  { label: "20x20 high-peak tent", cells: [false, false, false, "1"] },
  { label: "6ft banquet tables", cells: ["2", "4", "6", "5"] },
  { label: "White folding chairs", cells: ["16", "32", "48", "40"] },
  { label: "Seats up to", cells: ["16 guests", "32 guests", "48 guests", "40 guests"] },
  { label: "Delivery & setup", cells: [true, true, true, true] },
  { label: "Pickup & teardown", cells: [true, true, true, true] },
];

// [individualValue, bundlePrice] per column, same order as COLUMNS.
const PRICING: [number, number][] = [
  [323, 315],
  [371, 365],
  [419, 415],
  [420, 350],
];

const ADDONS = [
  ["Extra chairs", "Add seating by the dozen", "$2.00 / day ea."],
  ["Extra tables", "More room for food & gifts", "$8 / day ea."],
  ["Additional tent", "Double your covered space", "$300 / day"],
  ["Swap the bounce house", "Pick any inflatable in our lineup", "From $275 / day"],
];

function CellValue({ value }: { value: Cell }) {
  if (value === true)
    return <span className="font-bold text-party-green">Included</span>;
  if (value === false)
    return <span className="text-party-ink/25">—</span>;
  return <span className="font-semibold">{value}</span>;
}

export default async function BundlesPage() {
  const [bundles, c] = await Promise.all([
    getBundles(),
    getPages().then((p) => p.bundles),
  ]);

  return (
    <>
      <PageHeader
        eyebrow={c.headerEyebrow}
        title={c.headerTitle}
        subtitle={c.headerSubtitle}
        color="bg-party-yellow"
        text="text-party-ink"
      />

      {/* Bundle cards */}
      <section className="bg-party-cream">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 md:py-20">
          <div className="grid gap-7 lg:grid-cols-3">
            {bundles.map((b) => (
              <div key={b.id} className="reveal">
                <BundleCard bundle={b} featured={b.tier === "silver"} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Detailed comparison */}
      <section className="bg-white">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 md:py-20">
          <div className="reveal max-w-2xl">
            <p className="eyebrow text-party-red">Side by side</p>
            <h2 className="section-title mt-3">{COMPARISON_LABEL}</h2>
            <p className="mt-4 text-lg text-party-ink/65">
              Every bundle includes delivery, setup, and pickup. Here's exactly
              what comes with each tier.
            </p>
          </div>

          <div className="reveal mt-10 overflow-x-auto">
            <table className="w-full min-w-[760px] border-collapse">
              <thead>
                <tr>
                  <th className="w-[28%] p-0 text-left" />
                  {COLUMNS.map((t, i) => (
                    <th
                      key={t}
                      className={`rounded-t-xl px-4 py-4 text-center font-display text-xl font-bold italic ${
                        i === FEATURED_COL
                          ? "bg-party-red text-white"
                          : "bg-party-cream text-party-ink"
                      }`}
                    >
                      {t}
                      {i === FEATURED_COL && (
                        <span className="mt-1 block text-xs font-semibold uppercase not-italic tracking-wider text-white/80">
                          Most popular
                        </span>
                      )}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {COMPARISON_ROWS.map((row, i) => (
                  <tr
                    key={i}
                    className="border-b border-party-ink/10 align-middle"
                  >
                    <td className="py-4 pr-4 font-display text-base font-semibold italic">
                      {row.label}
                    </td>
                    {row.cells.map((cell, c) => (
                      <td
                        key={c}
                        className={`px-4 py-4 text-center text-sm ${
                          c === FEATURED_COL ? "bg-party-red/5" : ""
                        }`}
                      >
                        <CellValue value={cell} />
                      </td>
                    ))}
                  </tr>
                ))}

                {/* Pricing rows */}
                <tr className="border-b border-party-ink/10">
                  <td className="py-4 pr-4 font-display text-base font-semibold italic">
                    Individual value
                  </td>
                  {PRICING.map(([val], i) => (
                    <td
                      key={i}
                      className={`px-4 py-4 text-center text-sm text-party-ink/50 line-through ${
                        i === FEATURED_COL ? "bg-party-red/5" : ""
                      }`}
                    >
                      {money(val)}
                    </td>
                  ))}
                </tr>
                <tr className="border-b border-party-ink/10">
                  <td className="py-4 pr-4 font-display text-base font-semibold italic">
                    You save
                  </td>
                  {PRICING.map(([val, price], i) => (
                    <td
                      key={i}
                      className={`px-4 py-4 text-center text-sm font-bold text-party-green ${
                        i === FEATURED_COL ? "bg-party-red/5" : ""
                      }`}
                    >
                      {money(val - price)}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="py-5 pr-4 font-display text-lg font-bold italic">
                    Bundle price
                  </td>
                  {PRICING.map(([, price], i) => (
                    <td
                      key={i}
                      className={`px-4 py-5 text-center ${
                        i === FEATURED_COL ? "rounded-b-xl bg-party-red/5" : ""
                      }`}
                    >
                      <div className="font-display text-2xl font-bold italic">
                        {money(price)}
                      </div>
                    </td>
                  ))}
                </tr>
                <tr>
                  <td />
                  {bundles.map((b) => (
                    <td key={b.id} className="px-4 pt-4 text-center">
                      <Link
                        href={`/book?bundle=${b.id}`}
                        className="btn-red btn-pill !px-5 !py-2.5 !text-sm"
                      >
                        Book {b.name?.split(" ")[0]}
                      </Link>
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Add-ons */}
      <section className="bg-party-yellow text-party-ink">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 md:py-20">
          <div className="reveal max-w-2xl">
            <p className="eyebrow text-party-red">Make it yours</p>
            <h2 className="section-title mt-3">Add-ons & extras</h2>
            <p className="mt-4 text-lg text-party-ink/70">
              Start with a bundle, then build it out. Mix and match to fit your
              guest list and your space.
            </p>
          </div>
          <div className="mt-10 grid gap-x-12 gap-y-1 md:grid-cols-2">
            {ADDONS.map(([t, d, price]) => (
              <div
                key={t}
                className="reveal flex items-center justify-between gap-4 border-b border-party-ink/25 py-5"
              >
                <div>
                  <p className="font-display text-xl font-bold italic">{t}</p>
                  <p className="text-sm text-party-ink/60">{d}</p>
                </div>
                <span className="shrink-0 font-display text-lg font-bold italic text-party-red">
                  {price}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="bg-party-cream">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 md:py-20">
          <div className="reveal max-w-2xl">
            <p className="eyebrow text-party-red">Good to know</p>
            <h2 className="section-title mt-3">Bundle FAQ</h2>
          </div>
          <div className="mt-10 grid gap-x-12 gap-y-8 md:grid-cols-2">
            {c.faq.map((f) => (
              <div key={f.title} className="reveal">
                <h3 className="font-display text-xl font-bold italic">
                  {f.title}
                </h3>
                <p className="mt-2 text-party-ink/70">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA + delivery */}
      <section className="bg-party-red text-white">
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 py-16 sm:px-6 md:py-20 lg:grid-cols-2">
          <div className="reveal">
            <p className="eyebrow text-white/80">Not sure what you need?</p>
            <h2 className="section-title mt-3">We'll help you pick.</h2>
            <p className="mt-4 max-w-md text-lg text-white/90">
              Tell us about your event and we'll recommend the perfect package —
              or build a custom one. Check your delivery rate while you're here.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link href="/contact" className="btn-yellow">
                Ask a Question
              </Link>
              <Link href="/availability" className="btn-white">
                Check Availability
              </Link>
            </div>
          </div>
          <div className="reveal">
            <DeliveryCalculator />
          </div>
        </div>
      </section>
    </>
  );
}
