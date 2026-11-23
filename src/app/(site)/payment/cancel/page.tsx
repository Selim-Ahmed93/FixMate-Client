import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowLeft,
  CalendarDays,
  ReceiptText,
  ShieldCheck,
  XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Checkout cancelled",
  description:
    "Your FixMate Stripe Checkout was cancelled or not completed. No payment status was changed.",
};

export default function PaymentCancelPage() {
  return (
    <section className="page-shell py-10 lg:py-16">
      <Card className="mx-auto max-w-2xl overflow-hidden shadow-sm">
        <div className="border-b bg-amber-50/70 px-6 py-8 text-center">
          <span className="mx-auto grid size-16 place-items-center rounded-full bg-amber-100 text-amber-800">
            <XCircle className="size-8" aria-hidden="true" />
          </span>
          <h1 className="mt-4 text-2xl font-bold">Checkout cancelled</h1>
          <p className="mt-1.5 text-sm leading-6 text-muted-foreground">
            Your Stripe Checkout was cancelled or not completed.
          </p>
        </div>

        <CardContent className="space-y-5 pt-6">
          <p className="text-sm leading-6 text-muted-foreground">
            FixMate has not received a payment confirmation for this attempt, so
            no booking or payment status was changed. This page never marks a
            payment as paid.
          </p>

          <div className="rounded-xl border bg-muted/30 p-4">
            <h2 className="text-sm font-semibold">Want to try again?</h2>
            <ol className="mt-2 list-decimal space-y-1.5 pl-5 text-sm leading-6 text-muted-foreground">
              <li>
                Open{" "}
                <Link
                  href="/dashboard/customer/bookings"
                  className="font-medium text-foreground underline-offset-4 hover:text-primary hover:underline"
                >
                  My bookings
                </Link>
                .
              </li>
              <li>
                Find a completed booking showing{" "}
                <span className="font-semibold text-amber-700">
                  payment due
                </span>
                .
              </li>
              <li>
                Choose <span className="font-semibold text-foreground">Pay Now</span>{" "}
                to start a new secure Stripe Checkout.
              </li>
            </ol>
          </div>

          <div className="rounded-xl border bg-secondary/50 p-4 text-xs leading-5 text-muted-foreground">
            <p className="flex items-center gap-2 font-semibold text-foreground">
              <ShieldCheck className="size-4 text-primary" aria-hidden="true" />
              Already completed a payment?
            </p>
            <p className="mt-1.5">
              If you finished a payment in another tab, check your payment
              history before retrying. Payment status is only updated after the
              backend verifies the Stripe session.
            </p>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
            <Button render={<Link href="/dashboard/customer/bookings" />}>
              <CalendarDays aria-hidden="true" />
              My bookings
            </Button>
            <Button
              variant="outline"
              render={<Link href="/dashboard/customer/payments" />}
            >
              <ReceiptText aria-hidden="true" />
              Payment history
            </Button>
            <Button variant="ghost" render={<Link href="/" />}>
              <ArrowLeft aria-hidden="true" />
              Back to home
            </Button>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
