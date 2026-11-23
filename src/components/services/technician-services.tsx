"use client";

import * as React from "react";
import {
  Clock3,
  MapPin,
  Pencil,
  Plus,
  Wrench,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import { PageHeader } from "@/components/dashboard/page-header";
import { ServiceImage } from "@/components/services/service-image";
import { ServiceApprovalBadge } from "@/components/services/service-approval-badge";
import { ServiceFormDialog } from "@/components/services/service-form-dialog";
import { DeleteServiceDialog } from "@/components/services/delete-service-dialog";
import { api, getErrorMessage } from "@/lib/api";
import { formatCurrency, pluralize } from "@/lib/format";
import type { ApprovalStatus, Service } from "@/lib/types";

type EditorState =
  | { mode: "create" }
  | { mode: "edit"; service: Service }
  | null;

const approvalHints: Record<ApprovalStatus, string> = {
  pending: "Awaiting admin review",
  approved: "Visible in the public catalog",
  rejected: "Update it to resubmit for review",
};

const approvalHintTones: Record<ApprovalStatus, string> = {
  pending: "text-amber-700",
  approved: "text-emerald-700",
  rejected: "text-rose-700",
};

function ServicesSkeleton() {
  return (
    <div className="space-y-6" aria-busy="true" aria-label="Loading services">
      <div className="space-y-2">
        <Skeleton className="h-9 w-52" />
        <Skeleton className="h-4 w-96 max-w-full" />
      </div>
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, index) => (
          <div
            key={index}
            className="grid overflow-hidden rounded-2xl border bg-card sm:grid-cols-[180px_1fr] lg:grid-cols-[200px_1fr_auto]"
          >
            <Skeleton className="min-h-44 rounded-none" />
            <div className="space-y-3 p-5">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-6 w-2/3" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-4/5" />
              <Skeleton className="h-10 w-full" />
            </div>
            <Skeleton className="m-5 h-28 rounded-xl lg:w-44" />
          </div>
        ))}
      </div>
    </div>
  );
}

function ServiceManagementCard({
  service,
  onEdit,
  onDeleted,
}: {
  service: Service;
  onEdit: () => void;
  onDeleted: () => void;
}) {
  return (
    <article className="overflow-hidden rounded-2xl border bg-card shadow-sm transition hover:border-primary/20 hover:shadow-md hover:shadow-primary/5">
      <div className="grid sm:grid-cols-[180px_1fr] lg:grid-cols-[200px_1fr_auto]">
        <div className="relative min-h-44 bg-muted sm:min-h-full">
          <ServiceImage
            src={service.image}
            alt={service.title}
            className="absolute inset-0 size-full"
          />
        </div>

        <div className="min-w-0 p-5">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
              {service.category}
            </p>
            <ServiceApprovalBadge status={service.approvalStatus} />
          </div>
          <h2 className="mt-1.5 truncate text-lg font-semibold">
            {service.title}
          </h2>
          <p className="mt-2 line-clamp-2 text-sm leading-6 text-muted-foreground">
            {service.description}
          </p>

          <dl className="mt-4 grid gap-x-5 gap-y-2 text-xs text-muted-foreground sm:grid-cols-2">
            <div className="flex min-w-0 items-center gap-2">
              <Clock3 className="size-3.5 shrink-0" aria-hidden="true" />
              <dt className="sr-only">Estimated duration</dt>
              <dd className="truncate">{service.estimatedDuration}</dd>
            </div>
            <div className="flex min-w-0 items-center gap-2">
              <Wrench className="size-3.5 shrink-0" aria-hidden="true" />
              <dt className="sr-only">Service mode</dt>
              <dd className="truncate">{service.serviceMode}</dd>
            </div>
            <div className="flex min-w-0 items-center gap-2 sm:col-span-2">
              <MapPin className="size-3.5 shrink-0" aria-hidden="true" />
              <dt className="sr-only">Service area</dt>
              <dd className="truncate">{service.serviceArea}</dd>
            </div>
          </dl>
        </div>

        <div className="flex flex-col justify-between gap-4 border-t p-5 sm:col-span-2 lg:col-span-1 lg:min-w-52 lg:border-l lg:border-t-0">
          <div>
            <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
              Base price
            </p>
            <p className="mt-1 font-heading text-2xl font-bold text-primary">
              {formatCurrency(service.basePrice)}
            </p>
            <p
              className={`mt-1 text-[11px] font-medium ${approvalHintTones[service.approvalStatus]}`}
            >
              {approvalHints[service.approvalStatus]}
            </p>
          </div>

          <div className="flex flex-wrap gap-2 lg:flex-col">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onEdit}
              className="justify-center"
            >
              <Pencil aria-hidden="true" />
              Edit
            </Button>
            <DeleteServiceDialog
              serviceId={service._id}
              serviceTitle={service.title}
              onDeleted={onDeleted}
              className="justify-center"
            />
          </div>
        </div>
      </div>
    </article>
  );
}

export function TechnicianServices() {
  const [services, setServices] = React.useState<Service[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [editor, setEditor] = React.useState<EditorState>(null);

  const load = React.useCallback(() => {
    setLoading(true);
    setError(null);
    api.services
      .technician()
      .then((response) => setServices(response.services))
      .catch((reason) => setError(getErrorMessage(reason)))
      .finally(() => setLoading(false));
  }, []);

  React.useEffect(() => {
    let active = true;

    api.services
      .technician()
      .then((response) => {
        if (active) setServices(response.services);
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

  if (loading) return <ServicesSkeleton />;
  if (error) return <ErrorState message={error} onRetry={load} />;

  const createButton = (
    <Button type="button" onClick={() => setEditor({ mode: "create" })}>
      <Plus aria-hidden="true" />
      Create service
    </Button>
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="My services"
        description="Create and manage the services you offer. New and edited listings return to pending admin approval before they appear publicly."
        action={createButton}
      />

      {services.length === 0 ? (
        <EmptyState
          icon={Wrench}
          title="No services yet"
          description="Create your first service listing. It will stay pending until an admin approves it for the public catalog."
          action={createButton}
        />
      ) : (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2 px-1 text-sm">
            <p className="font-medium">
              {pluralize(services.length, "service")}
            </p>
            <p className="text-xs text-muted-foreground">
              Newest listings appear first
            </p>
          </div>

          {services.map((service) => (
            <ServiceManagementCard
              key={service._id}
              service={service}
              onEdit={() => setEditor({ mode: "edit", service })}
              onDeleted={load}
            />
          ))}
        </div>
      )}

      {editor ? (
        <ServiceFormDialog
          service={editor.mode === "edit" ? editor.service : null}
          onClose={() => setEditor(null)}
          onSaved={load}
        />
      ) : null}
    </div>
  );
}
