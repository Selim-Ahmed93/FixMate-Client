import type { BookingStatus, PaymentStatus, Role } from "./types";

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 2,
});

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
});

const dateTimeFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
  hour: "numeric",
  minute: "2-digit",
});

export function formatCurrency(value: number | null | undefined): string {
  if (typeof value !== "number" || Number.isNaN(value)) return "—";
  return currencyFormatter.format(value);
}

export function formatDate(value?: string | null): string {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return dateFormatter.format(date);
}

export function formatDateTime(value?: string | null): string {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return dateTimeFormatter.format(date);
}

export function toDateTimeLocal(value?: string | Date): string {
  const date = value ? new Date(value) : new Date();
  if (Number.isNaN(date.getTime())) return "";
  const timezoneOffset = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - timezoneOffset).toISOString().slice(0, 16);
}

export function getMinimumBookingTime(): string {
  const date = new Date(Date.now() + 60 * 60 * 1000);
  return toDateTimeLocal(date);
}

export const roleLabels: Record<Role, string> = {
  customer: "Customer",
  technician: "Technician",
  admin: "Admin",
};

export const bookingStatusLabels: Record<BookingStatus, string> = {
  requested: "Requested",
  accepted: "Accepted",
  "in-progress": "In progress",
  completed: "Completed",
  rejected: "Rejected",
  cancelled: "Cancelled",
};

export const paymentStatusLabels: Record<PaymentStatus, string> = {
  paid: "Paid",
  unpaid: "Unpaid",
};

export function bookingStatusClass(status: BookingStatus): string {
  switch (status) {
    case "completed":
      return "border-emerald-200 bg-emerald-50 text-emerald-800";
    case "accepted":
      return "border-sky-200 bg-sky-50 text-sky-800";
    case "in-progress":
      return "border-amber-200 bg-amber-50 text-amber-900";
    case "cancelled":
    case "rejected":
      return "border-rose-200 bg-rose-50 text-rose-800";
    default:
      return "border-slate-200 bg-slate-50 text-slate-700";
  }
}

export function paymentStatusClass(status: PaymentStatus): string {
  return status === "paid"
    ? "border-emerald-200 bg-emerald-50 text-emerald-800"
    : "border-amber-200 bg-amber-50 text-amber-900";
}

export function initials(name?: string | null): string {
  if (!name) return "FM";
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

export function pluralize(
  count: number,
  singular: string,
  plural = `${singular}s`,
): string {
  return `${count} ${count === 1 ? singular : plural}`;
}
