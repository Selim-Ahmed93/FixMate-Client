import type { Metadata } from "next";
import { RequireAuth } from "@/components/auth/require-auth";
import { CustomerBookingDetail } from "@/components/bookings/customer-booking-detail";

export const metadata: Metadata = {
  title: "Booking details",
  description:
    "Review the full details and cancellation options for your FixMate booking.",
};

export default async function CustomerBookingDetailPage({
  params,
}: PageProps<"/dashboard/customer/bookings/[id]">) {
  const { id } = await params;

  return (
    <RequireAuth role="customer">
      <CustomerBookingDetail bookingId={id} />
    </RequireAuth>
  );
}
