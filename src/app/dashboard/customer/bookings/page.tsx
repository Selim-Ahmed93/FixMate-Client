import type { Metadata } from "next";
import { RequireAuth } from "@/components/auth/require-auth";
import { CustomerBookings } from "@/components/bookings/customer-bookings";

export const metadata: Metadata = {
  title: "My bookings",
  description:
    "View and manage your FixMate service bookings, statuses, and cancellation options.",
};

export default function CustomerBookingsPage() {
  return (
    <RequireAuth role="customer">
      <CustomerBookings />
    </RequireAuth>
  );
}
