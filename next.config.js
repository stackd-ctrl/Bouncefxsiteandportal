/** @type {import('next').NextConfig} */
const nextConfig = {
  // We type-check separately (tsc) and don't ship an ESLint config; don't let a
  // missing/mismatched linter setup fail the Vercel build.
  eslint: { ignoreDuringBuilds: true },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.squarespace-cdn.com" },
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "**.supabase.co" },
    ],
  },
};

module.exports = nextConfig;
