import type { Metadata } from "next";
import { RequireAuth } from "@/components/auth/require-auth";
import { AdminUsers } from "@/components/dashboard/admin/admin-users";

export const metadata: Metadata = {
  title: "User management",
  description:
    "Search FixMate accounts and manage customer, technician, and admin roles.",
};

export default function AdminUsersPage() {
  return (
    <RequireAuth role="admin">
      <AdminUsers />
    </RequireAuth>
  );
}
