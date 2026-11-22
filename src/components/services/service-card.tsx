import Link from "next/link";
import { ArrowUpRight, Clock3, MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/format";
import type { Service } from "@/lib/types";
import { ServiceImage } from "./service-image";

export function ServiceCard({ service }: { service: Service }) {
  return (
    <article className="group card-lift flex h-full flex-col overflow-hidden rounded-2xl border bg-card shadow-sm">
      <Link
        href={`/services/${service._id}`}
        className="relative block aspect-[4/3] overflow-hidden bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring"
        aria-label={`View ${service.title}`}
      >
        <ServiceImage
          src={service.image}
          alt={service.title}
          className="size-full transition duration-500 group-hover:scale-[1.035]"
        />
        <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/45 to-transparent" />
        <Badge className="absolute left-3 top-3 border-0 bg-background/95 text-foreground shadow-sm backdrop-blur">
          {service.category}
        </Badge>
        <span className="absolute bottom-3 left-3 inline-flex items-center gap-1.5 rounded-full bg-black/35 px-2.5 py-1 text-xs font-medium text-white backdrop-blur">
          <MapPin className="size-3.5" aria-hidden="true" />
          {service.serviceArea}
        </span>
      </Link>

      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-start justify-between gap-3">
          <h3 className="line-clamp-2 text-base font-semibold leading-snug">
            <Link
              href={`/services/${service._id}`}
              className="rounded transition hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {service.title}
            </Link>
          </h3>
          <p className="shrink-0 text-right">
            <span className="block text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
              From
            </span>
            <span className="font-heading text-lg font-bold text-primary">
              {formatCurrency(service.basePrice)}
            </span>
          </p>
        </div>

        <p className="mt-2 line-clamp-2 text-sm leading-6 text-muted-foreground">
          {service.description}
        </p>

        <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <Clock3 className="size-3.5" aria-hidden="true" />
            {service.estimatedDuration}
          </span>
          <span>{service.serviceMode}</span>
        </div>

        <div className="mt-auto flex items-center justify-between gap-3 border-t pt-4">
          <div className="min-w-0">
            <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
              Technician
            </p>
            <p className="truncate text-sm font-medium">
              {service.technicianName}
            </p>
          </div>
          <Link
            href={`/services/${service._id}`}
            className="inline-flex items-center gap-1.5 rounded-lg text-sm font-semibold text-primary transition hover:gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            Details
            <ArrowUpRight className="size-4" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </article>
  );
}
