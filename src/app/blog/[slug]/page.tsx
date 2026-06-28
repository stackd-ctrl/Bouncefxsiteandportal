import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prettyDate } from "@/lib/format";
import { getPages } from "@/lib/content";
import { getPosts, getPostBySlug } from "@/lib/catalog";

export const revalidate = 60;

export async function generateStaticParams() {
  return (await getPosts()).map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const post = await getPostBySlug(params.slug);
  if (!post) return { title: "Article" };
  return {
    title: post.title,
    description: post.excerpt,
    alternates: { canonical: `/blog/${post.slug}` },
  };
}

export default async function PostPage({
  params,
}: {
  params: { slug: string };
}) {
  const post = await getPostBySlug(params.slug);
  if (!post) notFound();
  const c = (await getPages()).blog;

  return (
    <>
      <section className="bg-party-blue text-white">
        <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6 md:py-20">
          <Link
            href="/blog"
            className="text-sm font-semibold text-white/70 hover:text-white"
          >
            {c.backLink}
          </Link>
          <p className="eyebrow mt-5 text-white/80">{post.category}</p>
          <h1 className="mt-3 font-display text-4xl font-bold italic leading-[1] sm:text-5xl">
            {post.title}
          </h1>
          <p className="mt-4 text-sm font-semibold text-white/70">
            {prettyDate(post.date)} · {post.readMins} min read
          </p>
        </div>
      </section>

      <article className="bg-white">
        <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 md:py-16">
          {post.body.map((b, i) => {
            if (b.h)
              return (
                <h2
                  key={i}
                  className="mt-8 font-display text-2xl font-bold italic"
                >
                  {b.h}
                </h2>
              );
            if (b.ul)
              return (
                <ul key={i} className="mt-4 space-y-2">
                  {b.ul.map((li) => (
                    <li key={li} className="flex items-start gap-3">
                      <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-party-red" />
                      <span className="text-party-ink/80">{li}</span>
                    </li>
                  ))}
                </ul>
              );
            return (
              <p key={i} className="mt-4 text-lg leading-relaxed text-party-ink/80">
                {b.p}
              </p>
            );
          })}

          <div className="mt-10 rounded-2xl bg-party-cream p-6 text-center">
            <h3 className="font-display text-2xl font-bold italic">
              {c.ctaTitle}
            </h3>
            <p className="mt-2 text-party-ink/70">{c.ctaSub}</p>
            <div className="mt-5 flex flex-wrap justify-center gap-3">
              <Link href="/availability" className="btn-red">
                Book Now
              </Link>
              <Link href="/build" className="btn-outline">
                Build Your Party
              </Link>
            </div>
          </div>
        </div>
      </article>
    </>
  );
}
