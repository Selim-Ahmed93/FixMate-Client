import Link from "next/link";
import { Wrench } from "lucide-react";
import { cn } from "cn";

export function Logo({
  className,
  onDark = false,
}: {
  className?: string;
  onDark?: boolean;
}) {
  return (
    <Link
      href="/"
      className={cn(
        "group inline-flex items-center gap-2.5 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        className,
      )}
      aria-label="FixMate home"
    >
      <span
        className={cn(
          "grid size-9 place-items-center rounded-xl shadow-sm transition-transform group-hover:-rotate-3",
          onDark
            ? "bg-accent text-accent-foreground"
            : "bg-primary text-primary-foreground",
        )}
      >
        <Wrench className="size-[18px]" aria-hidden="true" />
      </span>
      <span
        className={cn(
          "text-xl font-bold tracking-tight",
          onDark ? "text-primary-foreground" : "text-foreground",
        )}
      >
        Fix<span className={onDark ? "text-accent" : "text-primary"}>Mate</span>
      </span>
    </Link>
  );
}
