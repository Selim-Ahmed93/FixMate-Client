import type { Metadata } from "next";
import { RequireAuth } from "@/components/auth/require-auth";
import { AdminBookings } from "@/components/dashboard/admin/admin-bookings";

export const metadata: Metadata = {
  title: "Booking management",
  description:
    "Monitor FixMate bookings with service, customer, technician, schedule, amounts, and payment status.",
};

export default function AdminBookingsPage() {
  return (
    <RequireAuth role="admin">
      <AdminBookings />
    </RequireAuth>
  );
}
