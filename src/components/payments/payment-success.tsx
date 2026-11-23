"use client";

import * as React from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  AlertTriangle,
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  Loader2,
  ReceiptText,
  RotateCcw,
  ShieldAlert,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { PaymentStatusBadge } from "@/components/dashboard/booking-status-badge";
import { useSession } from "@/components/providers/session-provider";
import { api, getErrorMessage } from "@/lib/api";
import { dashboardPrefix } from "@/lib/config";
import { formatCurrency, formatDateTime } from "@/lib/format";
import type { Payment } from "@/lib/types";

const SESSION_ID_MAX_LENGTH = 200;

type VerificationState = "waiting" | "verifying" | "success" | "error";

function normalizeSessionId(value: string | null): string | null {
  if (!value) return null;
  const trimmed = value.trim();
  if (!trimmed || trimmed.length > SESSION_ID_MAX_LENGTH) return null;
  return trimmed;
}

function StatusCard({ children }: { children: React.ReactNode }) {
  return (
    <Card className="mx-auto max-w-2xl overflow-hidden shadow-sm">
      {children}
    </Card>
  );
}

function ResultActions({ bookingId }: { bookingId?: string }) {
  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
      {bookingId ? (
        <Button
          render={
            <Link href={`/dashboard/customer/bookings/${bookingId}`} />
          }
        >
          View booking
          <ArrowRight aria-hidden="true" />
        </Button>
      ) : null}
      <Button
        variant={bookingId ? "outline" : "default"}
        render={<Link href="/dashboard/customer/payments" />}
      >
        <ReceiptText aria-hidden="true" />
        Payment history
      </Button>
      <Button
        variant="ghost"
        render={<Link href="/dashboard/customer/bookings" />}
      >
        <CalendarDays aria-hidden="true" />
        My bookings
      </Button>
    </div>
  );
}

function LoadingCard({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <StatusCard>
      <CardContent
        role="status"
        aria-live="polite"
        className="flex flex-col items-center gap-4 px-6 py-14 text-center"
      >
        <span className="grid size-16 place-items-center rounded-full bg-secondary text-secondary-foreground">
          <Loader2 className="size-7 animate-spin" aria-hidden="true" />
        </span>
        <div>
          <h1 className="text-xl font-semibold">{title}</h1>
          <p className="mt-1.5 max-w-md text-sm leading-6 text-muted-foreground">
            {description}
          </p>
        </div>
      </CardContent>
    </StatusCard>
  );
}

