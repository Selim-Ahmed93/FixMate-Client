"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";
import { useSession } from "@/components/providers/session-provider";
import { dashboardPrefix } from "@/lib/config";

export default function DashboardIndexPage() {
  const { user, status } = useSession();
  const router = useRouter();

  React.useEffect(() => {
    if (status === "authenticated" && user) {
      router.replace(dashboardPrefix[user.role]);
    }
  }, [router, status, user]);

  return (
    <div className="space-y-4" aria-busy="true" aria-label="Opening dashboard">
      <Skeleton className="h-8 w-56" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <Skeleton key={index} className="h-28 rounded-xl" />
        ))}
      </div>
      <Skeleton className="h-72 rounded-xl" />
    </div>
  );
}
