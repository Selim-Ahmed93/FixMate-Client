import type { Metadata } from "next";
import { RequireAuth } from "@/components/auth/require-auth";
import { AdminOverview } from "@/components/dashboard/admin/admin-overview";

export const metadata: Metadata = {
  title: "Admin overview",
  description:
    "Monitor FixMate accounts, service approvals, bookings, and recorded revenue.",
};

export default function AdminDashboardPage() {
  return (
    <RequireAuth role="admin">
      <AdminOverview />
    </RequireAuth>
  );
}
