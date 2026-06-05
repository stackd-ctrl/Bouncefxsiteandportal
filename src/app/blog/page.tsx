import type { Metadata } from "next";
import Link from "next/link";
import { POSTS } from "@/lib/posts";
import { prettyDate } from "@/lib/format";
import PageHeader from "@/components/PageHeader";

export const metadata: Metadata = {
  title: "Party Planning Tips",
  description:
    "Party planning tips, bounce house safety, and event ideas from Bounce FX Party Rentals in Fredericksburg, VA.",
};

export default function BlogPage() {
  return (
    <>
      <PageHeader
        eyebrow="The Bounce FX blog"
        title="Party Planning Tips"
        subtitle="Guides, ideas, and safety know-how to make your next event the best one yet."
        color="bg-party-blue"
      />
      <section className="bg-party-cream">
        <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 md:py-16">
          <div className="grid gap-6 md:grid-cols-2">
            {POSTS.map((post) => (
              <Link
                key={post.slug}
                href={`/blog/${post.slug}`}
                className="group flex flex-col rounded-2xl bg-white p-7 shadow-card transition-transform hover:-translate-y-1"
              >
                <span className="self-start rounded-full bg-party-cream px-3 py-1 text-xs font-bold uppercase tracking-wider text-party-red">
                  {post.category}
                </span>
                <h2 className="mt-4 font-display text-2xl font-bold italic leading-tight group-hover:text-party-red">
                  {post.title}
                </h2>
                <p className="mt-2 flex-1 text-party-ink/70">{post.excerpt}</p>
                <p className="mt-4 text-sm font-semibold text-party-ink/50">
                  {prettyDate(post.date)} · {post.readMins} min read
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
