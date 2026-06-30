import type { MetadataRoute } from "next";
import { CITIES } from "@/lib/cities";
import { getPosts } from "@/lib/catalog";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const posts = await getPosts();
  const staticPaths = [
    "",
    "/shop",
    "/build",
    "/availability",
    "/bundles",
    "/services",
    "/about",
    "/contact",
    "/reviews",
    "/blog",
    "/documents",
    "/privacy",
    "/terms",
  ];
  const now = "2026-06-04";

  return [
    ...staticPaths.map((p) => ({
      url: `${base}${p}`,
      lastModified: now,
    })),
    ...CITIES.map((c) => ({
      url: `${base}/party-rentals/${c.slug}`,
      lastModified: now,
    })),
    ...posts.map((p) => ({
      url: `${base}/blog/${p.slug}`,
      lastModified: p.date,
    })),
  ];
}
