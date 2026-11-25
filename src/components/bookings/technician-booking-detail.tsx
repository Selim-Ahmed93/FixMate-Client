"use client";

import * as React from "react";
import Link from "next/link";
import {
  ArrowLeft,
  CalendarClock,
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  CreditCard,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
  UserRound,
  type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { ErrorState } from "@/components/shared/error-state";
import { ServiceImage } from "@/components/services/service-image";
import {
  BookingStatusBadge,
  PaymentStatusBadge,
} from "@/components/dashboard/booking-status-badge";
import { BookingTransitionDialog } from "@/components/bookings/booking-transition-dialog";
import { CompleteBookingDialog } from "@/components/bookings/complete-booking-dialog";
import { api, getErrorMessage } from "@/lib/api";
import {
  formatCurrency,
  formatDate,
  formatDateTime,
  objectIdDate,
} from "@/lib/format";
import type { Booking } from "@/lib/types";

function DetailSkeleton() {
  return (
    <div className="space-y-6" aria-busy="true" aria-label="Loading booking">
      <Skeleton className="h-9 w-40" />
      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        <div className="space-y-6">
          <Skeleton className="h-72 rounded-2xl" />
          <Skeleton className="h-64 rounded-2xl" />
        </div>
        <Skeleton className="h-80 rounded-2xl" />
      </div>
    </div>
  );
}

function DetailItem({
  icon: Icon,
  label,
  children,
  className,
}: {
  icon: LucideIcon;
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <dt className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
        <Icon className="size-3.5" aria-hidden="true" />
        {label}
      </dt>
      <dd className="mt-1.5 text-sm leading-6">{children}</dd>
    </div>
  );
}

function BookingActions({
  booking,
  onUpdated,
}: {
  booking: Booking;
  onUpdated: () => void | Promise<void>;
}) {
  if (booking.status === "requested") {
    return (
      <Card>
        <CardHeader className="border-b">
          <CardTitle className="text-base">Respond to request</CardTitle>
          <CardDescription>
            Accept the job or reject the request. The customer sees the result
            immediately.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2 pt-5">
          <BookingTransitionDialog
            booking={booking}
            nextStatus="accepted"
            onUpdated={onUpdated}
            className="w-full"
          />
          <BookingTransitionDialog
            booking={booking}
            nextStatus="rejected"
            onUpdated={onUpdated}
            className="w-full"
          />
          <p className="pt-1 text-center text-[11px] leading-4 text-muted-foreground">
            Rejecting a request is permanent.
          </p>
        </CardContent>
      </Card>
    );
  }

  if (booking.status === "accepted") {
    return (
      <Card>
        <CardHeader className="border-b">
          <CardTitle className="text-base">Ready to start?</CardTitle>
          <CardDescription>
            Start the job when you begin work. The next step will be completion.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-5">
          <BookingTransitionDialog
            booking={booking}
            nextStatus="in-progress"
            onUpdated={onUpdated}
            className="w-full"
          />
        </CardContent>
      </Card>
    );
  }

  if (booking.status === "in-progress") {
    return (
      <Card>
        <CardHeader className="border-b">
          <CardTitle className="text-base">Finish the job</CardTitle>
          <CardDescription>
            Record the final amount to mark this booking as completed.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-5">
          <CompleteBookingDialog
            booking={booking}
            onCompleted={onUpdated}
            className="w-full"
          />
          <p className="mt-2 text-center text-[11px] leading-4 text-muted-foreground">
            Completion requires a positive final amount.
          </p>
        </CardContent>
      </Card>
    );
  }

  const terminalMessage =
    booking.status === "completed"
      ? "This job is complete. Payment is handled by the customer."
      : booking.status === "rejected"
        ? "You rejected this request. No further actions are available."
        : "The customer cancelled this request. No further actions are available.";

  return (
    <div className="rounded-xl border bg-secondary/50 p-4 text-xs leading-5 text-muted-foreground">
      <p className="flex items-center gap-2 font-semibold text-foreground">
        <ShieldCheck className="size-4 text-primary" aria-hidden="true" />
        No actions available
      </p>
      <p className="mt-1.5">{terminalMessage}</p>
    </div>
  );
}

export function TechnicianBookingDetail({ bookingId }: { bookingId: string }) {
  const [booking, setBooking] = React.useState<Booking | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const load = React.useCallback(() => {
    setLoading(true);
    setError(null);
    api.bookings
      .get(bookingId)
      .then((response) => setBooking(response.booking))
      .catch((reason) => setError(getErrorMessage(reason)))
      .finally(() => setLoading(false));
  }, [bookingId]);

  React.useEffect(() => {
    let active = true;

    api.bookings
      .get(bookingId)
      .then((response) => {
        if (active) setBooking(response.booking);
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
  }, [bookingId]);

  if (loading) return <DetailSkeleton />;

  if (error || !booking) {
    return (
      <div className="space-y-5">
        <Button
          variant="ghost"
          size="sm"
          render={<Link href="/dashboard/technician/bookings" />}
        >
          <ArrowLeft aria-hidden="true" />
          All bookings
        </Button>
        <ErrorState
          title="Booking not available"
          message={
            error ??
            "This booking could not be found, or it is not assigned to your technician account."
          }
          onRetry={load}
        />
      </div>
    );
  }

  const isCompleted = booking.status === "completed";
  const requestedOn = booking.createdAt ?? objectIdDate(booking._id);
  const finalAmount = booking.finalAmount ?? booking.basePrice;
  const finalAmountLabel = isCompleted
    ? formatCurrency(finalAmount)
    : booking.status === "rejected" || booking.status === "cancelled"
      ? "Not applicable"
      : "Set when you complete the job";

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Button
          variant="ghost"
          size="sm"
          render={<Link href="/dashboard/technician/bookings" />}
        >
          <ArrowLeft aria-hidden="true" />
          All bookings
        </Button>
        <p className="text-xs text-muted-foreground">
          Booking reference:{" "}
          <span className="font-mono text-foreground">{booking._id}</span>
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_340px] lg:items-start">
        <div className="space-y-6">
          <Card className="overflow-hidden">
            <div className="grid sm:grid-cols-[210px_1fr]">
              <div className="relative min-h-48 bg-muted">
                <ServiceImage
                  src={booking.serviceImage}
                  alt={booking.serviceTitle}
                  className="absolute inset-0 size-full"
                  eager
                />
              </div>
              <div className="p-5">
                <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                  {booking.category}
                </p>
                <h1 className="mt-1 text-2xl font-bold tracking-tight">
                  {booking.serviceTitle}
                </h1>
                <div className="mt-3 flex flex-wrap gap-2">
                  <BookingStatusBadge status={booking.status} />
                  <PaymentStatusBadge status={booking.paymentStatus} />
                </div>
                <div className="mt-5 grid gap-3 text-sm text-muted-foreground sm:grid-cols-2">
                  <p className="flex items-center gap-2">
                    <UserRound
                      className="size-4 shrink-0"
                      aria-hidden="true"
                    />
                    {booking.customerName}
                  </p>
                  <p className="flex items-center gap-2">
                    <CalendarClock
                      className="size-4 shrink-0"
                      aria-hidden="true"
                    />
                    {formatDateTime(booking.preferredDate)}
                  </p>
                </div>
              </div>
            </div>
          </Card>

          <Card>
            <CardHeader className="border-b">
              <CardTitle className="text-base">Job details</CardTitle>
              <CardDescription>
                The request information shared by the customer.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-5">
              <dl className="grid gap-6 sm:grid-cols-2">
                <DetailItem
                  icon={MapPin}
                  label="Service address"
                  className="sm:col-span-2"
                >
                  {booking.address}
                </DetailItem>
                <DetailItem icon={CalendarClock} label="Preferred date">
                  {formatDateTime(booking.preferredDate)}
                </DetailItem>
                <DetailItem icon={CalendarDays} label="Requested on">
                  {formatDateTime(requestedOn)}
                </DetailItem>
                <DetailItem icon={ClipboardList} label="Booking status">
                  <BookingStatusBadge status={booking.status} />
                </DetailItem>
                <DetailItem icon={CreditCard} label="Payment status">
                  <PaymentStatusBadge status={booking.paymentStatus} />
                </DetailItem>
                <div className="sm:col-span-2">
                  <dt className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
                    <ClipboardList
                      className="size-3.5"
                      aria-hidden="true"
                    />
                    Problem description
                  </dt>
                  <dd className="mt-2 whitespace-pre-line rounded-lg border bg-muted/35 p-4 text-sm leading-6">
                    {booking.problemDescription}
                  </dd>
                </div>
              </dl>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="border-b">
              <CardTitle className="text-base">Customer</CardTitle>
              <CardDescription>
                Contact details for coordinating this job.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-5">
              <div className="flex items-start gap-3">
                <span className="grid size-11 shrink-0 place-items-center rounded-full bg-secondary text-secondary-foreground">
                  <UserRound className="size-5" aria-hidden="true" />
                </span>
                <div className="min-w-0">
                  <p className="font-semibold">{booking.customerName}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    Customer
                  </p>
                </div>
              </div>
              <dl className="mt-4 grid gap-4 sm:grid-cols-2">
                <DetailItem icon={Mail} label="Email">
                  <span className="break-all">{booking.customerEmail}</span>
                </DetailItem>
                <DetailItem icon={Phone} label="Phone">
                  {booking.customerPhone || "Not provided"}
                </DetailItem>
              </dl>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6 lg:sticky lg:top-24">
          <BookingActions booking={booking} onUpdated={load} />

          <Card>
            <CardHeader className="border-b">
              <CardTitle className="text-base">
                {isCompleted ? "Completed amount" : "Booking amount"}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-5">
              <p className="font-heading text-4xl font-bold text-primary">
                {formatCurrency(
                  isCompleted ? finalAmount : booking.basePrice,
                )}
              </p>
              <div className="mt-4 space-y-2 text-sm">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-muted-foreground">Base price</span>
                  <span className="font-medium">
                    {formatCurrency(booking.basePrice)}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span className="text-muted-foreground">Final amount</span>
                  <span className="text-right font-medium">
                    {finalAmountLabel}
                  </span>
                </div>
                <Separator />
                <div className="flex items-center justify-between gap-3">
                  <span className="text-muted-foreground">
                    Payment status
                  </span>
                  <PaymentStatusBadge status={booking.paymentStatus} />
                </div>
              </div>

              {isCompleted && booking.paymentStatus === "unpaid" ? (
                <p className="mt-5 rounded-lg border bg-muted/40 p-3 text-xs leading-5 text-muted-foreground">
                  The final amount is recorded. Payment is handled by the
                  customer through FixMate; this page does not mark it as paid.
                </p>
              ) : null}

              {isCompleted && booking.paymentStatus === "paid" ? (
                <p className="mt-5 flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-xs font-medium text-emerald-900">
                  <CheckCircle2 className="size-4" aria-hidden="true" />
                  Payment received for this booking.
                </p>
              ) : null}

              {!isCompleted &&
              booking.status !== "rejected" &&
              booking.status !== "cancelled" ? (
                <p className="mt-5 rounded-lg border bg-muted/40 p-3 text-xs leading-5 text-muted-foreground">
                  The final amount is recorded when you complete the job.
                  Payment is handled separately by the customer.
                </p>
              ) : null}

              {booking.status === "rejected" ||
              booking.status === "cancelled" ? (
                <p className="mt-5 rounded-lg border bg-muted/40 p-3 text-xs leading-5 text-muted-foreground">
                  No payment applies to a {booking.status} booking.
                </p>
              ) : null}
            </CardContent>
          </Card>

          <div className="rounded-xl border bg-secondary/50 p-4 text-xs leading-5 text-muted-foreground">
            <p className="flex items-center gap-2 font-semibold text-foreground">
              <ShieldCheck className="size-4 text-primary" aria-hidden="true" />
              Status is controlled by the backend
            </p>
            <p className="mt-1.5">
              Only valid transitions are available for the current status. This
              page reloads the latest booking after each update.
            </p>
            <p className="mt-2">Requested {formatDate(requestedOn)}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
