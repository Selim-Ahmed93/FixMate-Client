import Link from "next/link";
import {
  ArrowRight,
  CalendarClock,
  MapPin,
  Phone,
  ReceiptText,
  UserRound,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatCurrency, formatDateTime } from "@/lib/format";
import type { Booking } from "@/lib/types";
import { ServiceImage } from "@/components/services/service-image";
import {
  BookingStatusBadge,
  PaymentStatusBadge,
} from "@/components/dashboard/booking-status-badge";
import { isBookingPayable } from "@/lib/booking";
import { CancelBookingDialog } from "./cancel-booking-dialog";
import { PayNowButton } from "./pay-now-button";

export function CustomerBookingCard({
  booking,
  onCancelled,
}: {
  booking: Booking;
  onCancelled: () => void | Promise<void>;
}) {
  const isCompleted = booking.status === "completed";
  const isPayable = isBookingPayable(booking);
  const displayedAmount = isCompleted
    ? (booking.finalAmount ?? booking.basePrice)
    : booking.basePrice;

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
                <Link
                  href={`/dashboard/customer/bookings/${booking._id}`}
                  className="rounded transition hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  {booking.serviceTitle}
                </Link>
              </h2>
            </div>
            <div className="flex flex-wrap gap-2">
              <BookingStatusBadge status={booking.status} />
              <PaymentStatusBadge status={booking.paymentStatus} />
            </div>
          </div>

          <dl className="mt-4 grid gap-x-5 gap-y-2 text-xs text-muted-foreground sm:grid-cols-2">
            <div className="flex min-w-0 items-center gap-2">
              <UserRound className="size-3.5 shrink-0" aria-hidden="true" />
              <dt className="sr-only">Technician</dt>
              <dd className="truncate">{booking.technicianName}</dd>
            </div>
            <div className="flex min-w-0 items-center gap-2">
              <CalendarClock className="size-3.5 shrink-0" aria-hidden="true" />
              <dt className="sr-only">Preferred date</dt>
              <dd className="truncate">
                {formatDateTime(booking.preferredDate)}
              </dd>
            </div>
            <div className="flex min-w-0 items-center gap-2 sm:col-span-2">
              <MapPin className="size-3.5 shrink-0" aria-hidden="true" />
              <dt className="sr-only">Address</dt>
              <dd className="truncate">{booking.address}</dd>
            </div>
            {booking.customerPhone ? (
              <div className="flex min-w-0 items-center gap-2">
                <Phone className="size-3.5 shrink-0" aria-hidden="true" />
                <dt className="sr-only">Contact phone</dt>
                <dd className="truncate">{booking.customerPhone}</dd>
              </div>
            ) : null}
            <div className="flex min-w-0 items-center gap-2">
              <ReceiptText className="size-3.5 shrink-0" aria-hidden="true" />
              <dt className="sr-only">Booked on</dt>
              <dd className="truncate">
                Booked {formatDateTime(booking.createdAt)}
              </dd>
            </div>
          </dl>

          <p className="mt-3 line-clamp-2 text-sm leading-6 text-muted-foreground">
            {booking.problemDescription}
          </p>
        </div>

        <div className="flex flex-col justify-between gap-4 border-t p-5 sm:col-span-2 lg:col-span-1 lg:min-w-52 lg:border-l lg:border-t-0">
          <div>
            <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
              {isCompleted ? "Final amount" : "Base price"}
            </p>
            <p className="mt-1 font-heading text-2xl font-bold text-primary">
              {formatCurrency(displayedAmount)}
            </p>
            {isCompleted && booking.finalAmount == null ? (
              <p className="mt-1 text-[11px] text-muted-foreground">
                Final amount is being finalized.
              </p>
            ) : null}
            {isPayable ? (
              <p className="mt-2 text-[11px] font-semibold text-amber-700">
                Completed · payment due
              </p>
            ) : null}
          </div>

          <div className="flex flex-wrap gap-2 lg:flex-col">
            {isPayable ? (
              <PayNowButton
                bookingId={booking._id}
                className="w-full min-w-40"
              />
            ) : null}
            <Button
              variant={isPayable ? "outline" : "default"}
              size="sm"
              render={
                <Link href={`/dashboard/customer/bookings/${booking._id}`} />
              }
            >
              View details
              <ArrowRight aria-hidden="true" />
            </Button>
            {booking.status === "requested" ? (
              <CancelBookingDialog
                bookingId={booking._id}
                serviceTitle={booking.serviceTitle}
                onCancelled={onCancelled}
                className="justify-center"
              />
            ) : null}
          </div>
        </div>
      </div>
    </article>
  );
}
