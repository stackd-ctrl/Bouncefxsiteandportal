"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const PHONE = "571-494-3903";

/**
 * Always-visible booking bar on mobile — most party-rental traffic is on
 * phones, so the primary CTA never scrolls away. Hidden on desktop and admin.
 */
export default function MobileBookBar() {
  const pathname = usePathname();
  if (pathname?.startsWith("/admin")) return null;
  if (pathname?.startsWith("/book")) return null; // already in the flow

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-party-ink/10 bg-white/95 p-3 backdrop-blur lg:hidden">
      <div className="mx-auto flex max-w-md items-center gap-3">
        <a
          href={`tel:${PHONE.replace(/-/g, "")}`}
          className="btn-outline shrink-0 !px-5 !py-3"
        >
          Call
        </a>
        <Link href="/availability" className="btn-red flex-1 !py-3">
          Book Now
        </Link>
      </div>
    </div>
  );
}
