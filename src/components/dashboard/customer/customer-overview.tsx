"use client";

import * as React from "react";
import Link from "next/link";
import {
  Activity,
  ArrowRight,
  CalendarClock,
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  CreditCard,
  MapPin,
  ReceiptText,
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
import { ServiceImage } from "@/components/services/service-image";
import { useSession } from "@/components/providers/session-provider";
import { api, getErrorMessage } from "@/lib/api";
import {
  formatCurrency,
  formatDate,
  formatDateTime,
  pluralize,
} from "@/lib/format";
import type { Booking, Payment } from "@/lib/types";
import { BookingStatusBadge } from "../booking-status-badge";
import { PageHeader } from "../page-header";
import { StatCard } from "../stat-card";

const activeStatuses = new Set(["requested", "accepted", "in-progress"]);

function OverviewSkeleton() {
  return (
    <div className="space-y-6" aria-busy="true" aria-label="Loading overview">
      <div className="space-y-2">
        <Skeleton className="h-9 w-64" />
        <Skeleton className="h-4 w-96 max-w-full" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <Skeleton key={index} className="h-32 rounded-xl" />
        ))}
      </div>
      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        <Skeleton className="h-96 rounded-xl" />
        <Skeleton className="h-96 rounded-xl" />
      </div>
    </div>
  );
}

