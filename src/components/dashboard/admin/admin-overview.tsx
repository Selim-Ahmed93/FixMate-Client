"use client";

import * as React from "react";
import Link from "next/link";
import {
  Activity,
  ArrowRight,
  BadgeCheck,
  CheckCircle2,
  ClipboardList,
  Clock,
  CreditCard,
  DollarSign,
  ShieldCheck,
  UserRound,
  Users,
  Wallet,
  Wrench,
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
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import { PageHeader } from "@/components/dashboard/page-header";
import { StatCard } from "@/components/dashboard/stat-card";
import { api, getErrorMessage } from "@/lib/api";
import { formatCurrency, pluralize } from "@/lib/format";
import type { AdminStats } from "@/lib/types";

function OverviewSkeleton() {
  return (
    <div
      className="space-y-6"
      aria-busy="true"
      aria-label="Loading admin overview"
    >
      <div className="space-y-2">
        <Skeleton className="h-9 w-64" />
        <Skeleton className="h-4 w-96 max-w-full" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <Skeleton key={index} className="h-32 rounded-xl" />
        ))}
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        {Array.from({ length: 4 }).map((_, index) => (
          <Skeleton key={index} className="h-64 rounded-xl" />
        ))}
      </div>
    </div>
  );
}

function BreakdownRow({
  icon: Icon,
  label,
  value,
}: {
  icon: LucideIcon;
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-lg bg-muted/45 px-3 py-2.5">
      <dt className="flex items-center gap-2 text-sm text-muted-foreground">
        <Icon className="size-4 text-primary" aria-hidden="true" />
        {label}
      </dt>
      <dd className="text-sm font-semibold tabular-nums">{value}</dd>
    </div>
  );
}

