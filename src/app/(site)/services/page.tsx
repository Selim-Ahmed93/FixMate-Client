import type { Metadata } from "next";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { ServicesCatalog } from "./services-catalog";

export const metadata: Metadata = {
  title: "Browse services",
  description:
    "Browse approved home repair services from FixMate technicians, compare starting prices, and book the help you need.",
};

export default function ServicesPage() {
  return (
    <>
      <section className="border-b border-border/70 bg-card/40">
        <div className="page-shell py-12 lg:py-16">
          <span className="eyebrow">Service catalog</span>
          <h1 className="mt-3 max-w-3xl text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
            Find the right fix, from a technician who offers it.
          </h1>
          <p className="mt-4 max-w-2xl text-muted-foreground">
            Every service below is approved and currently available. Search by
            what you need, then review the price, duration, and service area
            before requesting a visit.
          </p>
        </div>
      </section>

      <section className="page-shell py-8 lg:py-10">
        <Suspense
          fallback={
            <div className="space-y-8">
              <Skeleton className="h-36 rounded-2xl" />
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 6 }).map((_, index) => (
                  <Skeleton key={index} className="h-96 rounded-2xl" />
                ))}
              </div>
            </div>
          }
        >
          <ServicesCatalog />
        </Suspense>
      </section>
    </>
  );
}