export function CustomerOverview() {
  const { user } = useSession();
  const [bookings, setBookings] = React.useState<Booking[]>([]);
  const [payments, setPayments] = React.useState<Payment[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const load = React.useCallback(() => {
    setLoading(true);
    setError(null);
    Promise.all([api.bookings.customer(), api.payments.history()])
      .then(([bookingResponse, paymentResponse]) => {
        setBookings(bookingResponse.bookings);
        setPayments(paymentResponse.payments);
      })
      .catch((reason) => setError(getErrorMessage(reason)))
      .finally(() => setLoading(false));
  }, []);

  React.useEffect(() => {
    let active = true;

    Promise.all([api.bookings.customer(), api.payments.history()])
      .then(([bookingResponse, paymentResponse]) => {
        if (!active) return;
        setBookings(bookingResponse.bookings);
        setPayments(paymentResponse.payments);
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

  if (loading) return <OverviewSkeleton />;
  if (error) return <ErrorState message={error} onRetry={load} />;

  const activeBookings = bookings.filter((booking) =>
    activeStatuses.has(booking.status),
  );
  const completedBookings = bookings.filter(
    (booking) => booking.status === "completed",
  );
  const unpaidBookings = completedBookings.filter(
    (booking) => booking.paymentStatus === "unpaid",
  );
  const outstandingAmount = unpaidBookings.reduce(
    (total, booking) => total + (booking.finalAmount ?? 0),
    0,
  );
  const paidPayments = payments.filter(
    (payment) => payment.paymentStatus === "paid",
  );
  const paidTotal = paidPayments.reduce(
    (total, payment) => total + payment.amount,
    0,
  );
  const nextBooking = [...activeBookings].sort(
    (a, b) =>
      new Date(a.preferredDate).getTime() - new Date(b.preferredDate).getTime(),
  )[0];
  const recentBookings = bookings.slice(0, 5);
  const firstName = user?.name.split(" ")[0] ?? "there";

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Welcome back, ${firstName}`}
        description="Follow active jobs, review completed work, and keep an eye on what is ready to pay."
        action={
          <Button render={<Link href="/services" />}>
            Browse services
            <ArrowRight aria-hidden="true" />
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total bookings"
          value={bookings.length}
          hint="Every booking attached to your account."
          icon={CalendarDays}
        />
        <StatCard
          label="Active jobs"
          value={activeBookings.length}
          hint="Requested, accepted, or currently in progress."
          icon={Activity}
          tone="sky"
        />
        <StatCard
          label="Completed"
          value={completedBookings.length}
          hint="Jobs completed by your technician."
          icon={CheckCircle2}
          tone="emerald"
        />
        <StatCard
          label="Amount due"
          value={formatCurrency(outstandingAmount)}
          hint={
            unpaidBookings.length
              ? `${pluralize(unpaidBookings.length, "completed booking")} awaiting payment.`
              : "No completed bookings are awaiting payment."
          }
          icon={Wallet}
          tone="amber"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        <Card>
          <CardHeader className="flex-row items-center justify-between border-b">
            <div>
              <CardTitle>Recent bookings</CardTitle>
              <CardDescription>
                Your latest requests and their current status.
              </CardDescription>
            </div>
            <Button
              variant="ghost"
              size="sm"
              render={<Link href="/dashboard/customer/bookings" />}
            >
              View all
              <ArrowRight aria-hidden="true" />
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            {recentBookings.length === 0 ? (
              <div className="p-5">
                <EmptyState
                  icon={ClipboardList}
                  title="No bookings yet"
                  description="When you request a service, the booking will appear here with its technician, schedule, status, and payment details."
                  action={
                    <Button render={<Link href="/services" />}>
                      Find a service
                    </Button>
                  }
                  className="border-0 bg-transparent py-8"
                />
              </div>
            ) : (
              <ul className="divide-y">
                {recentBookings.map((booking) => (
                  <li
                    key={booking._id}
                    className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center"
                  >
                    <div className="flex min-w-0 flex-1 items-center gap-3">
                      <div className="size-14 shrink-0 overflow-hidden rounded-xl bg-muted">
                        <ServiceImage
                          src={booking.serviceImage}
                          alt={booking.serviceTitle}
                          className="size-full"
                        />
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold">
                          {booking.serviceTitle}
                        </p>
                        <p className="mt-0.5 truncate text-xs text-muted-foreground">
                          {booking.technicianName} ·{" "}
                          {formatDateTime(booking.preferredDate)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between gap-3 sm:justify-end">
                      <BookingStatusBadge status={booking.status} />
                      <p className="min-w-16 text-right text-sm font-semibold">
                        {formatCurrency(
                          booking.status === "completed"
                            ? (booking.finalAmount ?? booking.basePrice)
                            : booking.basePrice,
                        )}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader className="border-b">
              <CardTitle className="text-base">Next active job</CardTitle>
              <CardDescription>
                The nearest booking that still needs attention.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-5">
              {nextBooking ? (
                <div>
                  <div className="flex items-start gap-3">
                    <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-secondary text-secondary-foreground">
                      <CalendarClock className="size-5" aria-hidden="true" />
                    </span>
                    <div className="min-w-0">
                      <p className="truncate font-semibold">
                        {nextBooking.serviceTitle}
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {formatDateTime(nextBooking.preferredDate)}
                      </p>
                    </div>
                  </div>
                  <div className="mt-4 space-y-2 rounded-lg bg-muted/50 p-3 text-xs text-muted-foreground">
                    <p className="flex items-center gap-2">
                      <MapPin className="size-3.5 shrink-0" aria-hidden="true" />
                      <span className="truncate">{nextBooking.address}</span>
                    </p>
                    <p className="flex items-center gap-2">
                      <ReceiptText
                        className="size-3.5 shrink-0"
                        aria-hidden="true"
                      />
                      {nextBooking.technicianName}
                    </p>
                  </div>
                  <div className="mt-4 flex items-center justify-between gap-2">
                    <BookingStatusBadge status={nextBooking.status} />
                    <Link
                      href="/dashboard/customer/bookings"
                      className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
                    >
                      Manage
                      <ArrowRight className="size-3.5" aria-hidden="true" />
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="rounded-lg border border-dashed p-4 text-center">
                  <CalendarClock
                    className="mx-auto size-6 text-muted-foreground"
                    aria-hidden="true"
                  />
                  <p className="mt-2 text-sm font-medium">No active jobs</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Request a service when something needs fixing.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="border-b">
              <CardTitle className="text-base">Payment summary</CardTitle>
              <CardDescription>
                Totals come from your saved payment history.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-5">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Total paid
              </p>
              <p className="mt-1 font-heading text-3xl font-bold text-primary">
                {formatCurrency(paidTotal)}
              </p>
              <div className="mt-4 flex items-center justify-between rounded-lg bg-muted/50 px-3 py-2 text-xs">
                <span className="text-muted-foreground">Payments</span>
                <span className="font-semibold">
                  {pluralize(paidPayments.length, "payment")}
                </span>
              </div>
              {paidPayments[0] ? (
                <p className="mt-3 text-xs text-muted-foreground">
                  Last payment {formatDate(paidPayments[0].paidAt)} for{" "}
                  {paidPayments[0].serviceTitle}.
                </p>
              ) : (
                <p className="mt-3 text-xs text-muted-foreground">
                  Paid invoices will appear here after Stripe verification.
                </p>
              )}
              <Button
                variant="outline"
                className="mt-4 w-full"
                render={<Link href="/dashboard/customer/payments" />}
              >
                <CreditCard aria-hidden="true" />
                View payment history
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
