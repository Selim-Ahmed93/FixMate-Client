"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  CalendarClock,
  CheckCircle2,
  Info,
  Loader2,
  MapPin,
  Phone,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { ErrorState } from "@/components/shared/error-state";
import { ServiceImage } from "@/components/services/service-image";
import { useSession } from "@/components/providers/session-provider";
import { useToast } from "@/components/providers/toast-provider";
import { api, getErrorMessage } from "@/lib/api";
import {
  formatCurrency,
  getMinimumBookingTime,
} from "@/lib/format";
import type { Service } from "@/lib/types";

export function BookingForm({ serviceId }: { serviceId: string }) {
  const router = useRouter();
  const { user } = useSession();
  const { toast } = useToast();
  const [service, setService] = React.useState<Service | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [loadError, setLoadError] = React.useState<string | null>(null);
  const [phone, setPhone] = React.useState(user?.phone ?? "");
  const [address, setAddress] = React.useState("");
  const [preferredDate, setPreferredDate] = React.useState("");
  const [problemDescription, setProblemDescription] = React.useState("");
  const [submitting, setSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const load = React.useCallback(() => {
    setLoading(true);
    setLoadError(null);
    api.services
      .get(serviceId)
      .then((response) => setService(response.service))
      .catch((reason) => setLoadError(getErrorMessage(reason)))
      .finally(() => setLoading(false));
  }, [serviceId]);

  React.useEffect(() => {
    let active = true;

    api.services
      .get(serviceId)
      .then((response) => {
        if (active) setService(response.service);
      })
      .catch((reason) => {
        if (active) setLoadError(getErrorMessage(reason));
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [serviceId]);

  const minimumDate = getMinimumBookingTime();

  function validate(): string | null {
    if (phone.trim() && phone.replace(/\D/g, "").length < 7) {
      return "Enter a valid phone number with at least 7 digits.";
    }
    if (address.trim().length < 5) {
      return "Enter the full service address (at least 5 characters).";
    }
    if (!preferredDate) return "Choose a preferred date and time.";
    const selected = new Date(preferredDate);
    if (Number.isNaN(selected.getTime())) return "Choose a valid date and time.";
    if (selected.getTime() <= Date.now()) {
      return "The preferred time must be in the future.";
    }
    if (problemDescription.trim().length < 5) {
      return "Describe the problem in at least 5 characters.";
    }
    return null;
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setSubmitting(true);
    try {
      const response = await api.bookings.create({
        serviceId,
        ...(phone.trim() ? { customerPhone: phone.trim() } : {}),
        address: address.trim(),
        preferredDate: new Date(preferredDate).toISOString(),
        problemDescription: problemDescription.trim(),
      });
      toast({
        title: "Booking requested",
        description:
          "The technician can now accept or decline your request from their dashboard.",
      });
      router.push(`/dashboard/customer/bookings/${response.bookingId}`);
    } catch (reason) {
      const message = getErrorMessage(reason);
      setError(message);
      toast({
        title: "Could not create booking",
        description: message,
        variant: "error",
      });
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="grid gap-8 lg:grid-cols-[1fr_0.75fr]">
        <div className="space-y-4">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-96 rounded-2xl" />
        </div>
        <Skeleton className="h-80 rounded-2xl" />
      </div>
    );
  }

  if (loadError || !service) {
    return (
      <ErrorState
        title="Service not available"
        message={loadError ?? "This service cannot be booked right now."}
        onRetry={load}
      />
    );
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_0.75fr] lg:items-start">
      <div>
        <Button variant="ghost" size="sm" render={<Link href={`/services/${service._id}`} />}>
          <ArrowLeft aria-hidden="true" />
          Back to service
        </Button>

        <Card className="mt-5">
          <CardHeader className="border-b">
            <CardTitle className="text-xl">Request this booking</CardTitle>
            <CardDescription>
              The technician will review your request before the job is
              confirmed. Nothing is charged at this stage.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-5" noValidate>
              {error ? (
                <div
                  role="alert"
                  className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-800"
                >
                  {error}
                </div>
              ) : null}

              <div className="space-y-2">
                <Label htmlFor="booking-phone">
                  Contact phone{" "}
                  <span className="font-normal text-muted-foreground">
                    (optional)
                  </span>
                </Label>
                <div className="relative">
                  <Phone
                    className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                    aria-hidden="true"
                  />
                  <Input
                    id="booking-phone"
                    type="tel"
                    autoComplete="tel"
                    value={phone}
                    onChange={(event) => setPhone(event.target.value)}
                    placeholder="+880 17 1234 5678"
                    className="h-10 pl-9"
                    maxLength={25}
                    disabled={submitting}
                  />
                </div>
                <p className="field-help">
                  If left blank, the backend uses the phone number on your
                  profile.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="booking-address">Service address</Label>
                <div className="relative">
                  <MapPin
                    className="pointer-events-none absolute left-3 top-3 size-4 text-muted-foreground"
                    aria-hidden="true"
                  />
                  <Textarea
                    id="booking-address"
                    autoComplete="street-address"
                    value={address}
                    onChange={(event) => setAddress(event.target.value)}
                    placeholder="House, road, area, city"
                    className="min-h-24 pl-9"
                    required
                    minLength={5}
                    maxLength={500}
                    disabled={submitting}
                  />
                </div>
                <p className="field-help">{address.length}/500 characters</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="booking-date">Preferred date and time</Label>
                <div className="relative">
                  <CalendarClock
                    className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                    aria-hidden="true"
                  />
                  <Input
                    id="booking-date"
                    type="datetime-local"
                    value={preferredDate}
                    onChange={(event) => setPreferredDate(event.target.value)}
                    min={minimumDate}
                    className="h-10 pl-9"
                    required
                    disabled={submitting}
                  />
                </div>
                <p className="field-help">
                  Choose a time that works for you. The technician can follow up
                  if it needs adjusting.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="booking-problem">What needs fixing?</Label>
                <Textarea
                  id="booking-problem"
                  value={problemDescription}
                  onChange={(event) =>
                    setProblemDescription(event.target.value)
                  }
                  placeholder="Describe the symptoms, when they started, and anything the technician should bring."
                  className="min-h-32"
                  required
                  minLength={5}
                  maxLength={1000}
                  disabled={submitting}
                />
                <p className="field-help">
                  {problemDescription.length}/1000 characters
                </p>
              </div>

              <Button
                type="submit"
                size="lg"
                className="h-11 w-full sm:w-auto"
                disabled={submitting}
              >
                {submitting ? (
                  <Loader2 className="animate-spin" aria-hidden="true" />
                ) : (
                  <ArrowRight aria-hidden="true" />
                )}
                {submitting ? "Sending request…" : "Send booking request"}
              </Button>

              <p className="flex items-start gap-2 text-xs leading-5 text-muted-foreground">
                <ShieldCheck
                  className="mt-0.5 size-4 shrink-0 text-primary"
                  aria-hidden="true"
                />
                Your request is tied to your customer account. The backend
                checks ownership and blocks duplicate active bookings for the
                same service.
              </p>
            </form>
          </CardContent>
        </Card>
      </div>

      <div className="lg:sticky lg:top-24">
        <Card className="overflow-hidden">
          <div className="relative aspect-[16/9] bg-muted">
            <ServiceImage
              src={service.image}
              alt={service.title}
              className="size-full"
            />
          </div>
          <CardContent className="p-5">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              {service.category}
            </p>
            <h2 className="mt-1 text-lg font-semibold">{service.title}</h2>
            <p className="mt-2 line-clamp-3 text-sm leading-6 text-muted-foreground">
              {service.description}
            </p>
            <div className="mt-4 flex items-end justify-between border-t pt-4">
              <div>
                <p className="text-xs text-muted-foreground">Starting price</p>
                <p className="font-heading text-2xl font-bold text-primary">
                  {formatCurrency(service.basePrice)}
                </p>
              </div>
              <div className="text-right text-xs text-muted-foreground">
                <p>{service.estimatedDuration}</p>
                <p>{service.serviceMode}</p>
              </div>
            </div>
            <div className="mt-4 rounded-lg bg-secondary/60 p-3 text-sm">
              <p className="font-medium">{service.technicianName}</p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Serves {service.serviceArea}
              </p>
            </div>
            <div className="mt-4 flex items-start gap-2 text-xs leading-5 text-muted-foreground">
              <Info className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
              Final pricing is set by the technician when the job is complete.
              You review it before payment.
            </div>
          </CardContent>
        </Card>

        <div className="mt-4 flex items-start gap-2 rounded-xl border bg-emerald-50 p-4 text-xs leading-5 text-emerald-900">
          <CheckCircle2 className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          Only completed and unpaid bookings become eligible for Stripe
          Checkout.
        </div>
      </div>
    </div>
  );
}
