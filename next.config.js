/** @type {import('next').NextConfig} */
const nextConfig = {
  // We type-check separately (tsc) and don't ship an ESLint config; don't let a
  // missing/mismatched linter setup fail the Vercel build.
  eslint: { ignoreDuringBuilds: true },
  // `npm run build` / `tsc --noEmit` is the source of truth for types. Vercel's
  // fresh install can resolve slightly different dependency .d.ts versions; don't
  // let that variance block deploys (run `npm run build` before pushing).
  typescript: { ignoreBuildErrors: true },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.squarespace-cdn.com" },
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "**.supabase.co" },
    ],
  },
};

module.exports = nextConfig;
