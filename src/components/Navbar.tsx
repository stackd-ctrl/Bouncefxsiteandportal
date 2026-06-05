"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/shop", label: "Shop" },
  { href: "/build", label: "Build a Party" },
  { href: "/availability", label: "Availability" },
  { href: "/bundles", label: "Bundles" },
  { href: "/services", label: "Services" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  if (pathname?.startsWith("/admin")) return null;

  return (
    <header className="sticky top-0 z-50 bg-party-yellow">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
        <Link href="/" className="shrink-0">
          <span className="font-display text-2xl font-bold italic tracking-tight">
            BounceFX
          </span>
          <span className="font-display text-2xl font-medium italic tracking-tight text-party-ink/55">
            partyrentals
          </span>
        </Link>

        <nav className="hidden items-center gap-5 lg:flex">
          {LINKS.map((l) => {
            const active = pathname === l.href;
            return (
              <Link
                key={l.href}
                href={l.href}
                className={`font-body text-sm font-semibold transition-colors hover:text-party-red ${
                  active ? "text-party-red underline underline-offset-4" : ""
                }`}
              >
                {l.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          <Link
            href="/availability"
            className="hidden btn-red !px-6 !py-2.5 !text-sm sm:inline-flex"
          >
            Book Now
          </Link>
          <button
            aria-label="Toggle menu"
            onClick={() => setOpen((o) => !o)}
            className="grid h-10 w-10 place-items-center rounded-full border-2 border-party-ink lg:hidden"
          >
            <span className="text-lg">{open ? "✕" : "☰"}</span>
          </button>
        </div>
      </div>

      {open && (
        <div className="border-t border-party-ink/15 bg-party-yellow lg:hidden">
          <nav className="mx-auto flex max-w-7xl flex-col px-4 py-2">
            {LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="border-b border-party-ink/10 py-3 font-display text-xl font-semibold italic"
              >
                {l.label}
              </Link>
            ))}
            <Link href="/availability" className="btn-red mt-4">
              Book Now
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
