"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { CITIES } from "@/lib/cities";
import type { SiteInfo } from "@/lib/content";

export default function Footer({
  site,
  logo,
}: {
  site: SiteInfo;
  logo: string;
}) {
  const pathname = usePathname();
  if (pathname?.startsWith("/admin")) return null;

  const FB = site.facebook;
  const IG = site.instagram;
  const EMAIL = site.email;
  const PHONES = site.phones;

  return (
    <footer className="bg-party-yellow text-party-ink">
      {/* Nav band */}
      <div className="mx-auto max-w-7xl px-4 pt-16 sm:px-6">
        <div className="grid gap-10 md:grid-cols-[1.4fr_1fr_1fr]">
          <div>
            <Link
              href="/"
              className="inline-block overflow-hidden rounded-2xl bg-black p-3 ring-1 ring-party-ink/10"
            >
              <Image
                src={logo}
                alt="Bounce FX Party Rentals"
                width={569}
                height={627}
                className="h-auto w-32"
              />
            </Link>
            <p className="mt-4 max-w-sm text-sm text-party-ink/70">
              Party vibes made easy. Inflatables, tents, tables & chairs for
              unforgettable events across Fredericksburg & the DMV.
            </p>
            <p className="mt-4 inline-flex items-center gap-2 rounded-full border border-party-ink/25 px-4 py-1.5 text-xs font-bold uppercase tracking-wider">
              Licensed &amp; Insured
            </p>
          </div>

          <div>
            <h4 className="eyebrow text-party-red">Explore</h4>
            <ul className="mt-4 space-y-2.5 font-display text-lg italic">
              {[
                ["/shop", "Shop Rentals"],
                ["/build", "Build a Party"],
                ["/availability", "Check Availability"],
                ["/bundles", "Bundle Packages"],
                ["/services", "Our Services"],
              ].map(([href, label]) => (
                <li key={href}>
                  <Link href={href} className="hover:text-party-red">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="eyebrow text-party-red">Company</h4>
            <ul className="mt-4 space-y-2.5 font-display text-lg italic">
              {[
                ["/about", "About Us"],
                ["/reviews", "Reviews"],
                ["/blog", "Party Tips"],
                ["/contact", "Contact"],
                ["/admin", "Owner Login"],
              ].map(([href, label]) => (
                <li key={href}>
                  <Link href={href} className="hover:text-party-red">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Service areas (SEO internal links) */}
        <div className="mt-12 border-t border-party-ink/15 pt-6">
          <h4 className="eyebrow text-party-red">Service areas</h4>
          <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1.5 text-sm font-semibold">
            {CITIES.map((c) => (
              <Link
                key={c.slug}
                href={`/party-rentals/${c.slug}`}
                className="hover:text-party-red"
              >
                {c.name}, VA
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Contact band */}
      <div className="mx-auto mt-16 max-w-7xl border-t border-party-ink/15 px-4 pb-28 pt-10 text-center sm:px-6 lg:pb-10">
        <a
          href={`mailto:${EMAIL}`}
          className="font-display text-xl font-bold italic text-party-red underline decoration-2 underline-offset-4 sm:text-2xl"
        >
          {EMAIL}
        </a>
        <div className="mt-3 flex flex-wrap items-center justify-center gap-x-6 gap-y-1">
          {PHONES.map((p) => (
            <a
              key={p}
              href={`tel:${p.replace(/-/g, "")}`}
              className="font-display text-lg font-bold italic hover:text-party-red"
            >
              {p}
            </a>
          ))}
        </div>
        <p className="mt-3 font-display text-lg font-semibold italic">
          Partner With Bounce FX
        </p>
        <div className="mt-5 flex items-center justify-center gap-3">
          <a
            href={IG}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Instagram"
            className="grid h-10 w-10 place-items-center rounded-full border-2 border-party-ink transition-colors hover:bg-party-ink hover:text-party-yellow"
          >
            ⌾
          </a>
          <a
            href={FB}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Facebook"
            className="grid h-10 w-10 place-items-center rounded-full border-2 border-party-ink font-display font-bold italic transition-colors hover:bg-party-ink hover:text-party-yellow"
          >
            f
          </a>
        </div>
        <p className="mt-8 text-xs text-party-ink/50">
          © {new Date().getFullYear()} Bounce FX Party Rentals · Make Your Event
          Memorable.
        </p>
      </div>
    </footer>
  );
}
