"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ClipboardList,
  PackageSearch,
  Search,
  SlidersHorizontal,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import { ServiceCard } from "@/components/services/service-card";
import { api, getErrorMessage } from "@/lib/api";
import { categoryLinks } from "@/lib/config";
import type { Service } from "@/lib/types";
import { cn } from "cn";

const aliases: Record<string, string[]> = {
  "Appliance Repair": [
    "appliance",
    "washing",
    "refrigerator",
    "fridge",
    "oven",
    "microwave",
  ],
  "AC & Cooling": ["ac", "air condition", "cooling", "hvac"],
  Electrical: ["electric"],
  Plumbing: ["plumb", "pipe", "leak", "tap"],
  Electronics: ["electronic", "tv", "television", "computer", "laptop"],
  "Home Maintenance": [
    "maintenance",
    "cleaning",
    "carpentry",
    "handyman",
    "painting",
  ],
};

function matchesCategory(service: Service, category: string): boolean {
  if (!category || category === "All") return true;
  const serviceCategory = service.category.toLowerCase();
  if (serviceCategory.includes(category.toLowerCase())) return true;
  return (aliases[category] ?? []).some((alias) =>
    serviceCategory.includes(alias),
  );
}

function matchesQuery(service: Service, query: string): boolean {
  if (!query) return true;
  const haystack = [
    service.title,
    service.category,
    service.description,
    service.technicianName,
    service.serviceArea,
  ]
    .join(" ")
    .toLowerCase();
  return haystack.includes(query.toLowerCase());
}

function CatalogSkeleton() {
  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, index) => (
        <div key={index} className="overflow-hidden rounded-2xl border bg-card">
          <Skeleton className="aspect-[4/3] w-full rounded-none" />
          <div className="space-y-3 p-5">
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="mt-5 h-10 w-full" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function ServicesCatalog() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialQuery = searchParams.get("q") ?? "";
  const initialCategory = searchParams.get("category") ?? "All";

  const [services, setServices] = React.useState<Service[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [query, setQuery] = React.useState(initialQuery);
  const [category, setCategory] = React.useState(initialCategory);
  const deferredQuery = React.useDeferredValue(query.trim());

  const load = React.useCallback(() => {
    setLoading(true);
    setError(null);
    api.services
      .list()
      .then((response) => setServices(response.services))
      .catch((reason) => setError(getErrorMessage(reason)))
      .finally(() => setLoading(false));
  }, []);

  React.useEffect(() => {
    let active = true;

    api.services
      .list()
      .then((response) => {
        if (active) setServices(response.services);
      })
      .catch((reason) => {
        if (active) setError(getErrorMessage(reason));
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const filtered = React.useMemo(
    () =>
      services.filter(
        (service) =>
          matchesCategory(service, category) &&
          matchesQuery(service, deferredQuery),
      ),
    [category, deferredQuery, services],
  );

  function syncUrl(nextQuery: string, nextCategory: string) {
    const params = new URLSearchParams();
    if (nextQuery.trim()) params.set("q", nextQuery.trim());
    if (nextCategory && nextCategory !== "All") {
      params.set("category", nextCategory);
    }
    const suffix = params.size ? `?${params.toString()}` : "";
    router.replace(`/services${suffix}`, { scroll: false });
  }

  function handleSearch(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    syncUrl(query, category);
  }

  function chooseCategory(nextCategory: string) {
    setCategory(nextCategory);
    syncUrl(query, nextCategory);
  }

  function clearFilters() {
    setQuery("");
    setCategory("All");
    router.replace("/services", { scroll: false });
  }

  const hasFilters = Boolean(query.trim()) || category !== "All";

  return (
    <div>
      <div className="rounded-2xl border bg-card p-4 shadow-sm sm:p-5">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <form
            role="search"
            onSubmit={handleSearch}
            className="flex flex-1 gap-2"
          >
            <div className="relative flex-1">
              <label htmlFor="catalog-search" className="sr-only">
                Search services
              </label>
              <Search
                className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                aria-hidden="true"
              />
              <Input
                id="catalog-search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search by service, category, or technician"
                className="h-10 pl-9"
              />
              {query ? (
                <button
                  type="button"
                  onClick={() => {
                    setQuery("");
                    syncUrl("", category);
                  }}
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-muted-foreground transition hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  aria-label="Clear search"
                >
                  <X className="size-4" aria-hidden="true" />
                </button>
              ) : null}
            </div>
            <Button type="submit" className="h-10">
              Search
            </Button>
          </form>

          <div className="flex items-center gap-2 text-sm text-muted-foreground lg:pl-2">
            <SlidersHorizontal className="size-4" aria-hidden="true" />
            <span>
              {loading
                ? "Loading services…"
                : `${filtered.length} ${filtered.length === 1 ? "service" : "services"}`}
            </span>
          </div>
        </div>

        <div
          className="-mx-1 mt-4 flex gap-2 overflow-x-auto px-1 pb-1"
          aria-label="Filter by category"
        >
          {["All", ...categoryLinks.map((item) => item.name)].map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => chooseCategory(item)}
              aria-pressed={category === item}
              className={cn(
                "shrink-0 rounded-full border px-3 py-1.5 text-xs font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                category === item
                  ? "border-primary bg-primary text-primary-foreground"
                  : "bg-background text-muted-foreground hover:border-primary/30 hover:text-foreground",
              )}
            >
              {item}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-8">
        {loading ? (
          <CatalogSkeleton />
        ) : error ? (
          <ErrorState message={error} onRetry={load} />
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={hasFilters ? PackageSearch : ClipboardList}
            title={hasFilters ? "No services match those filters" : "No services yet"}
            description={
              hasFilters
                ? "Try a broader search or clear the category filter. Only admin-approved, available services appear in the catalog."
                : "Once technicians add services and an admin approves them, they will appear here. You can join as a technician to offer the first listing."
            }
            action={
              hasFilters ? (
                <Button variant="outline" onClick={clearFilters}>
                  Clear filters
                </Button>
              ) : (
                <Button render={<Link href="/register?role=technician" />}>
                  Join as a technician
                </Button>
              )
            }
          />
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((service) => (
              <ServiceCard key={service._id} service={service} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
