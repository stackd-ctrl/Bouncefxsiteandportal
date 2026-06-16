import type { Metadata } from "next";
import { REVIEWS } from "@/lib/data";
import { prettyDate } from "@/lib/format";
import { getPages } from "@/lib/content";
import PageHeader from "@/components/PageHeader";
import ReviewForm from "@/components/ReviewForm";
import InstagramStrip from "@/components/InstagramStrip";

export const metadata: Metadata = {
  title: "Reviews",
  description:
    "See what families across Fredericksburg and the DMV say about Bounce FX Party Rentals — and leave your own review.",
};

export default async function ReviewsPage() {
  const c = (await getPages()).reviews;
  const avg =
    REVIEWS.reduce((s, r) => s + r.rating, 0) / Math.max(REVIEWS.length, 1);

  return (
    <>
      <PageHeader
        eyebrow={`${avg.toFixed(1)} / 5 · ${REVIEWS.length}+ happy hosts`}
        title="Reviews"
        subtitle={c.subtitle}
        color="bg-party-yellow"
        text="text-party-ink"
      />

      <section className="bg-party-cream">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 md:py-16">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {REVIEWS.map((r) => (
              <figure
                key={r.id}
                className="rounded-2xl bg-white p-6 shadow-card"
              >
                <p className="eyebrow text-party-red">Rated {r.rating} / 5</p>
                <blockquote className="mt-3 font-display text-lg font-medium italic leading-relaxed">
                  “{r.text}”
                </blockquote>
                <figcaption className="mt-4">
                  <p className="font-display font-bold italic">{r.name}</p>
                  <p className="text-sm text-party-ink/55">
                    {r.event_type} · {r.city} · {prettyDate(r.date)}
                  </p>
                </figcaption>
              </figure>
            ))}
          </div>

          <div className="mx-auto mt-14 max-w-2xl">
            <ReviewForm />
          </div>
        </div>
      </section>

      <InstagramStrip />
    </>
  );
}
