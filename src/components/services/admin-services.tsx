"use client";

import * as React from "react";
import {
  CheckCircle2,
  Clock3,
  MapPin,
  Search,
  ShieldCheck,
  UserRound,
  Wrench,
  X,
  XCircle,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import { PageHeader } from "@/components/dashboard/page-header";
import { ServiceImage } from "@/components/services/service-image";
import { ServiceApprovalBadge } from "@/components/services/service-approval-badge";
import { ServiceApprovalDialog } from "@/components/services/service-approval-dialog";
import { api, getErrorMessage } from "@/lib/api";
import { formatCurrency, formatDate, pluralize } from "@/lib/format";
import type { ApprovalStatus, Service } from "@/lib/types";

const statusFilterItems: Array<{ value: "all" | ApprovalStatus; label: string }> =
  [
    { value: "all", label: "All statuses" },
    { value: "pending", label: "Pending review" },
    { value: "approved", label: "Approved" },
    { value: "rejected", label: "Rejected" },
  ];

const availabilityFilterItems: Array<{
  value: "all" | "true" | "false";
  label: string;
}> = [
  { value: "all", label: "All availability" },
  { value: "true", label: "Available" },
  { value: "false", label: "Unavailable" },
];

const approvalHints: Record<ApprovalStatus, string> = {
  pending: "Awaiting admin review",
  approved: "Visible in the public catalog when available",
  rejected: "Hidden from the public catalog",
};

const approvalHintTones: Record<ApprovalStatus, string> = {
  pending: "text-amber-700",
  approved: "text-emerald-700",
  rejected: "text-rose-700",
};

function ServicesSkeleton() {
  return (
    <div className="space-y-4" aria-busy="true" aria-label="Loading services">
      {Array.from({ length: 3 }).map((_, index) => (
        <div
          key={index}
          className="grid overflow-hidden rounded-2xl border bg-card sm:grid-cols-[180px_1fr] lg:grid-cols-[200px_1fr_auto]"
        >
          <Skeleton className="min-h-48 rounded-none" />
          <div className="space-y-3 p-5">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-6 w-2/3" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-4/5" />
            <Skeleton className="h-10 w-full" />
          </div>
          <Skeleton className="m-5 h-32 rounded-xl lg:w-48" />
        </div>
      ))}
    </div>
  );
}

function AdminServiceCard({
  service,
  onUpdated,
}: {
  service: Service;
  onUpdated: () => void | Promise<void>;
}) {
  const canApprove = service.approvalStatus !== "approved";
  const canReject = service.approvalStatus !== "rejected";

  return (
    <article className="overflow-hidden rounded-2xl border bg-card shadow-sm transition hover:border-primary/20 hover:shadow-md hover:shadow-primary/5">
      <div className="grid sm:grid-cols-[180px_1fr] lg:grid-cols-[200px_1fr_auto]">
        <div className="relative min-h-48 bg-muted sm:min-h-full">
          <ServiceImage
            src={service.image}
            alt={service.title}
            className="absolute inset-0 size-full"
          />
        </div>

        <div className="min-w-0 p-5">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
              {service.category}
            </p>
            <ServiceApprovalBadge status={service.approvalStatus} />
            <Badge
              variant="outline"
              className={
                service.isAvailable
                  ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                  : "border-slate-200 bg-slate-50 text-slate-700"
              }
            >
              {service.isAvailable ? (
                <CheckCircle2 aria-hidden="true" />
              ) : (
                <XCircle aria-hidden="true" />
              )}
              {service.isAvailable ? "Available" : "Unavailable"}
            </Badge>
          </div>

          <h2 className="mt-1.5 truncate text-lg font-semibold">
            {service.title}
          </h2>
          <p className="mt-2 line-clamp-3 text-sm leading-6 text-muted-foreground">
            {service.description}
          </p>

          <dl className="mt-4 grid gap-x-5 gap-y-2 text-xs text-muted-foreground sm:grid-cols-2">
            <div className="flex min-w-0 items-center gap-2">
              <UserRound className="size-3.5 shrink-0" aria-hidden="true" />
              <dt className="sr-only">Technician</dt>
              <dd className="truncate">
                {service.technicianName}
                <span className="text-muted-foreground/80">
                  {" "}
                  · {service.technicianEmail}
                </span>
              </dd>
            </div>
            <div className="flex min-w-0 items-center gap-2">
              <Clock3 className="size-3.5 shrink-0" aria-hidden="true" />
              <dt className="sr-only">Estimated duration</dt>
              <dd className="truncate">{service.estimatedDuration}</dd>
            </div>
            <div className="flex min-w-0 items-center gap-2">
              <Wrench className="size-3.5 shrink-0" aria-hidden="true" />
              <dt className="sr-only">Service mode</dt>
              <dd className="truncate">{service.serviceMode}</dd>
            </div>
            <div className="flex min-w-0 items-center gap-2">
              <MapPin className="size-3.5 shrink-0" aria-hidden="true" />
              <dt className="sr-only">Service area</dt>
              <dd className="truncate">{service.serviceArea}</dd>
            </div>
            <div className="flex min-w-0 items-center gap-2 sm:col-span-2">
              <Clock3 className="size-3.5 shrink-0" aria-hidden="true" />
              <dt className="sr-only">Submitted</dt>
              <dd className="truncate">
                Submitted {formatDate(service.createdAt)}
              </dd>
            </div>
          </dl>
        </div>

        <div className="flex flex-col justify-between gap-4 border-t p-5 sm:col-span-2 lg:col-span-1 lg:min-w-52 lg:border-l lg:border-t-0">
          <div>
            <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
              Base price
            </p>
            <p className="mt-1 font-heading text-2xl font-bold text-primary">
              {formatCurrency(service.basePrice)}
            </p>
            <p
              className={`mt-1 text-[11px] font-medium ${approvalHintTones[service.approvalStatus]}`}
            >
              {approvalHints[service.approvalStatus]}
            </p>
          </div>

          <div className="flex flex-wrap gap-2 lg:flex-col">
            {canApprove ? (
              <ServiceApprovalDialog
                service={service}
                nextStatus="approved"
                onUpdated={onUpdated}
                className="justify-center"
              />
            ) : null}
            {canReject ? (
              <ServiceApprovalDialog
                service={service}
                nextStatus="rejected"
                onUpdated={onUpdated}
                className="justify-center"
              />
            ) : null}
          </div>
        </div>
      </div>
    </article>
  );
}

export function AdminServices() {
  const [services, setServices] = React.useState<Service[]>([]);
  const [total, setTotal] = React.useState(0);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [statusFilter, setStatusFilter] = React.useState<
    "all" | ApprovalStatus
  >("all");
  const [availabilityFilter, setAvailabilityFilter] = React.useState<
    "all" | "true" | "false"
  >("all");
  const [searchInput, setSearchInput] = React.useState("");
  const [search, setSearch] = React.useState("");
  const [refreshKey, setRefreshKey] = React.useState(0);

  React.useEffect(() => {
    let active = true;

    api.admin
      .services({
        status: statusFilter === "all" ? undefined : statusFilter,
        available:
          availabilityFilter === "all" ? undefined : availabilityFilter,
        search: search || undefined,
      })
      .then((response) => {
        if (!active) return;
        setServices(response.services);
        setTotal(response.totalServices);
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
  }, [availabilityFilter, refreshKey, search, statusFilter]);

  const refresh = React.useCallback(() => {
    setLoading(true);
    setError(null);
    setRefreshKey((current) => current + 1);
  }, []);

  const filterActive =
    statusFilter !== "all" ||
    availabilityFilter !== "all" ||
    Boolean(search);

  function handleSearch(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setSearch(searchInput.trim());
    setRefreshKey((current) => current + 1);
  }

  function clearFilters() {
    setLoading(true);
    setError(null);
    setStatusFilter("all");
    setAvailabilityFilter("all");
    setSearchInput("");
    setSearch("");
    setRefreshKey((current) => current + 1);
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Service management"
        description="Review technician listings, approve services for the public catalog, or reject listings that should not be published."
      />

      <div className="rounded-2xl border bg-card p-4 shadow-sm">
        <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_10rem_11rem_auto]">
          <form onSubmit={handleSearch} className="flex min-w-0 gap-2">
            <div className="relative min-w-0 flex-1">
              <Search
                className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground"
                aria-hidden="true"
              />
              <Input
                type="search"
                value={searchInput}
                onChange={(event) => setSearchInput(event.target.value)}
                placeholder="Search title, category, or technician"
                aria-label="Search services by title, category, or technician"
                maxLength={100}
                autoComplete="off"
                className="pl-8"
              />
            </div>
            <Button type="submit" variant="secondary" className="shrink-0">
              <Search aria-hidden="true" />
              Search
            </Button>
          </form>

          <Select
            items={statusFilterItems}
            value={statusFilter}
            onValueChange={(value) => {
              if (typeof value === "string") {
                setLoading(true);
                setError(null);
                setStatusFilter(value as "all" | ApprovalStatus);
              }
            }}
          >
            <SelectTrigger aria-label="Filter services by approval status" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {statusFilterItems.map((item) => (
                <SelectItem key={item.value} value={item.value}>
                  {item.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            items={availabilityFilterItems}
            value={availabilityFilter}
            onValueChange={(value) => {
              if (typeof value === "string") {
                setLoading(true);
                setError(null);
                setAvailabilityFilter(value as "all" | "true" | "false");
              }
            }}
          >
            <SelectTrigger aria-label="Filter services by availability" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {availabilityFilterItems.map((item) => (
                <SelectItem key={item.value} value={item.value}>
                  {item.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {filterActive ? (
            <Button type="button" variant="ghost" onClick={clearFilters}>
              <X aria-hidden="true" />
              Clear
            </Button>
          ) : (
            <div className="hidden lg:block" aria-hidden="true" />
          )}
        </div>
      </div>

      {loading ? (
        <ServicesSkeleton />
      ) : error ? (
        <ErrorState
          title="Could not load services"
          message={error}
          onRetry={refresh}
        />
      ) : services.length === 0 ? (
        <EmptyState
          icon={ShieldCheck}
          title={
            filterActive
              ? "No services match these filters"
              : "No services submitted yet"
          }
          description={
            filterActive
              ? "Try a different search term or filter to find the listing you need."
              : "When technicians submit service listings, they will appear here for approval."
          }
          action={
            filterActive ? (
              <Button type="button" variant="outline" onClick={clearFilters}>
                <X aria-hidden="true" />
                Clear filters
              </Button>
            ) : undefined
          }
        />
      ) : (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2 px-1 text-sm">
            <p className="font-medium" aria-live="polite">
              {pluralize(total, "service")}
              {filterActive ? " matching filters" : ""}
            </p>
            <p className="text-xs text-muted-foreground">
              Newest submissions appear first
            </p>
          </div>

          {services.map((service) => (
            <AdminServiceCard
              key={service._id}
              service={service}
              onUpdated={refresh}
            />
          ))}
        </div>
      )}
    </div>
  );
}
