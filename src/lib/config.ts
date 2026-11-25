// Absolute origin of the FixMate API. Browser requests go to the same origin
// and are proxied by the `/api/:path*` rewrite in `next.config.ts`, so Better
// Auth session cookies stay first-party. Server-side requests (for example
// `generateMetadata`) need this absolute origin because fetch requires it.
const DEFAULT_API_ORIGIN = "http://localhost:5000";

export const API_ORIGIN = (
  process.env.API_PROXY_TARGET ||
  process.env.NEXT_PUBLIC_API_URL ||
  DEFAULT_API_ORIGIN
).replace(/\/+$/, "");

export const siteConfig = {
  name: "FixMate",
  tagline: "Home repairs, without the guesswork.",
  description:
    "Find trusted local technicians, book the repair you need, and follow every job from request to payment.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
};

export const categoryLinks = [
  {
    name: "Appliance Repair",
    slug: "appliance-repair",
    description: "Washers, fridges, ovens and more",
    icon: "washing-machine",
    image: "/images/services/washing-machine-repair.jpg",
  },
  {
    name: "AC & Cooling",
    slug: "ac-cooling",
    description: "Servicing, repairs and installations",
    icon: "air-vent",
    image: "/images/services/air-conditioner-service.jpg",
  },
  {
    name: "Electrical",
    slug: "electrical",
    description: "Wiring, fixtures and fault finding",
    icon: "zap",
    image: "/images/hero/electrician-at-work.jpg",
  },
  {
    name: "Plumbing",
    slug: "plumbing",
    description: "Leaks, taps, drains and pipework",
    icon: "droplets",
    image: "/images/services/plumbing-repair.jpg",
  },
  {
    name: "Electronics",
    slug: "electronics",
    description: "TVs, computers and small devices",
    icon: "monitor",
    image: "/images/services/tv-repair.jpg",
  },
  {
    name: "Home Maintenance",
    slug: "home-maintenance",
    description: "Cleaning, carpentry and odd jobs",
    icon: "wrench",
    image: "/images/services/handyman-tools.jpg",
  },
] as const;

export const dashboardPrefix = {
  customer: "/dashboard/customer",
  technician: "/dashboard/technician",
  admin: "/dashboard/admin",
} as const;
