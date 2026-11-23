import type { LucideIcon } from "lucide-react";
import { cn } from "cn";

const tones = {
  teal: "bg-secondary text-secondary-foreground",
  amber: "bg-amber-100 text-amber-900",
  emerald: "bg-emerald-100 text-emerald-900",
  sky: "bg-sky-100 text-sky-900",
} as const;

export function StatCard({
  label,
  value,
  hint,
  icon: Icon,
  tone = "teal",
}: {
  label: string;
  value: React.ReactNode;
  hint?: string;
  icon: LucideIcon;
  tone?: keyof typeof tones;
}) {
  return (
    <div className="rounded-xl border bg-card p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.1em] text-muted-foreground">
            {label}
          </p>
          <p className="mt-2 font-heading text-3xl font-bold tracking-tight">
            {value}
          </p>
        </div>
        <span
          className={cn(
            "grid size-10 shrink-0 place-items-center rounded-xl",
            tones[tone],
          )}
        >
          <Icon className="size-5" aria-hidden="true" />
        </span>
      </div>
      {hint ? (
        <p className="mt-3 text-xs leading-5 text-muted-foreground">{hint}</p>
      ) : null}
    </div>
  );
}
