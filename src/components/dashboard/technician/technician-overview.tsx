"use client";

import * as React from "react";
import {
  Activity,
  BadgeCheck,
  CalendarClock,
  CheckCircle2,
  ClipboardList,
  Clock,
  Inbox,
  MapPin,
  UserRound,
  Wrench,
} from "lucide-react";
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
import { formatCurrency, formatDateTime, pluralize } from "@/lib/format";
import type { ApprovalStatus, Booking, Service } from "@/lib/types";
import { BookingStatusBadge } from "../booking-status-badge";
import { PageHeader } from "../page-header";
import { StatCard } from "../stat-card";

const approvalLabels: Record<ApprovalStatus, string> = {
  pending: "Pending review",
  approved: "Approved",
  rejected: "Rejected",
};

const approvalDots: Record<ApprovalStatus, string> = {
  pending: "bg-amber-500",
  approved: "bg-emerald-500",
  rejected: "bg-rose-500",
};

function OverviewSkeleton() {
  return (
    <div
      className="space-y-6"
      aria-busy="true"
      aria-label="Loading technician overview"
    >
      <div className="space-y-2">
        <Skeleton className="h-9 w-64" />
        <Skeleton className="h-4 w-96 max-w-full" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <Skeleton key={index} className="h-32 rounded-xl" />
        ))}
      </div>
      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        <Skeleton className="h-96 rounded-xl" />
        <div className="space-y-6">
          <Skeleton className="h-56 rounded-xl" />
          <Skeleton className="h-64 rounded-xl" />
        </div>
      </div>
    </div>
  );
}

function RecentBookingRow({ booking }: { booking: Booking }) {
  const amount =
    booking.status === "completed"
      ? (booking.finalAmount ?? booking.basePrice)
      : booking.basePrice;

  return (
    <li className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center">
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
          <p className="mt-0.5 flex items-center gap-1.5 text-xs text-muted-foreground">
            <UserRound className="size-3.5 shrink-0" aria-hidden="true" />
            <span className="truncate">
              {booking.customerName} · {booking.customerEmail}
            </span>
          </p>
          <p className="mt-0.5 flex items-center gap-1.5 text-xs text-muted-foreground">
            <CalendarClock
              className="size-3.5 shrink-0"
              aria-hidden="true"
            />
            {formatDateTime(booking.preferredDate)}
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between gap-3 sm:flex-col sm:items-end">
        <BookingStatusBadge status={booking.status} />
        <p className="text-sm font-semibold">{formatCurrency(amount)}</p>
      </div>
    </li>
  );
}

