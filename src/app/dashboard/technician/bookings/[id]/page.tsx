import type { Metadata } from "next";
import { RequireAuth } from "@/components/auth/require-auth";
import { TechnicianBookingDetail } from "@/components/bookings/technician-booking-detail";

export const metadata: Metadata = {
  title: "Booking details",
  description:
    "Review the full details of a booking assigned to you and manage its status.",
};

export default async function TechnicianBookingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <RequireAuth role="technician">
      <TechnicianBookingDetail bookingId={id} />
    </RequireAuth>
  );
}
