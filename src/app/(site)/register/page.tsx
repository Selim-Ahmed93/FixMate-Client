import type { Metadata } from "next";
import { Suspense } from "react";
import { AuthShell } from "@/components/auth/auth-shell";
import { RegisterForm } from "@/components/auth/register-form";
import { Skeleton } from "@/components/ui/skeleton";

export const metadata: Metadata = {
  title: "Create an account",
  description:
    "Join FixMate as a customer to book repairs, or as a technician to offer your services.",
};

export default function RegisterPage() {
  return (
    <AuthShell
      title="Create your account"
      description="Choose how you want to use FixMate. Admin accounts are never created through public signup."
      footer={
        <p>
          By creating an account you agree to use FixMate’s booking and service
          processes responsibly.
        </p>
      }
    >
      <Suspense
        fallback={
          <div className="space-y-4">
            <Skeleton className="h-20 rounded-xl" />
            <Skeleton className="h-10 rounded-lg" />
            <Skeleton className="h-10 rounded-lg" />
            <Skeleton className="h-10 rounded-lg" />
            <Skeleton className="h-10 rounded-lg" />
          </div>
        }
      >
        <RegisterForm />
      </Suspense>
    </AuthShell>
  );
}
