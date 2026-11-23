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
import { CancelBookingDialog } from "@/components/bookings/cancel-booking-dialog";
import { PayNowButton } from "@/components/bookings/pay-now-button";
import {
  BookingStatusBadge,
  PaymentStatusBadge,
} from "@/components/dashboard/booking-status-badge";
import { api, getErrorMessage } from "@/lib/api";
import { bookingPayableAmount, isBookingPayable } from "@/lib/booking";
import {
  formatCurrency,
  formatDate,
  formatDateTime,
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
  icon: typeof MapPin;
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

export function CustomerBookingDetail({ bookingId }: { bookingId: string }) {
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
        <Button variant="ghost" size="sm" render={<Link href="/dashboard/customer/bookings" />}>
          <ArrowLeft aria-hidden="true" />
          All bookings
        </Button>
        <ErrorState
          title="Booking not available"
          message={
            error ??
            "This booking could not be found, or it does not belong to your account."
          }
          onRetry={load}
        />
      </div>
    );
  }

  const isCompleted = booking.status === "completed";
  const isPayable = isBookingPayable(booking);
  const displayAmount = isCompleted
    ? bookingPayableAmount(booking)
    : booking.basePrice;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Button variant="ghost" size="sm" render={<Link href="/dashboard/customer/bookings" />}>
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
                    <UserRound className="size-4 shrink-0" aria-hidden="true" />
                    {booking.technicianName}
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
              <CardTitle className="text-base">Booking details</CardTitle>
              <CardDescription>
                The information shared with your assigned technician.
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
                <DetailItem icon={Phone} label="Contact phone">
                  {booking.customerPhone || "Not provided"}
                </DetailItem>
                <DetailItem icon={CalendarDays} label="Requested on">
                  {formatDateTime(booking.createdAt)}
                </DetailItem>
                <DetailItem icon={Mail} label="Account email">
                  {booking.customerEmail}
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
              <CardTitle className="text-base">Assigned technician</CardTitle>
            </CardHeader>
            <CardContent className="flex items-start gap-3 pt-5">
              <span className="grid size-11 shrink-0 place-items-center rounded-full bg-secondary text-secondary-foreground">
                <UserRound className="size-5" aria-hidden="true" />
              </span>
              <div>
                <p className="font-semibold">{booking.technicianName}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  Contact and scheduling updates are handled through this
                  booking.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6 lg:sticky lg:top-24">
          <Card>
            <CardHeader className="border-b">
              <CardTitle className="text-base">
                {isCompleted ? "Completed amount" : "Booking amount"}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-5">
              <p className="font-heading text-4xl font-bold text-primary">
                {formatCurrency(displayAmount)}
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
                  <span className="font-medium">
                    {booking.finalAmount != null
                      ? formatCurrency(booking.finalAmount)
                      : "Set after completion"}
                  </span>
                </div>
                <Separator />
                <div className="flex items-center justify-between gap-3">
                  <span className="text-muted-foreground">Payment status</span>
                  <PaymentStatusBadge status={booking.paymentStatus} />
                </div>
              </div>

              {isPayable ? (
                <div className="mt-5 rounded-xl border border-amber-200 bg-amber-50/70 p-4">
                  <p className="flex items-center gap-2 text-sm font-semibold text-amber-900">
                    <CreditCard className="size-4" aria-hidden="true" />
                    Payment due
                  </p>
                  <p className="mt-1.5 text-xs leading-5 text-amber-900/80">
                    This booking is completed and unpaid. Pay{" "}
                    <strong>{formatCurrency(displayAmount)}</strong> securely
                    through Stripe Checkout. Your payment status updates after
                    the backend verifies the payment.
                  </p>
                  <PayNowButton bookingId={booking._id} className="mt-3" />
                </div>
              ) : null}

              {isCompleted && booking.paymentStatus === "paid" ? (
                <p className="mt-5 flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-xs font-medium text-emerald-900">
                  <CheckCircle2 className="size-4" aria-hidden="true" />
                  Payment received for this booking.
                </p>
              ) : null}

              {!isCompleted &&
              booking.status !== "cancelled" &&
              booking.status !== "rejected" ? (
                <p className="mt-5 rounded-lg border bg-muted/40 p-3 text-xs leading-5 text-muted-foreground">
                  Payment becomes available once the technician completes the
                  job and the final amount is recorded.
                </p>
              ) : null}

              {booking.status === "requested" ? (
                <div className="mt-5">
                  <CancelBookingDialog
                    bookingId={booking._id}
                    serviceTitle={booking.serviceTitle}
                    onCancelled={load}
                    className="w-full"
                  />
                  <p className="mt-2 text-center text-[11px] text-muted-foreground">
                    Cancellation is available only before the technician
                    accepts the request.
                  </p>
                </div>
              ) : null}
            </CardContent>
          </Card>

          <div className="rounded-xl border bg-secondary/50 p-4 text-xs leading-5 text-muted-foreground">
            <p className="flex items-center gap-2 font-semibold text-foreground">
              <ShieldCheck className="size-4 text-primary" aria-hidden="true" />
              Status is controlled by the backend
            </p>
            <p className="mt-1.5">
              This page reflects the latest booking status returned by FixMate.
              Refreshing after an update shows the current state.
            </p>
            <p className="mt-2">Requested {formatDate(booking.createdAt)}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
