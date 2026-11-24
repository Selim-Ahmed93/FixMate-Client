"use client";

import * as React from "react";
import {
  CheckCircle2,
  Loader2,
  Play,
  XCircle,
  type LucideIcon,
} from "lucide-react";
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
import type { Booking } from "@/lib/types";
import { cn } from "cn";

type TransitionStatus = "accepted" | "rejected" | "in-progress";

interface TransitionConfig {
  dialogTitle: string;
  dialogDescription: (booking: Booking) => string;
  triggerLabel: string;
  cancelLabel: string;
  actionLabel: string;
  pendingLabel: string;
  successTitle: string;
  successDescription: (booking: Booking) => string;
  errorTitle: string;
  icon: LucideIcon;
  mediaClassName: string;
  triggerVariant: "default" | "outline";
  triggerClassName?: string;
  actionVariant: "default" | "destructive";
}

const transitionConfigs: Record<TransitionStatus, TransitionConfig> = {
  accepted: {
    dialogTitle: "Accept this booking?",
    dialogDescription: (booking) =>
      `Accept ${booking.serviceTitle} for ${booking.customerName}? The customer will see the booking as accepted, and you can start the job when work begins. This cannot be undone from this page.`,
    triggerLabel: "Accept request",
    cancelLabel: "Not now",
    actionLabel: "Accept booking",
    pendingLabel: "Accepting…",
    successTitle: "Booking accepted",
    successDescription: (booking) =>
      `Accepted ${booking.serviceTitle} for ${booking.customerName}.`,
    errorTitle: "Could not accept booking",
    icon: CheckCircle2,
    mediaClassName: "bg-emerald-100 text-emerald-800",
    triggerVariant: "default",
    actionVariant: "default",
  },
  rejected: {
    dialogTitle: "Reject this booking?",
    dialogDescription: (booking) =>
      `Reject the request from ${booking.customerName} for ${booking.serviceTitle}? The booking closes as rejected and cannot be reopened from this page.`,
    triggerLabel: "Reject request",
    cancelLabel: "Keep request",
    actionLabel: "Reject booking",
    pendingLabel: "Rejecting…",
    successTitle: "Booking rejected",
    successDescription: (booking) =>
      `Rejected the request from ${booking.customerName}.`,
    errorTitle: "Could not reject booking",
    icon: XCircle,
    mediaClassName: "bg-rose-100 text-rose-800",
    triggerVariant: "outline",
    triggerClassName: "text-rose-700 hover:text-rose-800",
    actionVariant: "destructive",
  },
  "in-progress": {
    dialogTitle: "Start this job?",
    dialogDescription: (booking) =>
      `Mark ${booking.serviceTitle} for ${booking.customerName} as in progress? Only do this when work has started. Completion will require a final amount, and this status cannot be undone.`,
    triggerLabel: "Start job",
    cancelLabel: "Not yet",
    actionLabel: "Start job",
    pendingLabel: "Starting…",
    successTitle: "Job started",
    successDescription: (booking) =>
      `${booking.serviceTitle} is now in progress.`,
    errorTitle: "Could not start job",
    icon: Play,
    mediaClassName: "bg-sky-100 text-sky-800",
    triggerVariant: "default",
    actionVariant: "default",
  },
};

export function BookingTransitionDialog({
  booking,
  nextStatus,
  onUpdated,
  className,
}: {
  booking: Booking;
  nextStatus: TransitionStatus;
  onUpdated: () => void | Promise<void>;
  className?: string;
}) {
  const config = transitionConfigs[nextStatus];
  const Icon = config.icon;
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
      await api.bookings.updateStatus(booking._id, nextStatus);
      setOpen(false);
      toast({
        title: config.successTitle,
        description: config.successDescription(booking),
        variant: "success",
      });
      await onUpdated();
    } catch (reason) {
      const message = getErrorMessage(reason);
      setError(message);
      toast({
        title: config.errorTitle,
        description: message,
        variant: "error",
      });
    } finally {
      inFlight.current = false;
      setSubmitting(false);
    }
  }

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
        variant={config.triggerVariant}
        className={cn(config.triggerClassName, className)}
        onClick={() => setOpen(true)}
      >
        <Icon aria-hidden="true" />
        {config.triggerLabel}
      </Button>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogMedia className={config.mediaClassName}>
            <Icon aria-hidden="true" />
          </AlertDialogMedia>
          <AlertDialogTitle>{config.dialogTitle}</AlertDialogTitle>
          <AlertDialogDescription>
            {config.dialogDescription(booking)}
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
            {config.cancelLabel}
          </AlertDialogCancel>
          <AlertDialogAction
            type="button"
            variant={config.actionVariant}
            disabled={submitting}
            onClick={handleConfirm}
          >
            {submitting ? (
              <Loader2 className="animate-spin" aria-hidden="true" />
            ) : (
              <Icon aria-hidden="true" />
            )}
            {submitting ? config.pendingLabel : config.actionLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
