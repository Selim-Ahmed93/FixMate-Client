import type { NextConfig } from "next";

// Absolute origin of the FixMate API. Browsers call the frontend origin and
// the rewrite below proxies `/api/*` here, which keeps Better Auth session
// cookies first-party instead of third-party.
const DEFAULT_API_ORIGIN = "http://localhost:5000";

const apiOrigin = (
  process.env.API_PROXY_TARGET ||
  process.env.NEXT_PUBLIC_API_URL ||
  DEFAULT_API_ORIGIN
).replace(/\/+$/, "");

const nextConfig: NextConfig = {
  /* config options here */
  experimental: {
    agentFeedback: true,
  },
  reactCompiler: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${apiOrigin}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
