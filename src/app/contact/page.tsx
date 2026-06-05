import type { Metadata } from "next";
import ContactForm from "@/components/ContactForm";
import { getSiteInfo } from "@/lib/content";

export const metadata: Metadata = {
  title: "Contact Us",
  description:
    "Get in touch with Bounce FX Party Rentals. Email Info@bouncefxpartyrentals.com or send us a message — we respond within 24 hours.",
};

export default async function ContactPage() {
  const site = await getSiteInfo();
  const EMAIL = site.email;
  const PHONES = site.phones;
  const IG = site.instagram;
  const FB = site.facebook;
  return (
    <section className="bg-party-red text-white">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 md:py-24">
        <p className="eyebrow text-white/80">Please contact for availability</p>
        <div className="mt-6 grid gap-12 lg:grid-cols-[1fr_1.1fr]">
          {/* Left — pitch + info */}
          <div>
            <h1 className="font-display text-6xl font-bold italic leading-[0.95] sm:text-7xl">
              Let's Get This
              <br />
              Party Started!
            </h1>
            <p className="mt-6 max-w-md text-lg text-white/90">
              Fill out the quick form, share your celebration dreams, and we'll
              whip up fun ideas that make your event a total yay!
            </p>
            <p className="mt-4 font-display text-lg font-semibold italic text-party-yellow">
              Ask about our military discounts.
            </p>

            <div className="mt-8 space-y-1">
              <p className="font-display text-lg font-semibold italic">
                Call or text
              </p>
              <div className="flex flex-wrap gap-x-6">
                {PHONES.map((p) => (
                  <a
                    key={p}
                    href={`tel:${p.replace(/-/g, "")}`}
                    className="font-display text-2xl font-bold italic underline decoration-2 underline-offset-4"
                  >
                    {p}
                  </a>
                ))}
              </div>
            </div>

            <div className="mt-6 space-y-1">
              <p className="font-display text-lg font-semibold italic">
                Email us
              </p>
              <a
                href={`mailto:${EMAIL}`}
                className="text-white underline decoration-2 underline-offset-4"
              >
                {EMAIL}
              </a>
            </div>

            <div className="mt-6 space-y-1">
              <p className="font-display text-lg font-semibold italic">
                Delivery
              </p>
              <p className="text-white/90">
                Free within 15 miles of Fredericksburg 22401 · $2/mile beyond.
              </p>
            </div>

            <div className="mt-6">
              <p className="font-display text-lg font-semibold italic">
                Follow along
              </p>
              <div className="mt-2 flex gap-3">
                <a
                  href={IG}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-full border-2 border-white px-5 py-2 text-sm font-semibold transition-colors hover:bg-white hover:text-party-red"
                >
                  Instagram
                </a>
                <a
                  href={FB}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-full border-2 border-white px-5 py-2 text-sm font-semibold transition-colors hover:bg-white hover:text-party-red"
                >
                  Facebook
                </a>
              </div>
              <p className="mt-3 text-sm text-white/70">
                We typically respond within 24 hours.
              </p>
            </div>
          </div>

          {/* Right — form */}
          <div>
            <ContactForm />
          </div>
        </div>
      </div>

      {/* Banner beneath the form */}
      <div className="bg-party-yellow text-party-ink">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
          <div className="grid items-center gap-8 lg:grid-cols-[1.3fr_1fr]">
            <div>
              <h2 className="font-display text-3xl font-bold italic leading-tight sm:text-4xl">
                Prefer to plan it together? We've got you.
              </h2>
              <p className="mt-3 max-w-xl text-party-ink/70">
                Tell us your date and we'll handle delivery, setup, and pickup —
                so all you have to do is show up and celebrate.
              </p>
            </div>
            <div className="grid grid-cols-3 gap-4 text-center">
              {[
                ["24 hrs", "Avg. reply time"],
                ["Free", "Local delivery"],
                ["Included", "Setup & pickup"],
              ].map(([big, small]) => (
                <div
                  key={small}
                  className="rounded-xl border border-party-ink/15 bg-white/60 px-3 py-5"
                >
                  <div className="font-display text-2xl font-bold italic text-party-red sm:text-3xl">
                    {big}
                  </div>
                  <div className="mt-1 text-xs font-semibold uppercase tracking-wider text-party-ink/60">
                    {small}
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="mt-8 flex flex-wrap gap-3">
            <a href="/availability" className="btn-red">
              Check Availability
            </a>
            <a href="/shop" className="btn-outline">
              Browse Rentals
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
