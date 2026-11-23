import type { Metadata } from "next";
import { RequireAuth } from "@/components/auth/require-auth";
import { CustomerOverview } from "@/components/dashboard/customer/customer-overview";

export const metadata: Metadata = {
  title: "Customer overview",
  description:
    "Review your FixMate bookings, active jobs, completed work, and payment totals.",
};

export default function CustomerDashboardPage() {
  return (
    <RequireAuth role="customer">
      <CustomerOverview />
    </RequireAuth>
  );
}