export function TechnicianOverview() {
  const { user } = useSession();
  const [services, setServices] = React.useState<Service[]>([]);
  const [bookings, setBookings] = React.useState<Booking[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const load = React.useCallback(() => {
    setLoading(true);
    setError(null);
    Promise.all([api.services.technician(), api.bookings.technician()])
      .then(([serviceResponse, bookingResponse]) => {
        setServices(serviceResponse.services);
        setBookings(bookingResponse.bookings);
      })
      .catch((reason) => setError(getErrorMessage(reason)))
      .finally(() => setLoading(false));
  }, []);

  React.useEffect(() => {
    let active = true;

    Promise.all([api.services.technician(), api.bookings.technician()])
      .then(([serviceResponse, bookingResponse]) => {
        if (!active) return;
        setServices(serviceResponse.services);
        setBookings(bookingResponse.bookings);
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

  const pendingServices = services.filter(
    (service) => service.approvalStatus === "pending",
  ).length;
  const approvedServices = services.filter(
    (service) => service.approvalStatus === "approved",
  ).length;
  const rejectedServices = services.filter(
    (service) => service.approvalStatus === "rejected",
  ).length;
  const requestedBookings = bookings.filter(
    (booking) => booking.status === "requested",
  ).length;
  const activeJobs = bookings.filter(
    (booking) =>
      booking.status === "accepted" || booking.status === "in-progress",
  );
  const completedJobs = bookings.filter(
    (booking) => booking.status === "completed",
  ).length;
  const nextJob = [...activeJobs].sort(
    (a, b) =>
      new Date(a.preferredDate).getTime() - new Date(b.preferredDate).getTime(),
  )[0];
  const recentBookings = bookings.slice(0, 5);
  const firstName = user?.name.split(" ")[0] ?? "there";

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Welcome back, ${firstName}`}
        description="Track your service listings, incoming booking requests, and the jobs currently on your schedule."
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard
          label="Total services"
          value={services.length}
          hint="Listings registered under your technician account."
          icon={Wrench}
        />
        <StatCard
          label="Pending services"
          value={pendingServices}
          hint="Awaiting admin review before appearing publicly."
          icon={Clock}
          tone="amber"
        />
        <StatCard
          label="Approved services"
          value={approvedServices}
          hint="Visible in the public catalog when available."
          icon={BadgeCheck}
          tone="emerald"
        />
        <StatCard
          label="Requested bookings"
          value={requestedBookings}
          hint="New customer requests waiting for your response."
          icon={Inbox}
          tone="sky"
        />
        <StatCard
          label="Active jobs"
          value={activeJobs.length}
          hint="Accepted or currently in-progress jobs."
          icon={Activity}
          tone="sky"
        />
        <StatCard
          label="Completed jobs"
          value={completedJobs}
          hint="Jobs finished and recorded on FixMate."
          icon={CheckCircle2}
          tone="emerald"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        <Card>
          <CardHeader className="border-b">
            <CardTitle>Recent activity</CardTitle>
            <CardDescription>
              Your latest booking requests and job updates from customers.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {recentBookings.length === 0 ? (
              <div className="p-5">
                <EmptyState
                  icon={ClipboardList}
                  title="No bookings yet"
                  description="When a customer books one of your approved services, the request will appear here with their preferred date and job details."
                  className="border-0 bg-transparent py-8"
                />
              </div>
            ) : (
              <ul className="divide-y">
                {recentBookings.map((booking) => (
                  <RecentBookingRow key={booking._id} booking={booking} />
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader className="border-b">
              <CardTitle className="text-base">Next scheduled job</CardTitle>
              <CardDescription>
                The active booking with the earliest preferred date.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-5">
              {nextJob ? (
                <div>
                  <div className="flex items-start gap-3">
                    <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-secondary text-secondary-foreground">
                      <CalendarClock className="size-5" aria-hidden="true" />
                    </span>
                    <div className="min-w-0">
                      <p className="truncate font-semibold">
                        {nextJob.serviceTitle}
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {formatDateTime(nextJob.preferredDate)}
                      </p>
                    </div>
                  </div>
                  <div className="mt-4 space-y-2 rounded-lg bg-muted/50 p-3 text-xs text-muted-foreground">
                    <p className="flex items-center gap-2">
                      <UserRound
                        className="size-3.5 shrink-0"
                        aria-hidden="true"
                      />
                      <span className="truncate">{nextJob.customerName}</span>
                    </p>
                    <p className="flex items-center gap-2">
                      <MapPin className="size-3.5 shrink-0" aria-hidden="true" />
                      <span className="truncate">{nextJob.address}</span>
                    </p>
                  </div>
                  <div className="mt-4 flex items-center justify-between gap-2">
                    <BookingStatusBadge status={nextJob.status} />
                    <p className="text-sm font-semibold">
                      {formatCurrency(
                        nextJob.finalAmount ?? nextJob.basePrice,
                      )}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="rounded-lg border border-dashed p-4 text-center">
                  <CalendarClock
                    className="mx-auto size-6 text-muted-foreground"
                    aria-hidden="true"
                  />
                  <p className="mt-2 text-sm font-medium">
                    No scheduled jobs
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Accepted and in-progress bookings will appear here.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="border-b">
              <CardTitle className="text-base">Service approvals</CardTitle>
              <CardDescription>
                Approval status for the listings on your account.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-5">
              <p className="font-heading text-3xl font-bold">
                {services.length}
              </p>
              <p className="text-xs text-muted-foreground">
                {pluralize(services.length, "service listing")}
              </p>

              <dl className="mt-4 space-y-2.5 rounded-lg bg-muted/50 p-3 text-xs">
                {(
                  [
                    ["pending", pendingServices],
                    ["approved", approvedServices],
                    ["rejected", rejectedServices],
                  ] as const
                ).map(([status, count]) => (
                  <div
                    key={status}
                    className="flex items-center justify-between gap-3"
                  >
                    <dt className="flex items-center gap-2">
                      <span
                        className={`size-2 rounded-full ${approvalDots[status]}`}
                        aria-hidden="true"
                      />
                      {approvalLabels[status]}
                    </dt>
                    <dd className="font-semibold tabular-nums">{count}</dd>
                  </div>
                ))}
              </dl>

              <p className="mt-3 text-xs leading-5 text-muted-foreground">
                Admins control approval. Only approved, available services
                appear in the public catalog.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
