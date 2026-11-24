"use client";

import * as React from "react";
import { CheckCircle2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ErrorState } from "@/components/shared/error-state";
import { useToast } from "@/components/providers/toast-provider";
import { api, getErrorMessage } from "@/lib/api";
import { formatCurrency } from "@/lib/format";
import type { Booking } from "@/lib/types";
import { cn } from "cn";

export function CompleteBookingDialog({
  booking,
  onCompleted,
  className,
}: {
  booking: Booking;
  onCompleted: () => void | Promise<void>;
  className?: string;
}) {
  const { toast } = useToast();
  const inFlight = React.useRef(false);
  const [open, setOpen] = React.useState(false);
  const [amount, setAmount] = React.useState(() =>
    String(booking.finalAmount ?? booking.basePrice),
  );
  const [amountError, setAmountError] = React.useState<string | null>(null);
  const [formError, setFormError] = React.useState<string | null>(null);
  const [submitting, setSubmitting] = React.useState(false);

  function handleOpen() {
    setAmount(String(booking.finalAmount ?? booking.basePrice));
    setAmountError(null);
    setFormError(null);
    setOpen(true);
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (inFlight.current) return;

    const trimmed = amount.trim();
    const numericAmount = Number(trimmed);

    if (!trimmed) {
      setAmountError("Enter the final amount.");
      document.getElementById("final-amount")?.focus();
      return;
    }

    if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
      setAmountError("Enter a valid amount greater than 0.");
      document.getElementById("final-amount")?.focus();
      return;
    }

    inFlight.current = true;
    setSubmitting(true);
    setAmountError(null);
    setFormError(null);

    try {
      await api.bookings.complete(booking._id, numericAmount);
      setOpen(false);
      toast({
        title: "Booking completed",
        description: `${booking.serviceTitle} was completed with a final amount of ${formatCurrency(numericAmount)}.`,
        variant: "success",
      });
      await onCompleted();
    } catch (reason) {
      const message = getErrorMessage(reason);
      setFormError(message);
      toast({
        title: "Could not complete booking",
        description: message,
        variant: "error",
      });
    } finally {
      inFlight.current = false;
      setSubmitting(false);
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!submitting) {
          setOpen(nextOpen);
          if (!nextOpen) {
            setAmountError(null);
            setFormError(null);
          }
        }
      }}
    >
      <Button
        type="button"
        size="sm"
        className={cn("justify-center", className)}
        onClick={handleOpen}
      >
        <CheckCircle2 aria-hidden="true" />
        Complete job
      </Button>
      <DialogContent className="max-h-[calc(100dvh-2rem)] overflow-y-auto sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Complete this booking?</DialogTitle>
          <DialogDescription>
            Record the final amount for {booking.serviceTitle}. This marks the
            booking as completed and cannot be undone. Payment stays separate
            and is not marked as paid here.
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={handleSubmit}
          noValidate
          aria-busy={submitting}
          className="space-y-4"
        >
          <div className="rounded-lg border bg-muted/40 p-3 text-sm">
            <div className="flex items-center justify-between gap-3">
              <span className="text-muted-foreground">Quoted base price</span>
              <span className="font-semibold">
                {formatCurrency(booking.basePrice)}
              </span>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              Customer: {booking.customerName}
            </p>
          </div>

          {formError ? (
            <ErrorState
              compact
              title="Could not complete booking"
              message={formError}
            />
          ) : null}

          <div className="space-y-1.5">
            <Label htmlFor="final-amount">Final amount (USD)</Label>
            <Input
              id="final-amount"
              type="number"
              inputMode="decimal"
              min="0.01"
              step="0.01"
              value={amount}
              onChange={(event) => {
                setAmount(event.target.value);
                setAmountError(null);
              }}
              placeholder="90"
              aria-invalid={amountError ? true : undefined}
              aria-describedby={
                amountError ? "final-amount-error" : "final-amount-hint"
              }
              disabled={submitting}
            />
            {amountError ? (
              <p
                id="final-amount-error"
                className="text-xs font-medium text-destructive"
              >
                {amountError}
              </p>
            ) : (
              <p
                id="final-amount-hint"
                className="text-xs text-muted-foreground"
              >
                Enter the total the customer should pay. Must be greater than 0.
              </p>
            )}
          </div>

          <p className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs leading-5 text-amber-950">
            Completing the job does not take payment. The customer pays the
            recorded final amount separately through FixMate.
          </p>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? (
                <Loader2 className="animate-spin" aria-hidden="true" />
              ) : (
                <CheckCircle2 aria-hidden="true" />
              )}
              {submitting ? "Completing…" : "Complete booking"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
