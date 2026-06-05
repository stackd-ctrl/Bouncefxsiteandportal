import Link from "next/link";

export default function NotFound() {
  return (
    <section className="grid min-h-[70vh] place-items-center bg-party-yellow px-4 text-center text-party-ink">
      <div>
        <p className="eyebrow text-party-red">Error 404</p>
        <h1 className="mt-4 font-display text-7xl font-bold italic sm:text-8xl">
          This party moved.
        </h1>
        <p className="mt-4 text-lg text-party-ink/70">
          The page you're looking for isn't here — but the fun is just a click
          away.
        </p>
        <div className="mt-9 flex flex-wrap justify-center gap-3">
          <Link href="/" className="btn-red">
            Back Home
          </Link>
          <Link href="/shop" className="btn-outline">
            Browse Rentals
          </Link>
        </div>
      </div>
    </section>
  );
}
