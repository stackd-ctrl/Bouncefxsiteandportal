import type { Metadata } from "next";
import Link from "next/link";
import { prettyDate } from "@/lib/format";
import { getPages } from "@/lib/content";
import { getPosts } from "@/lib/catalog";
import PageHeader from "@/components/PageHeader";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Party Planning Tips",
  description:
    "Party planning tips, bounce house safety, and event ideas from Bounce FX Party Rentals in Fredericksburg, VA.",
};

export default async function BlogPage() {
  const [c, posts] = await Promise.all([
    getPages().then((p) => p.blog),
    getPosts(),
  ]);
  return (
    <>
      <PageHeader
        eyebrow={c.eyebrow}
        title={c.title}
        subtitle={c.subtitle}
        color="bg-party-blue"
      />
      <section className="bg-party-cream">
        <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 md:py-16">
          <div className="grid gap-6 md:grid-cols-2">
            {posts.map((post) => (
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
