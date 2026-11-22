"use client";

import * as React from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  CalendarCheck2,
  CheckCircle2,
  Clock3,
  MapPin,
  ShieldCheck,
  Wrench,
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { ErrorState } from "@/components/shared/error-state";
import { ServiceImage } from "@/components/services/service-image";
import { useSession } from "@/components/providers/session-provider";
import { api, getErrorMessage } from "@/lib/api";
import { formatCurrency, initials } from "@/lib/format";
import type { Service } from "@/lib/types";

function DetailSkeleton() {
  return (
    <div className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr]">
      <div className="space-y-6">
        <Skeleton className="aspect-[16/10] rounded-2xl" />
        <div className="space-y-3">
          <Skeleton className="h-9 w-3/4" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-4/5" />
        </div>
      </div>
      <Skeleton className="h-96 rounded-2xl" />
    </div>
  );
}

export function ServiceDetail({ id }: { id: string }) {
  const { user, status } = useSession();
  const [service, setService] = React.useState<Service | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const load = React.useCallback(() => {
    setLoading(true);
    setError(null);
    api.services
      .get(id)
      .then((response) => setService(response.service))
      .catch((reason) => setError(getErrorMessage(reason)))
      .finally(() => setLoading(false));
  }, [id]);

  React.useEffect(() => {
    let active = true;

    api.services
      .get(id)
      .then((response) => {
        if (active) setService(response.service);
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
  }, [id]);

  if (loading) {
    return (
      <div className="page-shell py-10 lg:py-14">
        <DetailSkeleton />
      </div>
    );
  }

  if (error || !service) {
    return (
      <div className="page-shell py-14">
        <ErrorState
          title="Service not available"
          message={
            error ??
            "This service may have been removed, made unavailable, or is awaiting approval."
          }
          onRetry={load}
        />
        <div className="mt-6 text-center">
          <Button variant="outline" render={<Link href="/services" />}>
            <ArrowLeft aria-hidden="true" />
            Back to services
          </Button>
        </div>
      </div>
    );
  }

  const bookingHref = `/services/${service._id}/book`;
  const canBook = user?.role === "customer";
  const loginHref = `/login?next=${encodeURIComponent(bookingHref)}`;

  return (
    <div className="page-shell py-8 lg:py-12">
      <nav aria-label="Breadcrumb" className="mb-6">
        <ol className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
          <li>
            <Link
              href="/"
              className="rounded transition hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              Home
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li>
            <Link
              href="/services"
              className="rounded transition hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              Services
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li className="max-w-56 truncate text-foreground">{service.title}</li>
        </ol>
      </nav>

      <div className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-start">
        <div>
          <div className="relative aspect-[16/10] overflow-hidden rounded-2xl border bg-muted shadow-sm">
            <ServiceImage
              src={service.image}
              alt={service.title}
              className="size-full"
              eager
            />
            <Badge className="absolute left-4 top-4 border-0 bg-background/95 text-foreground shadow-sm backdrop-blur">
              {service.category}
            </Badge>
          </div>

          <div className="mt-6">
            <div className="flex flex-wrap items-center gap-2">
              <Badge
                variant="outline"
                className="border-emerald-200 bg-emerald-50 text-emerald-800"
              >
                <BadgeCheck className="size-3.5" aria-hidden="true" />
                Approved & available
              </Badge>
              <span className="text-xs text-muted-foreground">
                Listed by a FixMate technician
              </span>
            </div>
            <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
              {service.title}
            </h1>
            <p className="mt-4 whitespace-pre-line text-base leading-7 text-muted-foreground">
              {service.description}
            </p>
          </div>

          <div className="mt-7 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              {
                icon: Clock3,
                label: "Estimated time",
                value: service.estimatedDuration,
              },
              {
                icon: Wrench,
                label: "Service mode",
                value: service.serviceMode,
              },
              {
                icon: MapPin,
                label: "Service area",
                value: service.serviceArea,
              },
              {
                icon: CalendarCheck2,
                label: "Booking",
                value: "Request first",
              },
            ].map((item) => (
              <div key={item.label} className="rounded-xl border bg-card p-3.5">
                <item.icon
                  className="size-4 text-primary"
                  aria-hidden="true"
                />
                <p className="mt-2 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                  {item.label}
                </p>
                <p className="mt-0.5 text-sm font-semibold">{item.value}</p>
              </div>
            ))}
          </div>

          <Card className="mt-6">
            <CardHeader className="border-b">
              <CardTitle className="flex items-center gap-2 text-base">
                <ShieldCheck className="size-5 text-primary" aria-hidden="true" />
                What happens next
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-5">
              {[
                "Send a booking request with your address, time, and problem details.",
                "The technician accepts or declines. If accepted, the job moves to in progress.",
                "Once completed, the technician records the final amount for you to review.",
                "Pay through Stripe only when the booking is completed and unpaid.",
              ].map((item) => (
                <div key={item} className="flex gap-3">
                  <CheckCircle2
                    className="mt-0.5 size-4 shrink-0 text-primary"
                    aria-hidden="true"
                  />
                  <p className="text-sm leading-6 text-muted-foreground">
                    {item}
                  </p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        <div className="lg:sticky lg:top-24">
          <Card className="border-primary/15 shadow-lg shadow-primary/5">
            <CardContent className="p-6">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                Starting price
              </p>
              <div className="mt-1 flex items-baseline gap-2">
                <span className="font-heading text-4xl font-bold text-primary">
                  {formatCurrency(service.basePrice)}
                </span>
                <span className="text-sm text-muted-foreground">
                  base price
                </span>
              </div>
              <p className="mt-2 text-xs leading-5 text-muted-foreground">
                The technician records a final amount after the work is
                complete. You will see it before paying.
              </p>

              <Separator className="my-5" />

              <div className="flex items-center gap-3">
                <Avatar size="lg">
                  <AvatarFallback className="bg-secondary font-semibold text-secondary-foreground">
                    {initials(service.technicianName)}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">
                    Your technician
                  </p>
                  <p className="truncate font-semibold">
                    {service.technicianName}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Contact details are used within the booking.
                  </p>
                </div>
              </div>

              <div className="mt-6">
                {status === "loading" ? (
                  <Skeleton className="h-11 w-full rounded-lg" />
                ) : canBook ? (
                  <Button
                    size="lg"
                    className="h-11 w-full"
                    render={<Link href={bookingHref} />}
                  >
                    Book this service
                    <ArrowRight aria-hidden="true" />
                  </Button>
                ) : user ? (
                  <div className="rounded-lg border bg-muted/50 p-3 text-center text-sm text-muted-foreground">
                    {user.role === "technician"
                      ? "Technician accounts manage services rather than book them."
                      : "Admin accounts review bookings from the admin dashboard."}
                  </div>
                ) : (
                  <Button
                    size="lg"
                    className="h-11 w-full"
                    render={<Link href={loginHref} />}
                  >
                    Sign in to book
                    <ArrowRight aria-hidden="true" />
                  </Button>
                )}
                <p className="mt-3 text-center text-xs text-muted-foreground">
                  You will review the request before it is sent.
                </p>
              </div>
            </CardContent>
          </Card>

          <div className="mt-4 rounded-xl border bg-secondary/50 p-4 text-sm">
            <p className="flex items-center gap-2 font-semibold">
              <ShieldCheck className="size-4 text-primary" aria-hidden="true" />
              Booking protection
            </p>
            <p className="mt-1.5 text-xs leading-5 text-muted-foreground">
              FixMate keeps payment status and service status on the backend.
              The frontend never marks a payment as paid on its own.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
