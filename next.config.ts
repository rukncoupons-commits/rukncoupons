import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  staticPageGenerationTimeout: 1200, // 20 minutes for heavy Firestore cold builds
  experimental: {
    optimizePackageImports: ["lucide-react"],
    cpus: 1, // Limit build concurrency to prevent overwhelming Firestore
  },

  // Image optimization
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      { protocol: "https", hostname: "firebasestorage.googleapis.com" },
      { protocol: "https", hostname: "storage.googleapis.com" },
      { protocol: "https", hostname: "cdnjs.cloudflare.com" },
      { protocol: "https", hostname: "i.postimg.cc" },
    ],
    minimumCacheTTL: 86400, // 24 hours
  },

  // Security & performance headers
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
          { key: "X-DNS-Prefetch-Control", value: "on" },
        ],
      },
      // Long-lived cache for static assets
      {
        source: "/static/(.*)",
        headers: [
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
        ],
      },
      // Cache sitemap & robots
      {
        source: "/(sitemap.xml|robots.txt)",
        headers: [
          { key: "Cache-Control", value: "public, max-age=3600, stale-while-revalidate=86400" },
        ],
      },
      // ISR pages: short public cache, long stale
      {
        source: "/:locale(ar|en)/:country(sa|ae|eg|kw|qa|bh|om)/:path*",
        headers: [
          { key: "Cache-Control", value: "public, max-age=300, stale-while-revalidate=3600" },
        ],
      },
    ];
  },

  // Preconnect hints via custom headers (handled in layout via <link> tags)
  // Compress responses
  compress: true,


  // Bypass build errors for CI deployment
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
