import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  headers: async () => {
    return [
      // API routes - NO CACHE untuk real-time polling
      {
        source: "/api/attendance/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "no-cache, no-store, must-revalidate, private",
          },
          {
            key: "Pragma",
            value: "no-cache",
          },
          {
            key: "Expires",
            value: "0",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
        ],
      },
      // Cron API routes - secured
      {
        source: "/api/cron/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "no-cache, no-store, must-revalidate, private",
          },
        ],
      },
      // Health check API
      {
        source: "/api/health",
        headers: [
          {
            key: "Cache-Control",
            value: "no-cache, no-store, must-revalidate, private",
          },
        ],
      },
      // PDF generate - short cache
      {
        source: "/api/pdf/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "private, max-age=3600",
          },
        ],
      },
      // Static assets - aggressive cache
      {
        source: "/public/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
    ];
  },
  compress: true,
};

export default nextConfig;
