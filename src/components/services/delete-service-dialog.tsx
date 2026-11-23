"use client";

import * as React from "react";
import { AlertTriangle, Loader2, Trash2 } from "lucide-react";
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
import { cn } from "cn";

export function DeleteServiceDialog({
  serviceId,
  serviceTitle,
  onDeleted,
  className,
}: {
  serviceId: string;
  serviceTitle: string;
  onDeleted: () => void | Promise<void>;
  className?: string;
}) {
  const { toast } = useToast();
  const [open, setOpen] = React.useState(false);
  const [submitting, setSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  async function handleDelete() {
    setSubmitting(true);
    setError(null);
    try {
      await api.services.remove(serviceId);
      setOpen(false);
      toast({
        title: "Service deleted",
        description: `"${serviceTitle}" was permanently deleted.`,
        variant: "success",
      });
      await onDeleted();
    } catch (reason) {
      const message = getErrorMessage(reason);
      setError(message);
      toast({
        title: "Could not delete service",
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
        className={cn("text-rose-700 hover:text-rose-800", className)}
        onClick={() => setOpen(true)}
      >
        <Trash2 aria-hidden="true" />
        Delete
      </Button>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogMedia className="bg-rose-100 text-rose-800">
            <AlertTriangle aria-hidden="true" />
          </AlertDialogMedia>
          <AlertDialogTitle>Delete this service?</AlertDialogTitle>
          <AlertDialogDescription>
            You are about to permanently delete{" "}
            <strong>{serviceTitle}</strong>. This cannot be undone, and the
            listing will be removed from your technician profile and the public
            catalog.
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
            Keep service
          </AlertDialogCancel>
          <AlertDialogAction
            type="button"
            variant="destructive"
            disabled={submitting}
            onClick={handleDelete}
          >
            {submitting ? (
              <Loader2 className="animate-spin" aria-hidden="true" />
            ) : (
              <Trash2 aria-hidden="true" />
            )}
            {submitting ? "Deleting…" : "Delete service"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
