import type { Metadata } from "next";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";

export const metadata: Metadata = {
  title: {
    default: "Dashboard",
    template: "%s | FixMate Dashboard",
  },
  description: "Manage your FixMate bookings, services, payments, and profile.",
  robots: { index: false, follow: false },
};

export default function DashboardLayout({
  children,
}: LayoutProps<"/dashboard">) {
  return <DashboardShell>{children}</DashboardShell>;
}