export function AdminOverview() {
  const [stats, setStats] = React.useState<AdminStats | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [refreshKey, setRefreshKey] = React.useState(0);

  React.useEffect(() => {
    let active = true;

    api.admin
      .stats()
      .then((response) => {
        if (active) setStats(response.stats);
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
  }, [refreshKey]);

  const refresh = React.useCallback(() => {
    setLoading(true);
    setError(null);
    setRefreshKey((current) => current + 1);
  }, []);

  if (loading) return <OverviewSkeleton />;
  if (error || !stats) {
    return (
      <ErrorState
        title="Could not load platform statistics"
        message={error ?? "The admin statistics response was empty."}
        onRetry={refresh}
      />
    );
  }

  const noActivity =
    stats.totalUsers === 0 &&
    stats.totalServices === 0 &&
    stats.totalBookings === 0 &&
    stats.totalPayments === 0;

  const approvedShare =
    stats.totalServices > 0
      ? Math.round((stats.approvedServices / stats.totalServices) * 100)
      : 0;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Platform overview"
        description="Monitor accounts, service approvals, bookings, and recorded revenue across FixMate."
        action={
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              render={<Link href="/dashboard/admin/users" />}
            >
              <Users aria-hidden="true" />
              Manage users
            </Button>
            <Button
              size="sm"
              render={<Link href="/dashboard/admin/services" />}
            >
              <ShieldCheck aria-hidden="true" />
              Review services
            </Button>
          </div>
        }
      />

      {noActivity ? (
        <EmptyState
          icon={Activity}
          title="No platform activity yet"
          description="Once customers and technicians register, services are submitted, and bookings or payments are recorded, the platform statistics will appear here."
          action={
            <div className="flex flex-wrap justify-center gap-2">
              <Button render={<Link href="/dashboard/admin/users" />}>
                <Users aria-hidden="true" />
                View users
              </Button>
              <Button
                variant="outline"
                render={<Link href="/dashboard/admin/services" />}
              >
                <Wrench aria-hidden="true" />
                Review services
              </Button>
            </div>
          }
        />
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard
              label="Total users"
              value={stats.totalUsers}
              hint={`${stats.totalCustomers} customers · ${stats.totalTechnicians} technicians · ${stats.totalAdmins} admins`}
              icon={Users}
            />
            <StatCard
              label="Total services"
              value={stats.totalServices}
              hint={`${stats.pendingServices} pending · ${stats.approvedServices} approved`}
              icon={Wrench}
              tone="sky"
            />
            <StatCard
              label="Total bookings"
              value={stats.totalBookings}
              hint={`${stats.completedBookings} completed jobs`}
              icon={ClipboardList}
              tone="amber"
            />
            <StatCard
              label="Recorded revenue"
              value={formatCurrency(stats.totalRevenue)}
              hint={`${pluralize(stats.totalPayments, "paid payment")} recorded`}
              icon={Wallet}
              tone="emerald"
            />
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader className="border-b">
                <CardTitle className="text-base">User breakdown</CardTitle>
                <CardDescription>
                  Accounts by workspace role across the platform.
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-5">
                <dl className="space-y-2">
                  <BreakdownRow
                    icon={Users}
                    label="Total users"
                    value={stats.totalUsers}
                  />
                  <BreakdownRow
                    icon={UserRound}
                    label="Customers"
                    value={stats.totalCustomers}
                  />
                  <BreakdownRow
                    icon={Wrench}
                    label="Technicians"
                    value={stats.totalTechnicians}
                  />
                  <BreakdownRow
                    icon={ShieldCheck}
                    label="Admins"
                    value={stats.totalAdmins}
                  />
                </dl>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-4"
                  render={<Link href="/dashboard/admin/users" />}
                >
                  Manage user roles
                  <ArrowRight aria-hidden="true" />
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="border-b">
                <CardTitle className="text-base">Service approvals</CardTitle>
                <CardDescription>
                  Listings awaiting review and the current catalog coverage.
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-5">
                <dl className="space-y-2">
                  <BreakdownRow
                    icon={Wrench}
                    label="Total services"
                    value={stats.totalServices}
                  />
                  <BreakdownRow
                    icon={Clock}
                    label="Pending review"
                    value={stats.pendingServices}
                  />
                  <BreakdownRow
                    icon={BadgeCheck}
                    label="Approved"
                    value={stats.approvedServices}
                  />
                </dl>

                <div className="mt-4">
                  <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
                    <span>Approved share</span>
                    <span className="font-semibold tabular-nums">
                      {approvedShare}%
                    </span>
                  </div>
                  <div
                    className="mt-2 h-2 overflow-hidden rounded-full bg-muted"
                    role="progressbar"
                    aria-label="Approved services share"
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-valuenow={approvedShare}
                  >
                    <div
                      className="h-full rounded-full bg-emerald-500"
                      style={{ width: `${approvedShare}%` }}
                    />
                  </div>
                </div>

                {stats.pendingServices > 0 ? (
                  <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs leading-5 text-amber-950">
                    <p className="font-semibold">
                      {pluralize(stats.pendingServices, "service")} waiting for
                      review.
                    </p>
                    <Link
                      href="/dashboard/admin/services"
                      className="mt-1 inline-flex items-center gap-1 font-medium underline underline-offset-3"
                    >
                      Open approval queue
                      <ArrowRight className="size-3.5" aria-hidden="true" />
                    </Link>
                  </div>
                ) : (
                  <p className="mt-4 rounded-lg border bg-muted/40 p-3 text-xs leading-5 text-muted-foreground">
                    No service listings are currently waiting for review.
                  </p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="border-b">
                <CardTitle className="text-base">Bookings & payments</CardTitle>
                <CardDescription>
                  Completed work and the payments recorded against it.
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-5">
                <dl className="space-y-2">
                  <BreakdownRow
                    icon={ClipboardList}
                    label="Total bookings"
                    value={stats.totalBookings}
                  />
                  <BreakdownRow
                    icon={CheckCircle2}
                    label="Completed bookings"
                    value={stats.completedBookings}
                  />
                  <BreakdownRow
                    icon={CreditCard}
                    label="Paid payments"
                    value={stats.totalPayments}
                  />
                  <BreakdownRow
                    icon={DollarSign}
                    label="Recorded revenue"
                    value={formatCurrency(stats.totalRevenue)}
                  />
                </dl>
                <p className="mt-4 text-xs leading-5 text-muted-foreground">
                  Revenue is calculated from payments already marked as paid.
                  Unpaid completed bookings are not included.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="border-b">
                <CardTitle className="text-base">Admin actions</CardTitle>
                <CardDescription>
                  Jump to the areas that need the most attention.
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-5">
                <ul className="space-y-2">
                  <li>
                    <Link
                      href="/dashboard/admin/users"
                      className="flex items-center gap-3 rounded-lg border bg-card p-3 text-sm font-medium transition hover:border-primary/30 hover:bg-muted/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      <span className="grid size-9 place-items-center rounded-lg bg-secondary text-secondary-foreground">
                        <Users className="size-4" aria-hidden="true" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block">Manage users</span>
                        <span className="block text-xs font-normal text-muted-foreground">
                          Search accounts and update roles
                        </span>
                      </span>
                      <ArrowRight
                        className="size-4 text-muted-foreground"
                        aria-hidden="true"
                      />
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/dashboard/admin/services"
                      className="flex items-center gap-3 rounded-lg border bg-card p-3 text-sm font-medium transition hover:border-primary/30 hover:bg-muted/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      <span className="grid size-9 place-items-center rounded-lg bg-secondary text-secondary-foreground">
                        <ShieldCheck className="size-4" aria-hidden="true" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block">Review services</span>
                        <span className="block text-xs font-normal text-muted-foreground">
                          Approve or reject technician listings
                        </span>
                      </span>
                      <ArrowRight
                        className="size-4 text-muted-foreground"
                        aria-hidden="true"
                      />
                    </Link>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
