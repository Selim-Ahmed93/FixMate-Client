"use client";

import * as React from "react";
import {
  CalendarClock,
  CreditCard,
  Mail,
  Search,
  ShieldCheck,
  UserRound,
  Wallet,
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
import { PaymentStatusBadge } from "@/components/dashboard/booking-status-badge";
import { api, getErrorMessage } from "@/lib/api";
import {
  formatCurrency,
  formatDateTime,
  paymentStatusLabels,
  pluralize,
} from "@/lib/format";
import type { Payment, PaymentStatus } from "@/lib/types";

const statusFilterItems: Array<{
  value: "all" | PaymentStatus;
  label: string;
}> = [
  { value: "all", label: "All statuses" },
  { value: "paid", label: paymentStatusLabels.paid },
  { value: "unpaid", label: paymentStatusLabels.unpaid },
];

function PaymentsSkeleton() {
  return (
    <div className="space-y-3" aria-busy="true" aria-label="Loading payments">
      {Array.from({ length: 4 }).map((_, index) => (
        <div key={index} className="rounded-2xl border bg-card p-5 shadow-sm">
          <div className="flex gap-3">
            <Skeleton className="size-11 shrink-0 rounded-xl" />
            <div className="min-w-0 flex-1 space-y-2">
              <Skeleton className="h-5 w-56 max-w-full" />
              <Skeleton className="h-4 w-72 max-w-full" />
              <Skeleton className="h-16 w-full rounded-xl" />
            </div>
            <Skeleton className="hidden h-16 w-32 sm:block" />
          </div>
        </div>
      ))}
    </div>
  );
}

function AdminPaymentCard({ payment }: { payment: Payment }) {
  const paidOn = payment.paidAt ?? payment.createdAt;

  return (
    <article className="rounded-2xl border bg-card p-5 shadow-sm transition hover:border-primary/20 hover:shadow-md hover:shadow-primary/5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex min-w-0 gap-3">
          <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-emerald-100 text-emerald-900">
            <CreditCard className="size-5" aria-hidden="true" />
          </span>

          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="truncate text-base font-semibold">
                {payment.serviceTitle}
              </h2>
              <PaymentStatusBadge status={payment.paymentStatus} />
              <Badge
                variant="outline"
                className="border-violet-200 bg-violet-50 text-violet-800"
              >
                <CreditCard aria-hidden="true" />
                Stripe
              </Badge>
            </div>

            <dl className="mt-3 grid gap-x-5 gap-y-3 text-xs text-muted-foreground sm:grid-cols-2">
              <div className="flex min-w-0 items-start gap-2">
                <UserRound
                  className="mt-0.5 size-3.5 shrink-0"
                  aria-hidden="true"
                />
                <dt className="sr-only">Customer</dt>
                <dd className="min-w-0">
                  <span className="block truncate font-medium text-foreground">
                    {payment.customerName}
                  </span>
                  <span className="mt-0.5 flex min-w-0 items-center gap-1">
                    <Mail className="size-3 shrink-0" aria-hidden="true" />
                    <span className="truncate">{payment.customerEmail}</span>
                  </span>
                </dd>
              </div>

              <div className="flex min-w-0 items-start gap-2">
                <Wrench
                  className="mt-0.5 size-3.5 shrink-0"
                  aria-hidden="true"
                />
                <dt className="sr-only">Technician</dt>
                <dd className="min-w-0">
                  <span className="block truncate font-medium text-foreground">
                    {payment.technicianName}
                  </span>
                  <span className="mt-0.5 flex min-w-0 items-center gap-1">
                    <Mail className="size-3 shrink-0" aria-hidden="true" />
                    <span className="truncate">{payment.technicianEmail}</span>
                  </span>
                </dd>
              </div>

              <div className="flex min-w-0 items-center gap-2 sm:col-span-2">
                <CalendarClock
                  className="size-3.5 shrink-0"
                  aria-hidden="true"
                />
                <dt className="sr-only">Payment date</dt>
                <dd className="truncate">
                  {paidOn
                    ? `Paid ${formatDateTime(paidOn)}`
                    : "Payment date unavailable"}
                </dd>
              </div>
            </dl>
          </div>
        </div>

        <div className="flex items-end justify-between gap-3 border-t pt-4 lg:min-w-44 lg:flex-col lg:items-end lg:border-t-0 lg:pt-0 lg:text-right">
          <div>
            <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
              {payment.paymentStatus === "paid" ? "Amount paid" : "Amount"}
            </p>
            <p className="mt-1 font-heading text-2xl font-bold text-primary">
              {formatCurrency(payment.amount)}
            </p>
            <p className="text-[11px] uppercase text-muted-foreground">
              {payment.currency ? payment.currency.toUpperCase() : "USD"}
            </p>
          </div>
        </div>
      </div>

      <dl className="mt-4 grid gap-3 rounded-xl border bg-muted/30 p-3 text-[11px] sm:grid-cols-2 lg:grid-cols-4">
        <div className="min-w-0">
          <dt className="font-semibold uppercase tracking-[0.1em] text-muted-foreground">
            Booking reference
          </dt>
          <dd className="mt-1 break-all font-mono leading-5">
            {payment.bookingId || "Not available"}
          </dd>
        </div>
        <div className="min-w-0">
          <dt className="font-semibold uppercase tracking-[0.1em] text-muted-foreground">
            Payment method
          </dt>
          <dd className="mt-1 leading-5">Stripe Checkout</dd>
        </div>
        <div className="min-w-0">
          <dt className="font-semibold uppercase tracking-[0.1em] text-muted-foreground">
            Transaction ID
          </dt>
          <dd className="mt-1 break-all font-mono leading-5">
            {payment.transactionId || "Not available"}
          </dd>
        </div>
        <div className="min-w-0">
          <dt className="font-semibold uppercase tracking-[0.1em] text-muted-foreground">
            Stripe session
          </dt>
          <dd className="mt-1 break-all font-mono leading-5">
            {payment.stripeSessionId || "Not available"}
          </dd>
        </div>
      </dl>
    </article>
  );
}

export function AdminPayments() {
  const [payments, setPayments] = React.useState<Payment[]>([]);
  const [total, setTotal] = React.useState(0);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [statusFilter, setStatusFilter] = React.useState<"all" | PaymentStatus>(
    "all",
  );
  const [searchInput, setSearchInput] = React.useState("");
  const [search, setSearch] = React.useState("");
  const [refreshKey, setRefreshKey] = React.useState(0);

  React.useEffect(() => {
    let active = true;

    api.payments
      .all({
        status: statusFilter === "all" ? undefined : statusFilter,
        search: search || undefined,
      })
      .then((response) => {
        if (!active) return;
        setPayments(response.payments);
        setTotal(response.totalPayments);
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
        title="Payment management"
        description="Review Stripe payment records with booking references, customers, amounts, and transaction details."
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
                placeholder="Search service, customer, technician, or transaction ID"
                aria-label="Search payments by service, customer, technician, or transaction ID"
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
                setStatusFilter(value as "all" | PaymentStatus);
              }
            }}
          >
            <SelectTrigger
              aria-label="Filter payments by status"
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
        <PaymentsSkeleton />
      ) : error ? (
        <ErrorState
          title="Could not load payments"
          message={error}
          onRetry={refresh}
        />
      ) : payments.length === 0 ? (
        <EmptyState
          icon={Wallet}
          title={
            filterActive
              ? "No payments match these filters"
              : "No payments recorded yet"
          }
          description={
            filterActive
              ? "Try a different search term or status filter. Payment records are created only after Stripe confirms and the backend verifies a charge."
              : "Payment records appear here after a customer completes Stripe Checkout for a completed booking."
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
        <div className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2 px-1 text-sm">
            <p className="font-medium" aria-live="polite">
              {pluralize(total, "payment")}
              {filterActive ? " matching filters" : ""}
            </p>
            <p className="text-xs text-muted-foreground">
              Newest payments appear first
            </p>
          </div>

          <div className="space-y-3">
            {payments.map((payment) => (
              <AdminPaymentCard key={payment._id} payment={payment} />
            ))}
          </div>
        </div>
      )}

      <div className="rounded-xl border bg-secondary/50 p-4 text-xs leading-5 text-muted-foreground">
        <p className="flex items-center gap-2 font-semibold text-foreground">
          <ShieldCheck className="size-4 text-primary" aria-hidden="true" />
          Read-only admin view
        </p>
        <p className="mt-1.5">
          Payment records come from the backend after Stripe verifies a charge.
          This page never initiates, verifies, refunds, or modifies a payment.
        </p>
      </div>
    </div>
  );
}
