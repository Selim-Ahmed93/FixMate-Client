"use client";

import * as React from "react";
import {
  CalendarClock,
  ClipboardList,
  Mail,
  MapPin,
  Phone,
  ReceiptText,
  Search,
  ShieldCheck,
  UserRound,
  Wrench,
  X,
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
import {
  BookingStatusBadge,
  PaymentStatusBadge,
} from "@/components/dashboard/booking-status-badge";
import { ServiceImage } from "@/components/services/service-image";
import { api, getErrorMessage } from "@/lib/api";
import {
  bookingStatusLabels,
  formatCurrency,
  formatDateTime,
  pluralize,
} from "@/lib/format";
import type { Booking, BookingStatus } from "@/lib/types";

const statusFilterItems: Array<{
  value: "all" | BookingStatus;
  label: string;
}> = [
  { value: "all", label: "All statuses" },
  { value: "requested", label: bookingStatusLabels.requested },
  { value: "accepted", label: bookingStatusLabels.accepted },
  { value: "in-progress", label: bookingStatusLabels["in-progress"] },
  { value: "completed", label: bookingStatusLabels.completed },
  { value: "rejected", label: bookingStatusLabels.rejected },
  { value: "cancelled", label: bookingStatusLabels.cancelled },
];

function BookingsSkeleton() {
  return (
    <div className="space-y-4" aria-busy="true" aria-label="Loading bookings">
      {Array.from({ length: 3 }).map((_, index) => (
        <div
          key={index}
          className="grid overflow-hidden rounded-2xl border bg-card sm:grid-cols-[168px_1fr] lg:grid-cols-[190px_1fr_auto]"
        >
          <Skeleton className="min-h-44 rounded-none" />
          <div className="space-y-3 p-5">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-6 w-2/3" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-4/5" />
            <Skeleton className="h-10 w-full" />
          </div>
          <Skeleton className="m-5 h-28 rounded-xl lg:w-40" />
        </div>
      ))}
    </div>
  );
}

function AdminBookingCard({ booking }: { booking: Booking }) {
  return (
    <article className="overflow-hidden rounded-2xl border bg-card shadow-sm transition hover:border-primary/20 hover:shadow-md hover:shadow-primary/5">
      <div className="grid sm:grid-cols-[168px_1fr] lg:grid-cols-[190px_1fr_auto]">
        <div className="relative min-h-44 bg-muted sm:min-h-full">
          <ServiceImage
            src={booking.serviceImage}
            alt={booking.serviceTitle}
            className="absolute inset-0 size-full"
          />
        </div>

        <div className="min-w-0 p-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                {booking.category}
              </p>
              <h2 className="mt-1 truncate text-lg font-semibold">
                {booking.serviceTitle}
              </h2>
            </div>
            <div className="flex flex-wrap gap-2">
              <BookingStatusBadge status={booking.status} />
              <PaymentStatusBadge status={booking.paymentStatus} />
            </div>
          </div>

          <dl className="mt-4 grid gap-x-5 gap-y-3 text-xs text-muted-foreground sm:grid-cols-2">
            <div className="flex min-w-0 items-start gap-2">
              <UserRound
                className="mt-0.5 size-3.5 shrink-0"
                aria-hidden="true"
              />
              <dt className="sr-only">Customer</dt>
              <dd className="min-w-0">
                <span className="block truncate font-medium text-foreground">
                  {booking.customerName}
                </span>
                <span className="mt-0.5 flex min-w-0 items-center gap-1">
                  <Mail className="size-3 shrink-0" aria-hidden="true" />
                  <span className="truncate">{booking.customerEmail}</span>
                </span>
              </dd>
            </div>

            <div className="flex min-w-0 items-start gap-2">
              <Wrench className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />
              <dt className="sr-only">Technician</dt>
              <dd className="min-w-0">
                <span className="block truncate font-medium text-foreground">
                  {booking.technicianName}
                </span>
                <span className="mt-0.5 flex min-w-0 items-center gap-1">
                  <Mail className="size-3 shrink-0" aria-hidden="true" />
                  <span className="truncate">{booking.technicianEmail}</span>
                </span>
              </dd>
            </div>

            <div className="flex min-w-0 items-center gap-2">
              <CalendarClock
                className="size-3.5 shrink-0"
                aria-hidden="true"
              />
              <dt className="sr-only">Booking date</dt>
              <dd className="truncate">
                {formatDateTime(booking.preferredDate)}
              </dd>
            </div>

            {booking.customerPhone ? (
              <div className="flex min-w-0 items-center gap-2">
                <Phone className="size-3.5 shrink-0" aria-hidden="true" />
                <dt className="sr-only">Customer phone</dt>
                <dd className="truncate">{booking.customerPhone}</dd>
              </div>
            ) : null}

            <div className="flex min-w-0 items-start gap-2 sm:col-span-2">
              <MapPin
                className="mt-0.5 size-3.5 shrink-0"
                aria-hidden="true"
              />
              <dt className="sr-only">Address</dt>
              <dd className="min-w-0 break-words">{booking.address}</dd>
            </div>
          </dl>

          <p className="mt-3 line-clamp-2 text-sm leading-6 text-muted-foreground">
            {booking.problemDescription}
          </p>

          <p className="mt-3 flex flex-wrap items-center gap-1.5 text-[11px] text-muted-foreground">
            <ReceiptText className="size-3.5 shrink-0" aria-hidden="true" />
            <span>Booking reference:</span>
            <span className="break-all font-mono text-foreground">
              {booking._id}
            </span>
          </p>
        </div>

        <div className="flex flex-col justify-between gap-4 border-t p-5 sm:col-span-2 lg:col-span-1 lg:min-w-52 lg:border-l lg:border-t-0">
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-1">
            <div>
              <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                Base price
              </p>
              <p className="mt-1 font-heading text-2xl font-bold text-primary">
                {formatCurrency(booking.basePrice)}
              </p>
            </div>
            <div>
              <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                Final amount
              </p>
              <p className="mt-1 font-heading text-xl font-bold">
                {formatCurrency(booking.finalAmount)}
              </p>
            </div>
          </div>

          <p className="text-[11px] leading-4 text-muted-foreground">
            Payment status is updated by the payment workflow; admins cannot
            change it here.
          </p>
        </div>
      </div>
    </article>
  );
}

export function AdminBookings() {
  const [bookings, setBookings] = React.useState<Booking[]>([]);
  const [total, setTotal] = React.useState(0);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [statusFilter, setStatusFilter] = React.useState<"all" | BookingStatus>(
    "all",
  );
  const [searchInput, setSearchInput] = React.useState("");
  const [search, setSearch] = React.useState("");
  const [refreshKey, setRefreshKey] = React.useState(0);

  React.useEffect(() => {
    let active = true;

    api.admin
      .bookings({
        status: statusFilter === "all" ? undefined : statusFilter,
        search: search || undefined,
      })
      .then((response) => {
        if (!active) return;
        setBookings(response.bookings);
        setTotal(response.totalBookings);
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
  }, [refreshKey, search, statusFilter]);

  const refresh = React.useCallback(() => {
    setLoading(true);
    setError(null);
    setRefreshKey((current) => current + 1);
  }, []);

  const filterActive = statusFilter !== "all" || Boolean(search);

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
    setSearchInput("");
    setSearch("");
    setRefreshKey((current) => current + 1);
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Booking management"
        description="Monitor every FixMate booking with its service, customer, technician, schedule, amounts, and payment state."
        action={
          <Badge
            variant="outline"
            className="border-slate-200 bg-slate-50 text-slate-700"
          >
            <ShieldCheck aria-hidden="true" />
            Read-only view
          </Badge>
        }
      />

      <div className="rounded-2xl border bg-card p-4 shadow-sm">
        <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_11rem_auto]">
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
                placeholder="Search service, customer, technician, or email"
                aria-label="Search bookings by service, customer, technician, or email"
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
                setStatusFilter(value as "all" | BookingStatus);
              }
            }}
          >
            <SelectTrigger
              aria-label="Filter bookings by status"
              className="w-full"
            >
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
        <BookingsSkeleton />
      ) : error ? (
        <ErrorState
          title="Could not load bookings"
          message={error}
          onRetry={refresh}
        />
      ) : bookings.length === 0 ? (
        <EmptyState
          icon={ClipboardList}
          title={
            filterActive
              ? "No bookings match these filters"
              : "No bookings have been created yet"
          }
          description={
            filterActive
              ? "Try a different search term or status filter to find the booking you need."
              : "Customer bookings will appear here as soon as they are created for a service."
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
              {pluralize(total, "booking")}
              {filterActive ? " matching filters" : ""}
            </p>
            <p className="text-xs text-muted-foreground">
              Newest bookings appear first
            </p>
          </div>

          {bookings.map((booking) => (
            <AdminBookingCard key={booking._id} booking={booking} />
          ))}
        </div>
      )}

      <div className="rounded-xl border bg-secondary/50 p-4 text-xs leading-5 text-muted-foreground">
        <p className="flex items-center gap-2 font-semibold text-foreground">
          <ShieldCheck className="size-4 text-primary" aria-hidden="true" />
          Read-only admin view
        </p>
        <p className="mt-1.5">
          Booking status is managed by the customer and technician workflows,
          and payment status is set by the backend payment flow. This page never
          changes a booking or payment.
        </p>
      </div>
    </div>
  );
}
