"use client";

import { AlertTriangle, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ErrorState({
  title = "We couldn’t load this page",
  message,
  onRetry,
  compact = false,
}: {
  title?: string;
  message: string;
  onRetry?: () => void;
  compact?: boolean;
}) {
  return (
    <div
      role="alert"
      className={
        compact
          ? "flex flex-col gap-3 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-900 sm:flex-row sm:items-center sm:justify-between"
          : "flex flex-col items-center justify-center rounded-2xl border border-rose-200 bg-rose-50/70 px-6 py-12 text-center text-rose-950"
      }
    >
      <div
        className={
          compact ? "flex items-start gap-3" : "flex flex-col items-center"
        }
      >
        <AlertTriangle
          className={compact ? "mt-0.5 size-5 shrink-0" : "size-7"}
          aria-hidden="true"
        />
        <div className={compact ? "" : "mt-3"}>
          <h2 className={compact ? "font-semibold" : "text-lg font-semibold"}>
            {title}
          </h2>
          <p
            className={
              compact
                ? "mt-0.5 text-rose-800"
                : "mt-1 max-w-md text-sm text-rose-800"
            }
          >
            {message}
          </p>
        </div>
      </div>
      {onRetry ? (
        <Button
          variant="outline"
          size="sm"
          onClick={onRetry}
          className="border-rose-300 bg-white/70 text-rose-900 hover:bg-white"
        >
          <RotateCcw aria-hidden="true" />
          Try again
        </Button>
      ) : null}
    </div>
  );
}
