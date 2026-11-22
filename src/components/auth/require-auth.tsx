"use client";

import * as React from "react";
import { usePathname, useRouter } from "next/navigation";
import { ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { dashboardPrefix } from "@/lib/config";
import type { Role } from "@/lib/types";
import { useSession } from "@/components/providers/session-provider";

export function RequireAuth({
  children,
  role,
}: {
  children: React.ReactNode;
  role?: Role;
}) {
  const { user, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  React.useEffect(() => {
    if (status === "unauthenticated") {
      const next = pathname ? `?next=${encodeURIComponent(pathname)}` : "";
      router.replace(`/login${next}`);
    }
  }, [pathname, router, status]);

  if (status === "loading") {
    return <RouteLoading />;
  }

  if (!user) {
    return <RouteLoading />;
  }

  if (role && user.role !== role) {
    return (
      <Card className="mx-auto max-w-lg border-amber-200 bg-amber-50/60">
        <CardContent className="flex flex-col items-center gap-4 py-12 text-center">
          <span className="grid size-12 place-items-center rounded-full bg-amber-100 text-amber-800">
            <ShieldAlert className="size-6" aria-hidden="true" />
          </span>
          <div>
            <h2 className="text-xl font-semibold">Wrong workspace</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              This area is for {role} accounts. You are signed in as a{" "}
              {user.role}.
            </p>
          </div>
          <Button onClick={() => router.replace(dashboardPrefix[user.role])}>
            Go to my dashboard
          </Button>
        </CardContent>
      </Card>
    );
  }

  return <>{children}</>;
}

export function RouteLoading() {
  return (
    <div className="space-y-6" aria-busy="true" aria-label="Loading page">
      <div className="space-y-2">
        <Skeleton className="h-8 w-56" />
        <Skeleton className="h-4 w-80 max-w-full" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <Skeleton key={index} className="h-28 rounded-xl" />
        ))}
      </div>
      <Skeleton className="h-72 rounded-xl" />
    </div>
  );
}
