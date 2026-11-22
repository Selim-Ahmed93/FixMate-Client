"use client";

import * as React from "react";
import { ImageIcon } from "lucide-react";
import { cn } from "cn";

export function ServiceImage({
  src,
  alt,
  className,
  eager = false,
}: {
  src?: string | null;
  alt: string;
  className?: string;
  eager?: boolean;
}) {
  const [failed, setFailed] = React.useState(false);

  if (!src || failed) {
    return (
      <div
        className={cn(
          "flex items-center justify-center bg-[linear-gradient(135deg,var(--secondary),var(--accent))] text-primary/50",
          className,
        )}
        role="img"
        aria-label={`${alt} — image unavailable`}
      >
        <ImageIcon className="size-8" aria-hidden="true" />
      </div>
    );
  }

  return (
    // Service images come from arbitrary technician-supplied URLs; a plain img
    // keeps the public catalog compatible without an allowlist of hosts.
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      className={cn("object-cover", className)}
      loading={eager ? "eager" : "lazy"}
      onError={() => setFailed(true)}
    />
  );
}
