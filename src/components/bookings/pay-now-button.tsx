"use client";

import * as React from "react";
import { CreditCard, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/providers/toast-provider";
import { api, getErrorMessage } from "@/lib/api";
import { cn } from "cn";

export function PayNowButton({
  bookingId,
  className,
}: {
  bookingId: string;
  className?: string;
}) {
  const { toast } = useToast();
  const inFlight = React.useRef(false);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  async function startCheckout() {
    if (inFlight.current) return;
    inFlight.current = true;
    setLoading(true);
    setError(null);

    try {
      const response = await api.payments.checkout(bookingId);

      let checkoutUrl: URL;
      try {
        checkoutUrl = new URL(response.checkoutUrl);
      } catch {
        throw new Error("The server returned an invalid checkout link.");
      }

      if (checkoutUrl.protocol !== "https:") {
        throw new Error("The server returned an insecure checkout link.");
      }

      window.location.assign(checkoutUrl.toString());
    } catch (reason) {
      const message = getErrorMessage(reason);
      setError(message);
      toast({
        title: "Could not start checkout",
        description: message,
        variant: "error",
      });
      inFlight.current = false;
      setLoading(false);
    }
  }

  return (
    <div className={cn("space-y-2", className)}>
      <Button
        type="button"
        size="sm"
        className="w-full"
        onClick={startCheckout}
        disabled={loading}
        aria-busy={loading}
      >
        {loading ? (
          <Loader2 className="animate-spin" aria-hidden="true" />
        ) : (
          <CreditCard aria-hidden="true" />
        )}
        {loading ? "Opening Stripe…" : "Pay Now"}
      </Button>
      <p className="flex items-center justify-center gap-1 text-[10px] text-muted-foreground">
        Secure checkout powered by Stripe
      </p>
      {error ? (
        <p
          role="alert"
          className="rounded-md border border-rose-200 bg-rose-50 px-2 py-1.5 text-[11px] leading-4 text-rose-800"
        >
          {error}
        </p>
      ) : null}
    </div>
  );
}
