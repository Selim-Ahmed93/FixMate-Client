import Link from "next/link";
import { ArrowUpRight, Mail, ShieldCheck, Wrench } from "lucide-react";
import { siteConfig } from "@/lib/config";
import { Logo } from "./logo";

const footerLinks = [
  {
    title: "Customers",
    links: [
      { label: "Browse services", href: "/services" },
      { label: "Create an account", href: "/register" },
      { label: "Log in", href: "/login" },
    ],
  },
  {
    title: "Technicians",
    links: [
      { label: "Join FixMate", href: "/register?role=technician" },
      { label: "How it works", href: "/#how-it-works" },
      { label: "Technician dashboard", href: "/dashboard/technician" },
    ],
  },
  {
    title: "Platform",
    links: [
      { label: "How FixMate works", href: "/#how-it-works" },
      { label: "Trust and safety", href: "/#trust" },
      { label: "Service categories", href: "/#categories" },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="mt-20 border-t border-primary/10 bg-primary text-primary-foreground">
      <div className="page-shell py-14">
        <div className="grid gap-10 lg:grid-cols-[1.4fr_2fr]">
          <div className="max-w-md">
            <Logo onDark />
            <p className="mt-4 text-sm leading-6 text-primary-foreground/70">
              {siteConfig.tagline} FixMate connects customers with local
              technicians and keeps every booking, update, and payment in one
              clear place.
            </p>
            <div className="mt-6 flex flex-wrap gap-4 text-xs text-primary-foreground/70">
              <span className="inline-flex items-center gap-1.5">
                <ShieldCheck className="size-4 text-accent" aria-hidden="true" />
                Account-based access
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Wrench className="size-4 text-accent" aria-hidden="true" />
                Technician-approved services
              </span>
            </div>
          </div>

          <div className="grid gap-8 sm:grid-cols-3">
            {footerLinks.map((group) => (
              <div key={group.title}>
                <h2 className="text-sm font-semibold text-primary-foreground">
                  {group.title}
                </h2>
                <ul className="mt-3 space-y-2">
                  {group.links.map((link) => (
                    <li key={link.label}>
                      <Link
                        href={link.href}
                        className="inline-flex items-center gap-1 rounded text-sm text-primary-foreground/65 transition hover:text-primary-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-4 border-t border-primary-foreground/15 pt-6 text-xs text-primary-foreground/60 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} {siteConfig.name}. All rights reserved.
          </p>
          <div className="flex flex-wrap items-center gap-4">
            <span className="inline-flex items-center gap-1.5">
              <Mail className="size-3.5" aria-hidden="true" />
              Support is available from your booking dashboard.
            </span>
            <Link
              href="/services"
              className="inline-flex items-center gap-1 font-medium text-primary-foreground/80 transition hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            >
              Find a repair
              <ArrowUpRight className="size-3.5" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
