import type { Metadata } from "next";
import { RequireAuth } from "@/components/auth/require-auth";
import { TechnicianOverview } from "@/components/dashboard/technician/technician-overview";

export const metadata: Metadata = {
  title: "Technician overview",
  description:
    "Review your service listings, booking requests, active jobs, and completed work.",
};

export default function TechnicianDashboardPage() {
  return (
    <RequireAuth role="technician">
      <TechnicianOverview />
    </RequireAuth>
  );
}
