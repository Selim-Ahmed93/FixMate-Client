"use client";

import * as React from "react";
import { AlertTriangle, Loader2, XCircle } from "lucide-react";
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

export function CancelBookingDialog({
  bookingId,
  serviceTitle,
  onCancelled,
  className,
}: {
  bookingId: string;
  serviceTitle: string;
  onCancelled: () => void | Promise<void>;
  className?: string;
}) {
  const { toast } = useToast();
  const [open, setOpen] = React.useState(false);
  const [submitting, setSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  async function handleCancel() {
    setSubmitting(true);
    setError(null);
    try {
      await api.bookings.cancel(bookingId);
      setOpen(false);
      toast({
        title: "Booking cancelled",
        description: `${serviceTitle} has been cancelled.`,
        variant: "success",
      });
      await onCancelled();
    } catch (reason) {
      const message = getErrorMessage(reason);
      setError(message);
      toast({
        title: "Could not cancel booking",
        description: message,
        variant: "error",
      });
    } finally {
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
        variant="outline"
        size="sm"
        className={className}
        onClick={() => setOpen(true)}
      >
        <XCircle aria-hidden="true" />
        Cancel booking
      </Button>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogMedia className="bg-rose-100 text-rose-800">
            <AlertTriangle aria-hidden="true" />
          </AlertDialogMedia>
          <AlertDialogTitle>Cancel this booking?</AlertDialogTitle>
          <AlertDialogDescription>
            You are about to cancel <strong>{serviceTitle}</strong>. This can
            only be done while the booking is still requested, and the action
            cannot be undone.
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
          <AlertDialogCancel disabled={submitting}>Keep booking</AlertDialogCancel>
          <AlertDialogAction
            type="button"
            variant="destructive"
            disabled={submitting}
            onClick={handleCancel}
          >
            {submitting ? (
              <Loader2 className="animate-spin" aria-hidden="true" />
            ) : (
              <XCircle aria-hidden="true" />
            )}
            {submitting ? "Cancelling…" : "Cancel booking"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
