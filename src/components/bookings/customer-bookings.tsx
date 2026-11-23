"use client";

import * as React from "react";
import Link from "next/link";
import { CalendarDays, ClipboardList, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import { CustomerBookingCard } from "@/components/bookings/customer-booking-card";
import { api, getErrorMessage } from "@/lib/api";
import { pluralize } from "@/lib/format";
import type { Booking } from "@/lib/types";
import { PageHeader } from "@/components/dashboard/page-header";

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
          <Skeleton className="m-5 h-28 rounded-xl lg:w-44" />
        </div>
      ))}
    </div>
  );
}

export function CustomerBookings() {
  const [bookings, setBookings] = React.useState<Booking[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const load = React.useCallback(() => {
    setLoading(true);
    setError(null);
    api.bookings
      .customer()
      .then((response) => setBookings(response.bookings))
      .catch((reason) => setError(getErrorMessage(reason)))
      .finally(() => setLoading(false));
  }, []);

  React.useEffect(() => {
    let active = true;

    api.bookings
      .customer()
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

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-9 w-52" />
          <Skeleton className="h-4 w-96 max-w-full" />
        </div>
        <BookingsSkeleton />
      </div>
    );
  }

  if (error) return <ErrorState message={error} onRetry={load} />;

  return (
    <div className="space-y-6">
      <PageHeader
        title="My bookings"
        description="Review every service request, check its status, and cancel a request while it is still waiting for the technician."
        action={
          <Button render={<Link href="/services" />}>
            <Plus aria-hidden="true" />
            Book a service
          </Button>
        }
      />

      {bookings.length === 0 ? (
        <EmptyState
          icon={ClipboardList}
          title="No bookings yet"
          description="Once you request a service, it will appear here with its schedule, technician, status, and amount."
          action={
            <Button render={<Link href="/services" />}>Find a service</Button>
          }
        />
      ) : (
        <div className="space-y-4">
          <Card>
            <CardHeader className="flex-row items-center justify-between border-b py-3">
              <CardTitle className="flex items-center gap-2 text-sm">
                <CalendarDays className="size-4 text-primary" aria-hidden="true" />
                {pluralize(bookings.length, "booking")}
              </CardTitle>
              <p className="text-xs text-muted-foreground">
                Newest requests appear first
              </p>
            </CardHeader>
            <CardContent className="p-3 sm:p-4">
              <div className="space-y-4">
                {bookings.map((booking) => (
                  <CustomerBookingCard
                    key={booking._id}
                    booking={booking}
                    onCancelled={load}
                  />
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
