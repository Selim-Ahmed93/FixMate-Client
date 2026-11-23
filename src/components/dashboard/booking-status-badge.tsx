import { cn } from "cn";
import {
  bookingStatusClass,
  bookingStatusLabels,
  paymentStatusClass,
  paymentStatusLabels,
} from "@/lib/format";
import type { BookingStatus, PaymentStatus } from "@/lib/types";

export function BookingStatusBadge({
  status,
  className,
}: {
  status: BookingStatus;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold",
        bookingStatusClass(status),
        className,
      )}
    >
      <span className="size-1.5 rounded-full bg-current" aria-hidden="true" />
      {bookingStatusLabels[status]}
    </span>
  );
}

export function PaymentStatusBadge({
  status,
  className,
}: {
  status: PaymentStatus;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold",
        paymentStatusClass(status),
        className,
      )}
    >
      <span className="size-1.5 rounded-full bg-current" aria-hidden="true" />
      {paymentStatusLabels[status]}
    </span>
  );
}
