import type { Metadata } from "next";
import { RequireAuth } from "@/components/auth/require-auth";
import { TechnicianServices } from "@/components/services/technician-services";

export const metadata: Metadata = {
  title: "My services",
  description:
    "Create, edit, and delete your FixMate service listings and track their admin approval status.",
};

export default function TechnicianServicesPage() {
  return (
    <RequireAuth role="technician">
      <TechnicianServices />
    </RequireAuth>
  );
}