export function PaymentSuccess() {
  const searchParams = useSearchParams();
  const sessionId = normalizeSessionId(searchParams.get("session_id"));
  const { user, status } = useSession();

  const [state, setState] = React.useState<VerificationState>("waiting");
  const [payment, setPayment] = React.useState<Payment | null>(null);
  const [message, setMessage] = React.useState<string | null>(null);
  const [alreadyProcessed, setAlreadyProcessed] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const requestedRef = React.useRef<string | null>(null);
  const mountedRef = React.useRef(true);

  React.useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const isCustomer = status === "authenticated" && user?.role === "customer";

  React.useEffect(() => {
    if (status === "loading") return;
    if (!isCustomer) return;
    if (!sessionId) return;
    if (requestedRef.current === sessionId) return;

    requestedRef.current = sessionId;

    api.payments
      .verify(sessionId)
      .then((response) => {
        if (!mountedRef.current || requestedRef.current !== sessionId) return;

        setPayment(response.payment);
        setMessage(response.message);
        setAlreadyProcessed(response.alreadyProcessed);
        setState("success");
      })
      .catch((reason) => {
        if (!mountedRef.current || requestedRef.current !== sessionId) return;

        requestedRef.current = null;
        setError(getErrorMessage(reason));
        setState("error");
      });
  }, [isCustomer, sessionId, status]);

  function handleRetry() {
    if (!sessionId || requestedRef.current === sessionId) return;

    requestedRef.current = sessionId;
    setError(null);
    setState("verifying");

    api.payments
      .verify(sessionId)
      .then((response) => {
        if (!mountedRef.current || requestedRef.current !== sessionId) return;

        setPayment(response.payment);
        setMessage(response.message);
        setAlreadyProcessed(response.alreadyProcessed);
        setState("success");
      })
      .catch((reason) => {
        if (!mountedRef.current || requestedRef.current !== sessionId) return;

        requestedRef.current = null;
        setError(getErrorMessage(reason));
        setState("error");
      });
  }

  const loginHref = `/login?next=${encodeURIComponent(
    sessionId
      ? `/payment/success?session_id=${encodeURIComponent(sessionId)}`
      : "/payment/success",
  )}`;

  if (status === "loading") {
    return (
      <LoadingCard
        title="Checking your session"
        description="We are confirming your FixMate account before verifying this payment."
      />
    );
  }

  if (!user) {
    return (
      <StatusCard>
        <CardContent className="flex flex-col items-center gap-5 px-6 py-12 text-center">
          <span className="grid size-16 place-items-center rounded-full bg-amber-100 text-amber-800">
            <ShieldAlert className="size-7" aria-hidden="true" />
          </span>
          <div>
            <h1 className="text-xl font-semibold">
              Sign in to verify this payment
            </h1>
            <p className="mt-1.5 max-w-md text-sm leading-6 text-muted-foreground">
              FixMate verifies Stripe payments against the customer account that
              booked the service. Sign in with that account, then return to this
              page.
            </p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Button render={<Link href={loginHref} />}>
              Sign in to continue
              <ArrowRight aria-hidden="true" />
            </Button>
            <Button variant="ghost" render={<Link href="/" />}>
              Back to home
            </Button>
          </div>
        </CardContent>
      </StatusCard>
    );
  }

  if (user.role !== "customer") {
    return (
      <StatusCard>
        <CardContent className="flex flex-col items-center gap-5 px-6 py-12 text-center">
          <span className="grid size-16 place-items-center rounded-full bg-amber-100 text-amber-800">
            <ShieldAlert className="size-7" aria-hidden="true" />
          </span>
          <div>
            <h1 className="text-xl font-semibold">Customer account required</h1>
            <p className="mt-1.5 max-w-md text-sm leading-6 text-muted-foreground">
              Payment verification is only available to customer accounts. You
              are signed in as a {user.role}.
            </p>
          </div>
          <Button render={<Link href={dashboardPrefix[user.role]} />}>
            Go to my dashboard
            <ArrowRight aria-hidden="true" />
          </Button>
        </CardContent>
      </StatusCard>
    );
  }

  if (!sessionId) {
    return (
      <StatusCard>
        <CardContent
          role="alert"
          className="flex flex-col items-center gap-5 px-6 py-12 text-center"
        >
          <span className="grid size-16 place-items-center rounded-full bg-amber-100 text-amber-800">
            <AlertTriangle className="size-7" aria-hidden="true" />
          </span>
          <div>
            <h1 className="text-xl font-semibold">
              Checkout session missing
            </h1>
            <p className="mt-1.5 max-w-md text-sm leading-6 text-muted-foreground">
              This page needs the Stripe <code className="font-mono">session_id</code>{" "}
              from your checkout return link. Open the link from your Stripe
              receipt, or check your payment history to confirm the payment
              status.
            </p>
          </div>
          <ResultActions />
        </CardContent>
      </StatusCard>
    );
  }

  if (state === "success" && payment) {
    return (
      <StatusCard>
        <div
          role="status"
          aria-live="polite"
          className="border-b bg-emerald-50/70 px-6 py-8 text-center"
        >
          <span className="mx-auto grid size-16 place-items-center rounded-full bg-emerald-100 text-emerald-800">
            <CheckCircle2 className="size-8" aria-hidden="true" />
          </span>
          <h1 className="mt-4 text-2xl font-bold">Payment verified</h1>
          <p className="mt-1.5 text-sm leading-6 text-muted-foreground">
            {message ?? "FixMate's backend confirmed this payment."}
          </p>
        </div>

        <CardContent className="space-y-5 pt-6">
          <div className="rounded-xl border bg-muted/30 p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                  Amount paid
                </p>
                <p className="mt-1 font-heading text-3xl font-bold text-primary">
                  {formatCurrency(payment.amount)}
                </p>
                <p className="text-[11px] uppercase text-muted-foreground">
                  {payment.currency ? payment.currency.toUpperCase() : "USD"}
                </p>
              </div>
              <PaymentStatusBadge status={payment.paymentStatus} />
            </div>

            <Separator className="my-4" />

            <dl className="grid gap-4 text-sm sm:grid-cols-2">
              <div>
                <dt className="text-[11px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
                  Service
                </dt>
                <dd className="mt-1 font-medium">{payment.serviceTitle}</dd>
              </div>
              <div>
                <dt className="text-[11px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
                  Paid on
                </dt>
                <dd className="mt-1">
                  {formatDateTime(payment.paidAt ?? payment.createdAt)}
                </dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="text-[11px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
                  Booking reference
                </dt>
                <dd className="mt-1">
                  <Link
                    href={`/dashboard/customer/bookings/${payment.bookingId}`}
                    className="break-all font-mono text-sm underline-offset-4 transition hover:text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    {payment.bookingId}
                  </Link>
                </dd>
              </div>
            </dl>
          </div>

          <dl className="grid gap-3 rounded-xl border p-4 text-[11px] sm:grid-cols-2">
            <div className="min-w-0">
              <dt className="font-semibold uppercase tracking-[0.1em] text-muted-foreground">
                Transaction ID
              </dt>
              <dd className="mt-1 break-all font-mono leading-5">
                {payment.transactionId || "Not available"}
              </dd>
            </div>
            <div className="min-w-0">
              <dt className="font-semibold uppercase tracking-[0.1em] text-muted-foreground">
                Stripe session
              </dt>
              <dd className="mt-1 break-all font-mono leading-5">
                {payment.stripeSessionId || "Not available"}
              </dd>
            </div>
          </dl>

          {alreadyProcessed ? (
            <p className="rounded-lg border border-sky-200 bg-sky-50 p-3 text-xs leading-5 text-sky-900">
              This checkout session was already verified earlier, so no duplicate
              payment was created.
            </p>
          ) : null}

          <div className="rounded-xl border bg-secondary/50 p-4 text-xs leading-5 text-muted-foreground">
            <p className="flex items-center gap-2 font-semibold text-foreground">
              <ShieldCheck className="size-4 text-primary" aria-hidden="true" />
              Confirmed by the backend
            </p>
            <p className="mt-1.5">
              This result came from FixMate&apos;s payment verification endpoint
              after Stripe confirmed the charge. The page never marks a payment
              as paid on its own.
            </p>
          </div>

          <ResultActions bookingId={payment.bookingId} />
        </CardContent>
      </StatusCard>
    );
  }

  if (state === "error") {
    return (
      <StatusCard>
        <CardContent
          role="alert"
          className="flex flex-col items-center gap-5 px-6 py-12 text-center"
        >
          <span className="grid size-16 place-items-center rounded-full bg-rose-100 text-rose-800">
            <AlertTriangle className="size-7" aria-hidden="true" />
          </span>
          <div>
            <h1 className="text-xl font-semibold">
              We couldn&apos;t verify this payment
            </h1>
            <p className="mt-1.5 max-w-md text-sm leading-6 text-rose-800">
              {error}
            </p>
            <p className="mt-2 max-w-md text-xs leading-5 text-muted-foreground">
              If Stripe shows the payment as complete, wait a moment and try
              again. Your payment history only lists records the backend has
              confirmed.
            </p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:justify-center">
            <Button onClick={handleRetry}>
              <RotateCcw aria-hidden="true" />
              Try verification again
            </Button>
            <Button
              variant="outline"
              render={<Link href="/dashboard/customer/payments" />}
            >
              <ReceiptText aria-hidden="true" />
              Payment history
            </Button>
            <Button
              variant="ghost"
              render={<Link href="/dashboard/customer/bookings" />}
            >
              <CalendarDays aria-hidden="true" />
              My bookings
            </Button>
          </div>
        </CardContent>
      </StatusCard>
    );
  }

  return (
    <LoadingCard
      title="Confirming your payment"
      description="We are asking FixMate's backend to verify this Stripe Checkout session. Please keep this page open."
    />
  );
}
