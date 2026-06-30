import type { Metadata } from "next";
import Link from "next/link";
import PageHeader from "@/components/PageHeader";

export const metadata: Metadata = {
  title: "Documents",
  description:
    "Policies and agreements for Bounce FX Party Rentals — privacy policy, terms of service, and our rental & safety agreement.",
};

type DocItem = {
  title: string;
  desc: string;
  href: string;
  cta: string;
  external?: boolean;
};

const DOCS: DocItem[] = [
  {
    title: "Privacy Policy",
    desc: "What information we collect when you book, how we use it, and how we keep it safe.",
    href: "/privacy",
    cta: "Read policy",
  },
  {
    title: "Terms of Service",
    desc: "The terms that apply to your rental — booking, deposits, delivery, and responsibilities.",
    href: "/terms",
    cta: "Read terms",
  },
  {
    title: "Rental & Safety Agreement",
    desc: "The safety rules and rental agreement you review and sign as part of every booking.",
    href: "/rental-agreement.pdf",
    cta: "Open PDF",
    external: true,
  },
];

export default function DocumentsPage() {
  return (
    <>
      <PageHeader
        eyebrow="Good to know"
        title="Documents"
        subtitle="Our policies and agreements, all in one place."
        color="bg-party-red"
      />
      <div className="mx-auto max-w-4xl px-4 py-14 sm:px-6 md:py-20">
        <div className="grid gap-5 sm:grid-cols-2">
          {DOCS.map((d) => {
            const card = (
              <div className="flex h-full flex-col rounded-3xl border-2 border-party-ink/10 bg-white p-7 transition-colors hover:border-party-red">
                <h2 className="font-display text-2xl font-bold italic text-party-ink">
                  {d.title}
                </h2>
                <p className="mt-3 flex-1 font-body text-[15px] leading-relaxed text-party-ink/75">
                  {d.desc}
                </p>
                <span className="mt-5 inline-flex items-center gap-1.5 font-display text-lg font-bold italic text-party-red">
                  {d.cta} &rarr;
                </span>
              </div>
            );
            return d.external ? (
              <a
                key={d.href}
                href={d.href}
                target="_blank"
                rel="noopener noreferrer"
                className="block"
              >
                {card}
              </a>
            ) : (
              <Link key={d.href} href={d.href} className="block">
                {card}
              </Link>
            );
          })}
        </div>
      </div>
    </>
  );
}
