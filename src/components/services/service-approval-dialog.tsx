"use client";

import * as React from "react";
import { BadgeCheck, Loader2, XCircle } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/providers/toast-provider";
import { api, getErrorMessage } from "@/lib/api";
import type { Service } from "@/lib/types";
import { cn } from "cn";

type ApprovalAction = "approved" | "rejected";

export function ServiceApprovalDialog({
  service,
  nextStatus,
  onUpdated,
  className,
}: {
  service: Service;
  nextStatus: ApprovalAction;
  onUpdated: () => void | Promise<void>;
  className?: string;
}) {
  const isApproval = nextStatus === "approved";
  const { toast } = useToast();
  const inFlight = React.useRef(false);
  const [open, setOpen] = React.useState(false);
  const [submitting, setSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  async function handleConfirm() {
    if (inFlight.current) return;
    inFlight.current = true;
    setSubmitting(true);
    setError(null);

    try {
      if (isApproval) {
        await api.admin.approveService(service._id);
      } else {
        await api.admin.rejectService(service._id);
      }

      setOpen(false);
      toast({
        title: isApproval ? "Service approved" : "Service rejected",
        description: isApproval
          ? `"${service.title}" is approved and appears publicly when available.`
          : `"${service.title}" is now hidden from the public catalog.`,
        variant: "success",
      });
      await onUpdated();
    } catch (reason) {
      const message = getErrorMessage(reason);
      setError(message);
      toast({
        title: isApproval
          ? "Could not approve service"
          : "Could not reject service",
        description: message,
        variant: "error",
      });
    } finally {
      inFlight.current = false;
      setSubmitting(false);
    }
  }

  const Icon = isApproval ? BadgeCheck : XCircle;

  return (
    <AlertDialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!submitting) {
          setOpen(nextOpen);
          if (!nextOpen) setError(null);
        }
      }}
    >
      <Button
        type="button"
        size="sm"
        variant={isApproval ? "default" : "outline"}
        className={cn(
          isApproval ? "" : "text-rose-700 hover:text-rose-800",
          className,
        )}
        onClick={() => setOpen(true)}
      >
        <Icon aria-hidden="true" />
        {isApproval ? "Approve" : "Reject"}
      </Button>

      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogMedia
            className={
              isApproval
                ? "bg-emerald-100 text-emerald-800"
                : "bg-rose-100 text-rose-800"
            }
          >
            <Icon aria-hidden="true" />
          </AlertDialogMedia>
          <AlertDialogTitle>
            {isApproval ? "Approve this service?" : "Reject this service?"}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {isApproval ? (
              <>
                Approve <strong>{service.title}</strong> by{" "}
                {service.technicianName}? The listing will be visible in the
                public catalog when it is marked available.
              </>
            ) : (
              <>
                Reject <strong>{service.title}</strong> by{" "}
                {service.technicianName}? The listing will be hidden from the
                public catalog. You can approve it again later.
              </>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>

        {error ? (
          <p
            role="alert"
            className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-800"
          >
            {error}
          </p>
        ) : null}

        <AlertDialogFooter>
          <AlertDialogCancel disabled={submitting}>
            Keep current status
          </AlertDialogCancel>
          <AlertDialogAction
            type="button"
            variant={isApproval ? "default" : "destructive"}
            disabled={submitting}
            onClick={handleConfirm}
          >
            {submitting ? (
              <Loader2 className="animate-spin" aria-hidden="true" />
            ) : (
              <Icon aria-hidden="true" />
            )}
            {submitting
              ? isApproval
                ? "Approving…"
                : "Rejecting…"
              : isApproval
                ? "Approve service"
                : "Reject service"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
