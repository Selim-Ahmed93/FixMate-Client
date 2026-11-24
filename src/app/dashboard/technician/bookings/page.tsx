import type { Metadata } from "next";
import { RequireAuth } from "@/components/auth/require-auth";
import { TechnicianBookings } from "@/components/bookings/technician-bookings";

export const metadata: Metadata = {
  title: "Bookings",
  description:
    "Review customer booking requests assigned to you and manage each job through its lifecycle.",
};

export default function TechnicianBookingsPage() {
  return (
    <RequireAuth role="technician">
      <TechnicianBookings />
    </RequireAuth>
  );
}
