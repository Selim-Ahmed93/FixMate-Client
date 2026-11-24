import type { Metadata } from "next";
import { RequireAuth } from "@/components/auth/require-auth";
import { AdminServices } from "@/components/services/admin-services";

export const metadata: Metadata = {
  title: "Service management",
  description:
    "Review technician service listings and manage public catalog approval.",
};

export default function AdminServicesPage() {
  return (
    <RequireAuth role="admin">
      <AdminServices />
    </RequireAuth>
  );
}
