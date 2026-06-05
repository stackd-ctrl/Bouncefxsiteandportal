import Image from "next/image";

const IG = "https://instagram.com/bouncefxpartyrentals";

/**
 * Instagram showcase. Uses real Bounce FX photos as the post grid and links to
 * the live @bouncefxpartyrentals profile. Ready to swap for a live feed widget
 * (e.g. Behold/SnapWidget) once the IG account is connected.
 */
const POSTS = [
  "/hero-grand-dome.png",
  "/events/combo-outdoor.png",
  "/events/slide-interior.png",
  "/events/extra-large.png",
  "/events/basketball.png",
  "/products/purplish.png",
];

export default function InstagramStrip() {
  return (
    <section className="bg-white">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 md:py-20">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="eyebrow text-party-red">On the 'gram</p>
            <h2 className="section-title mt-3">@bouncefxpartyrentals</h2>
          </div>
          <a
            href={IG}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-dark"
          >
            Follow us
          </a>
        </div>

        <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {POSTS.map((src, i) => (
            <a
              key={i}
              href={IG}
              target="_blank"
              rel="noopener noreferrer"
              className="group relative aspect-square overflow-hidden rounded-xl bg-party-cream"
            >
              <Image
                src={src}
                alt="Bounce FX Instagram post"
                fill
                sizes="(max-width: 640px) 50vw, 16vw"
                className="object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <span className="absolute inset-0 bg-party-ink/0 transition-colors group-hover:bg-party-ink/20" />
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
