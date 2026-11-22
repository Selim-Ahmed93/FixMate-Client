import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { RequireAuth } from "@/components/auth/require-auth";
import { Skeleton } from "@/components/ui/skeleton";
import { BookingForm } from "./booking-form";

export const metadata: Metadata = {
  title: "Request a booking",
  description:
    "Send a booking request to a FixMate technician for the service you selected.",
};

export default async function BookServicePage({
  params,
}: PageProps<"/services/[id]/book">) {
  const { id } = await params;

  return (
    <div className="page-shell py-8 lg:py-12">
      <div className="mb-6">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">
          Book a service
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
          Tell the technician what you need.
        </h1>
        <p className="mt-2 max-w-2xl text-muted-foreground">
          Your request starts as <strong>Requested</strong>. Sign in as a
          customer to continue.{" "}
          <Link
            href="/login"
            className="font-medium text-primary hover:underline"
          >
            Need to sign in?
          </Link>
        </p>
      </div>
      <RequireAuth role="customer">
        <Suspense fallback={<Skeleton className="h-96 rounded-2xl" />}>
          <BookingForm serviceId={id} />
        </Suspense>
      </RequireAuth>
    </div>
  );
}
