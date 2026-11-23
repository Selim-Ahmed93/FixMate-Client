"use client";

import * as React from "react";
import Link from "next/link";
import {
  ArrowUpRight,
  CalendarDays,
  CreditCard,
  ReceiptText,
  ShieldCheck,
  UserRound,
  Wallet,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import { PageHeader } from "@/components/dashboard/page-header";
import { StatCard } from "@/components/dashboard/stat-card";
import { PaymentStatusBadge } from "@/components/dashboard/booking-status-badge";
import { api, getErrorMessage } from "@/lib/api";
import { formatCurrency, formatDateTime, pluralize } from "@/lib/format";
import type { Payment } from "@/lib/types";

function PaymentsSkeleton() {
  return (
    <div className="space-y-6" aria-busy="true" aria-label="Loading payments">
      <div className="space-y-2">
        <Skeleton className="h-9 w-56" />
        <Skeleton className="h-4 w-96 max-w-full" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Skeleton className="h-32 rounded-xl" />
        <Skeleton className="h-32 rounded-xl" />
      </div>
      <div className="overflow-hidden rounded-2xl border bg-card">
        <Skeleton className="h-16 rounded-none border-b" />
        <div className="divide-y">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="space-y-3 p-5">
              <Skeleton className="h-5 w-1/2" />
              <Skeleton className="h-4 w-2/3" />
              <Skeleton className="h-16 w-full rounded-xl" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function PaymentRow({ payment }: { payment: Payment }) {
  const paidOn = payment.paidAt ?? payment.createdAt;
  const bookingHref = `/dashboard/customer/bookings/${payment.bookingId}`;

  return (
    <li className="p-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex min-w-0 gap-3">
          <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-emerald-100 text-emerald-900">
            <ReceiptText className="size-5" aria-hidden="true" />
          </span>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <Link
                href={bookingHref}
                className="truncate text-sm font-semibold underline-offset-4 transition hover:text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                {payment.serviceTitle}
              </Link>
              <PaymentStatusBadge status={payment.paymentStatus} />
            </div>

            <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
              <span className="inline-flex min-w-0 items-center gap-1.5">
                <UserRound className="size-3.5 shrink-0" aria-hidden="true" />
                <span className="truncate">{payment.technicianName}</span>
              </span>
              <span className="inline-flex items-center gap-1.5">
                <CalendarDays className="size-3.5 shrink-0" aria-hidden="true" />
                {paidOn ? `Paid ${formatDateTime(paidOn)}` : "Payment date unavailable"}
              </span>
            </div>

            <p className="mt-2 flex flex-wrap items-center gap-1.5 text-[11px] text-muted-foreground">
              <span>Booking reference:</span>
              <Link
                href={bookingHref}
                className="break-all font-mono text-foreground underline-offset-4 transition hover:text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                {payment.bookingId}
              </Link>
            </p>
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
          <Button
            variant="outline"
            size="sm"
            render={<Link href={bookingHref} />}
          >
            View booking
            <ArrowUpRight aria-hidden="true" />
          </Button>
        </div>
      </div>

      <dl className="mt-4 grid gap-3 rounded-xl border bg-muted/30 p-3 text-[11px] sm:grid-cols-2">
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
    </li>
  );
}

export function CustomerPayments() {
  const [payments, setPayments] = React.useState<Payment[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const load = React.useCallback(() => {
    setLoading(true);
    setError(null);
    api.payments
      .history()
      .then((response) => setPayments(response.payments))
      .catch((reason) => setError(getErrorMessage(reason)))
      .finally(() => setLoading(false));
  }, []);

  React.useEffect(() => {
    let active = true;

    api.payments
      .history()
      .then((response) => {
        if (active) setPayments(response.payments);
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

  if (loading) return <PaymentsSkeleton />;
  if (error) return <ErrorState message={error} onRetry={load} />;

  const paidPayments = payments.filter(
    (payment) => payment.paymentStatus === "paid",
  );
  const totalPaid = paidPayments.reduce(
    (total, payment) => total + payment.amount,
    0,
  );
  const latestPayment = payments[0];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Payment history"
        description="Every payment recorded for your FixMate bookings, newest first, with the related booking and Stripe reference."
        action={
          <Button
            variant="outline"
            render={<Link href="/dashboard/customer/bookings" />}
          >
            My bookings
            <ArrowUpRight aria-hidden="true" />
          </Button>
        }
      />

      {payments.length === 0 ? (
        <EmptyState
          icon={CreditCard}
          title="No payments yet"
          description="Payments appear here after a completed booking is paid through Stripe Checkout. If a completed job is awaiting payment, you can start checkout from your bookings."
          action={
            <Button render={<Link href="/dashboard/customer/bookings" />}>
              View my bookings
            </Button>
          }
        />
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2">
            <StatCard
              label="Total paid"
              value={formatCurrency(totalPaid)}
              hint={`${pluralize(paidPayments.length, "payment")} recorded as paid.`}
              icon={Wallet}
              tone="emerald"
            />
            <StatCard
              label="Payment records"
              value={payments.length}
              hint={
                latestPayment
                  ? `Most recent payment: ${formatDateTime(
                      latestPayment.paidAt ?? latestPayment.createdAt,
                    )}.`
                  : "No payments recorded."
              }
              icon={ReceiptText}
              tone="teal"
            />
          </div>

          <Card className="overflow-hidden">
            <CardHeader className="border-b">
              <CardTitle className="text-base">Payment records</CardTitle>
              <CardDescription>
                {pluralize(payments.length, "payment")} returned by FixMate,
                ordered from newest to oldest.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <ul className="divide-y">
                {payments.map((payment) => (
                  <PaymentRow key={payment._id} payment={payment} />
                ))}
              </ul>
            </CardContent>
          </Card>

          <div className="rounded-xl border bg-secondary/50 p-4 text-xs leading-5 text-muted-foreground">
            <p className="flex items-center gap-2 font-semibold text-foreground">
              <ShieldCheck className="size-4 text-primary" aria-hidden="true" />
              Payment records come from the backend
            </p>
            <p className="mt-1.5">
              FixMate creates a payment record only after Stripe confirms and the
              backend verifies the charge. This page never marks a payment as
              paid on its own.
            </p>
          </div>
        </>
      )}
    </div>
  );
}
