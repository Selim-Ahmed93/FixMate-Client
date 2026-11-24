import Link from "next/link";
import {
  ArrowRight,
  CalendarClock,
  Mail,
  MapPin,
  Phone,
  UserRound,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { BookingStatusBadge } from "@/components/dashboard/booking-status-badge";
import { ServiceImage } from "@/components/services/service-image";
import { formatCurrency, formatDateTime } from "@/lib/format";
import type { Booking } from "@/lib/types";

export function TechnicianBookingCard({ booking }: { booking: Booking }) {
  const isCompleted = booking.status === "completed";
  const isClosedWithoutCompletion =
    booking.status === "rejected" || booking.status === "cancelled";
  const displayedAmount = isCompleted
    ? (booking.finalAmount ?? booking.basePrice)
    : booking.basePrice;
  const detailHref = `/dashboard/technician/bookings/${booking._id}`;

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
                  href={detailHref}
                  className="rounded transition hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  {booking.serviceTitle}
                </Link>
              </h2>
            </div>
            <BookingStatusBadge status={booking.status} />
          </div>

          <dl className="mt-4 grid gap-x-5 gap-y-2 text-xs text-muted-foreground sm:grid-cols-2">
            <div className="flex min-w-0 items-center gap-2">
              <UserRound className="size-3.5 shrink-0" aria-hidden="true" />
              <dt className="sr-only">Customer</dt>
              <dd className="truncate font-medium text-foreground">
                {booking.customerName}
              </dd>
            </div>
            <div className="flex min-w-0 items-center gap-2">
              <Phone className="size-3.5 shrink-0" aria-hidden="true" />
              <dt className="sr-only">Customer phone</dt>
              <dd className="truncate">
                {booking.customerPhone || "Not provided"}
              </dd>
            </div>
            <div className="flex min-w-0 items-center gap-2">
              <Mail className="size-3.5 shrink-0" aria-hidden="true" />
              <dt className="sr-only">Customer email</dt>
              <dd className="truncate">{booking.customerEmail}</dd>
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
              <dt className="sr-only">Service address</dt>
              <dd className="truncate">{booking.address}</dd>
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
            {isCompleted ? (
              <p className="mt-1 text-[11px] text-muted-foreground">
                Base price {formatCurrency(booking.basePrice)}
              </p>
            ) : (
              <p className="mt-1 text-[11px] text-muted-foreground">
                {isClosedWithoutCompletion
                  ? "No final amount"
                  : "Final amount set on completion"}
              </p>
            )}
          </div>

          <Button
            variant={isCompleted ? "outline" : "default"}
            size="sm"
            className="justify-center"
            render={<Link href={detailHref} />}
          >
            View details
            <ArrowRight aria-hidden="true" />
          </Button>
        </div>
      </div>
    </article>
  );
}
