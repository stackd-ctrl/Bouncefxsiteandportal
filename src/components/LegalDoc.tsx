import type { ReactNode } from "react";

/**
 * Shared layout for the long-form legal pages (Privacy, Terms). Renders a
 * readable, single-column prose column with consistent heading/paragraph styles
 * so the documents look intentional without depending on a typography plugin.
 */
export function LegalBody({ children }: { children: ReactNode }) {
  return (
    <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6 md:py-20">
      <div className="space-y-8 font-body text-[15px] leading-relaxed text-party-ink/85">
        {children}
      </div>
    </div>
  );
}

export function LegalUpdated({ date }: { date: string }) {
  return (
    <p className="text-sm font-semibold uppercase tracking-wide text-party-ink/50">
      Last updated: {date}
    </p>
  );
}

export function LegalSection({
  heading,
  children,
}: {
  heading: string;
  children: ReactNode;
}) {
  return (
    <section className="space-y-3">
      <h2 className="font-display text-2xl font-bold italic text-party-ink">
        {heading}
      </h2>
      {children}
    </section>
  );
}
