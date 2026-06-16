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
    "Save with Bounce FX bundle packages — Bronze, Silver and Gold tiers combining chairs, tables, tents and bounce houses.",
};

type Cell = string | boolean;

const COMPARISON: { label: string; rows: [string, Cell, Cell, Cell][] } = {
  label: "Compare every package",
  rows: [
    ["White folding chairs", "50", "50", "50"],
    ["6ft banquet tables", "8", "8", "8"],
    ["20x20 high-peak tent", false, "1", "1"],
    ["Grand Party Dome bounce house", false, false, "1"],
    ["Guest capacity", "Up to 50", "Up to 60", "60+ / big events"],
    ["Delivery & setup", true, true, true],
    ["Pickup & teardown", true, true, true],
    ["Rain-or-shine coverage", false, true, true],
    ["Best for", "Backyard birthdays", "All-day gatherings", "The full celebration"],
  ],
};

const PRICING: [string, number, number][] = [
  // [tier label, individualValue, bundlePrice]
  ["Bronze", 215, 175],
  ["Silver", 515, 425],
  ["Gold", 790, 675],
];

const ADDONS = [
  ["Extra chairs", "Add seating by the dozen", "$2.50 / day ea."],
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
            <h2 className="section-title mt-3">{COMPARISON.label}</h2>
            <p className="mt-4 text-lg text-party-ink/65">
              Every bundle includes delivery, setup, and pickup. Here's exactly
              what comes with each tier.
            </p>
          </div>

          <div className="reveal mt-10 overflow-x-auto">
            <table className="w-full min-w-[640px] border-collapse">
              <thead>
                <tr>
                  <th className="w-[34%] p-0 text-left" />
                  {["Bronze", "Silver", "Gold"].map((t) => (
                    <th
                      key={t}
                      className={`rounded-t-xl px-4 py-4 text-center font-display text-2xl font-bold italic ${
                        t === "Silver"
                          ? "bg-party-red text-white"
                          : "bg-party-cream text-party-ink"
                      }`}
                    >
                      {t}
                      {t === "Silver" && (
                        <span className="mt-1 block text-xs font-semibold uppercase not-italic tracking-wider text-white/80">
                          Most popular
                        </span>
                      )}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {COMPARISON.rows.map(([label, a, b, c], i) => (
                  <tr
                    key={i}
                    className="border-b border-party-ink/10 align-middle"
                  >
                    <td className="py-4 pr-4 font-display text-base font-semibold italic">
                      {label}
                    </td>
                    <td className="px-4 py-4 text-center text-sm">
                      <CellValue value={a} />
                    </td>
                    <td className="bg-party-red/5 px-4 py-4 text-center text-sm">
                      <CellValue value={b} />
                    </td>
                    <td className="px-4 py-4 text-center text-sm">
                      <CellValue value={c} />
                    </td>
                  </tr>
                ))}

                {/* Pricing rows */}
                <tr className="border-b border-party-ink/10">
                  <td className="py-4 pr-4 font-display text-base font-semibold italic">
                    Individual value
                  </td>
                  {PRICING.map(([t, val]) => (
                    <td
                      key={t}
                      className={`px-4 py-4 text-center text-sm text-party-ink/50 line-through ${
                        t === "Silver" ? "bg-party-red/5" : ""
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
                  {PRICING.map(([t, val, price]) => (
                    <td
                      key={t}
                      className={`px-4 py-4 text-center text-sm font-bold text-party-green ${
                        t === "Silver" ? "bg-party-red/5" : ""
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
                  {PRICING.map(([t, , price]) => (
                    <td
                      key={t}
                      className={`px-4 py-5 text-center ${
                        t === "Silver" ? "rounded-b-xl bg-party-red/5" : ""
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
                  {bundles
                    .slice()
                    .sort((x, y) => x.bundle_price - y.bundle_price)
                    .map((b) => (
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
