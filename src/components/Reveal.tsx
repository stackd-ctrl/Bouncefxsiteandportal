"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

/**
 * Lightweight scroll reveal — no animation library. Adds `.is-in` to any
 * element with the `.reveal` class once it enters the viewport.
 *
 * Re-runs on every route change (via `pathname`) so client-side navigation to
 * a new page re-observes that page's `.reveal` elements. Without this, newly
 * mounted pages would stay stuck at opacity:0 (invisible).
 */
export default function Reveal() {
  const pathname = usePathname();

  useEffect(() => {
    let io: IntersectionObserver | null = null;

    const run = () => {
      const els = Array.from(
        document.querySelectorAll<HTMLElement>(".reveal:not(.is-in)")
      );

      if (!("IntersectionObserver" in window)) {
        els.forEach((el) => el.classList.add("is-in"));
        return;
      }

      io = new IntersectionObserver(
        (entries) => {
          entries.forEach((e) => {
            if (e.isIntersecting) {
              e.target.classList.add("is-in");
              io?.unobserve(e.target);
            }
          });
        },
        { threshold: 0.1, rootMargin: "0px 0px -10% 0px" }
      );

      els.forEach((el) => io!.observe(el));
    };

    // Wait a frame so the newly navigated page's DOM is committed/painted.
    const raf = requestAnimationFrame(run);

    // Safety net: if anything is still hidden shortly after load (e.g. observer
    // never fired), force it visible so content is never stuck blank.
    const safety = setTimeout(() => {
      document
        .querySelectorAll<HTMLElement>(".reveal:not(.is-in)")
        .forEach((el) => {
          const rect = el.getBoundingClientRect();
          if (rect.top < window.innerHeight && rect.bottom > 0) {
            el.classList.add("is-in");
          }
        });
    }, 600);

    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(safety);
      io?.disconnect();
    };
  }, [pathname]);

  return null;
}
