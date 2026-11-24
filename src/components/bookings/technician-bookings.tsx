"use client";

import * as React from "react";
import { ClipboardList } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import { PageHeader } from "@/components/dashboard/page-header";
import { TechnicianBookingCard } from "@/components/bookings/technician-booking-card";
import { api, getErrorMessage } from "@/lib/api";
import { pluralize } from "@/lib/format";
import type { Booking } from "@/lib/types";

function BookingsSkeleton() {
  return (
    <div className="space-y-6" aria-busy="true" aria-label="Loading bookings">
      <div className="space-y-2">
        <Skeleton className="h-9 w-52" />
        <Skeleton className="h-4 w-96 max-w-full" />
      </div>
      <div className="space-y-4">
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
            <Skeleton className="m-5 h-28 rounded-xl lg:w-44" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function TechnicianBookings() {
  const [bookings, setBookings] = React.useState<Booking[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const load = React.useCallback(() => {
    setLoading(true);
    setError(null);
    api.bookings
      .technician()
      .then((response) => setBookings(response.bookings))
      .catch((reason) => setError(getErrorMessage(reason)))
      .finally(() => setLoading(false));
  }, []);

  React.useEffect(() => {
    let active = true;

    api.bookings
      .technician()
      .then((response) => {
        if (active) setBookings(response.bookings);
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

  if (loading) return <BookingsSkeleton />;
  if (error) return <ErrorState message={error} onRetry={load} />;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Bookings"
        description="Review customer requests assigned to you, contact customers, and move jobs through the booking lifecycle."
      />

      {bookings.length === 0 ? (
        <EmptyState
          icon={ClipboardList}
          title="No booking requests yet"
          description="When a customer books one of your approved services, the request will appear here with their contact details, schedule, and job description."
        />
      ) : (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2 px-1 text-sm">
            <p className="font-medium">
              {pluralize(bookings.length, "booking")}
            </p>
            <p className="text-xs text-muted-foreground">
              Newest requests appear first
            </p>
          </div>

          {bookings.map((booking) => (
            <TechnicianBookingCard key={booking._id} booking={booking} />
          ))}
        </div>
      )}
    </div>
  );
}
