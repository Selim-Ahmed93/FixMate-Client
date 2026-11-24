import type { Metadata } from "next";
import { RequireAuth } from "@/components/auth/require-auth";
import { AdminPayments } from "@/components/dashboard/admin/admin-payments";

export const metadata: Metadata = {
  title: "Payment management",
  description:
    "Review Stripe payment records with booking references, customers, amounts, and transaction details.",
};

export default function AdminPaymentsPage() {
  return (
    <RequireAuth role="admin">
      <AdminPayments />
    </RequireAuth>
  );
}
