"use client";

import * as React from "react";
import Link from "next/link";
import { ClipboardList } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import { ServiceCard } from "@/components/services/service-card";
import { api, getErrorMessage } from "@/lib/api";
import type { Service } from "@/lib/types";

function FeaturedSkeleton() {
  return (
    <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 3 }).map((_, index) => (
        <div key={index} className="overflow-hidden rounded-2xl border bg-card">
          <Skeleton className="aspect-[4/3] w-full rounded-none" />
          <div className="space-y-3 p-5">
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="mt-5 h-10 w-full" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function FeaturedServices() {
  const [services, setServices] = React.useState<Service[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const load = React.useCallback(() => {
    setLoading(true);
    setError(null);
    api.services
      .list()
      .then((response) => setServices(response.services.slice(0, 6)))
      .catch((reason) => setError(getErrorMessage(reason)))
      .finally(() => setLoading(false));
  }, []);

  React.useEffect(() => {
    let active = true;

    api.services
      .list()
      .then((response) => {
        if (active) setServices(response.services.slice(0, 6));
      })
      .catch((reason) => {
        if (active) setError(getErrorMessage(reason));
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  if (loading) {
    return <FeaturedSkeleton />;
  }

  if (error) {
    return <ErrorState message={error} onRetry={load} />;
  }

  if (services.length === 0) {
    return (
      <EmptyState
        icon={ClipboardList}
        title="No approved services yet"
        description="FixMate only lists services after an admin has reviewed and approved them. New technician listings will appear here as soon as they are live."
        action={
          <Button render={<Link href="/register?role=technician" />}>
            Join as a technician
          </Button>
        }
      />
    );
  }

  return (
    <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
      {services.map((service) => (
        <ServiceCard key={service._id} service={service} />
      ))}
    </div>
  );
}
