import type { Metadata } from "next";
import { Suspense } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { PaymentSuccess } from "@/components/payments/payment-success";

export const metadata: Metadata = {
  title: "Payment confirmation",
  description:
    "FixMate verifies your Stripe Checkout payment with the backend before confirming the result.",
};

function SuccessFallback() {
  return (
    <Card className="mx-auto max-w-2xl overflow-hidden shadow-sm">
      <CardContent
        aria-busy="true"
        aria-label="Loading payment confirmation"
        className="flex flex-col items-center gap-4 px-6 py-14"
      >
        <Skeleton className="size-16 rounded-full" />
        <Skeleton className="h-7 w-56" />
        <Skeleton className="h-4 w-80 max-w-full" />
      </CardContent>
    </Card>
  );
}

export default function PaymentSuccessPage() {
  return (
    <section className="page-shell py-10 lg:py-16">
      <Suspense fallback={<SuccessFallback />}>
        <PaymentSuccess />
      </Suspense>
    </section>
  );
}
