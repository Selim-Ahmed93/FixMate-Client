import type { Booking } from "./types";

/**
 * Mirrors the backend checkout eligibility rule:
 * the booking must be completed and still unpaid.
 */
export function isBookingPayable(booking: Booking): boolean {
  return (
    booking.status === "completed" && booking.paymentStatus === "unpaid"
  );
}

export function bookingPayableAmount(booking: Booking): number {
  return booking.finalAmount ?? booking.basePrice;
}
