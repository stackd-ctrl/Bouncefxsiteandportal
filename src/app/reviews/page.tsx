import type { Metadata } from "next";
import { REVIEWS, GOOGLE_REVIEWS_URL } from "@/lib/data";
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
  const hasReviews = REVIEWS.length > 0;
  const avg = hasReviews
    ? REVIEWS.reduce((s, r) => s + r.rating, 0) / REVIEWS.length
    : 0;

  return (
    <>
      <PageHeader
        eyebrow={
          hasReviews
            ? `${avg.toFixed(1)} / 5 · ${REVIEWS.length} happy hosts`
            : "Be the first to leave a review"
        }
        title="Reviews"
        subtitle={c.subtitle}
        color="bg-party-yellow"
        text="text-party-ink"
      />

      <section className="bg-party-cream">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 md:py-16">
          {hasReviews ? (
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
                      {r.meta ? `${r.meta} · ` : ""}
                      {prettyDate(r.date)}
                    </p>
                  </figcaption>
                </figure>
              ))}
            </div>
          ) : (
            <div className="mx-auto max-w-2xl rounded-2xl bg-white p-8 text-center shadow-card">
              <p className="font-display text-2xl font-bold italic">
                {c.emptyTitle}
              </p>
              <p className="mt-2 text-party-ink/60">{c.emptyBody}</p>
            </div>
          )}

          {hasReviews && (
            <div className="mt-10 text-center">
              <a
                href={GOOGLE_REVIEWS_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-dark"
              >
                {c.googleCta}
              </a>
              <p className="mt-3 text-sm text-party-ink/55">{c.verifiedNote}</p>
            </div>
          )}

          <div className="mx-auto mt-14 max-w-2xl">
            <ReviewForm />
          </div>
        </div>
      </section>

      <InstagramStrip />
    </>
  );
}
