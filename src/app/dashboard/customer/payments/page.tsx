import type { Metadata } from "next";
import { RequireAuth } from "@/components/auth/require-auth";
import { CustomerPayments } from "@/components/payments/customer-payments";

export const metadata: Metadata = {
  title: "Payment history",
  description:
    "Review the payments recorded for your completed FixMate bookings, including amounts, dates, and Stripe references.",
};

export default function CustomerPaymentsPage() {
  return (
    <RequireAuth role="customer">
      <CustomerPayments />
    </RequireAuth>
  );
}
