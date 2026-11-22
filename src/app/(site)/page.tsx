import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  CalendarCheck2,
  CheckCircle2,
  ClipboardCheck,
  CreditCard,
  Droplets,
  Hammer,
  ListChecks,
  MessageSquareText,
  Monitor,
  ShieldCheck,
  Sparkles,
  Wind,
  Wrench,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { FeaturedServices } from "@/components/home/featured-services";
import { HomeSearch } from "@/components/home/home-search";
import { categoryLinks } from "@/lib/config";

const categoryIcons = {
  "washing-machine": Wrench,
  "air-vent": Wind,
  zap: Zap,
  droplets: Droplets,
  monitor: Monitor,
  wrench: Hammer,
} as const;

const steps = [
  {
    number: "01",
    title: "Find the right service",
    description:
      "Browse approved services by category or search for the repair you need. Every listing includes the price, duration, and service area upfront.",
    icon: ListChecks,
  },
  {
    number: "02",
    title: "Request a visit",
    description:
      "Share your address, preferred time, and a short description of the problem. The technician can accept or decline the request.",
    icon: CalendarCheck2,
  },
  {
    number: "03",
    title: "Track it to payment",
    description:
      "Follow each status update in your dashboard, review the final amount, and pay securely through Stripe once the work is complete.",
    icon: CreditCard,
  },
];

const expectations = [
  {
    icon: BadgeCheck,
    title: "Reviewed before listing",
    description:
      "Technician services are only public after an administrator approves them.",
  },
  {
    icon: MessageSquareText,
    title: "One clear booking thread",
    description:
      "Your request details, status changes, and final amount stay with the job.",
  },
  {
    icon: ShieldCheck,
    title: "Role-based access",
    description:
      "Customers, technicians, and admins each see only the workspace meant for them.",
  },
];

export default function HomePage() {
  return (
    <>
      <section className="relative overflow-hidden">
        <div className="page-shell grid items-center gap-12 py-16 lg:grid-cols-[1.04fr_0.96fr] lg:py-24">
          <div className="relative z-10">
            <span className="eyebrow">
              <Sparkles className="size-3.5" aria-hidden="true" />
              Local technicians, clearly presented
            </span>
            <h1 className="mt-5 max-w-2xl text-4xl font-bold leading-[1.06] tracking-tight sm:text-5xl lg:text-6xl">
              Home repairs,
              <span className="block text-primary">without the guesswork.</span>
            </h1>
            <p className="mt-5 max-w-xl text-lg leading-8 text-muted-foreground">
              Find a service, book a trusted technician, and follow the whole job
              from request to payment — all in one place.
            </p>

            <HomeSearch />

            <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-sm text-muted-foreground">
              {[
                "Admin-approved listings",
                "Transparent starting prices",
                "Secure Stripe checkout",
              ].map((item) => (
                <span key={item} className="inline-flex items-center gap-1.5">
                  <CheckCircle2
                    className="size-4 text-primary"
                    aria-hidden="true"
                  />
                  {item}
                </span>
              ))}
            </div>

            <div className="mt-7 flex flex-wrap items-center gap-3">
              <Button size="lg" render={<Link href="/services" />}>
                Browse all services
                <ArrowRight aria-hidden="true" />
              </Button>
              <Button
                size="lg"
                variant="ghost"
                render={<Link href="/register?role=technician" />}
              >
                Offer your skills
              </Button>
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-xl lg:max-w-none">
            <div className="absolute -left-5 top-16 hidden h-28 w-28 rounded-full bg-accent/60 blur-2xl sm:block" />
            <div className="absolute -right-4 bottom-20 hidden h-40 w-40 rounded-full bg-secondary blur-3xl sm:block" />

            <div className="relative overflow-hidden rounded-[2rem] border border-white/60 bg-white p-2 shadow-2xl shadow-primary/15">
              <div className="relative aspect-[4/4.4] overflow-hidden rounded-[1.55rem] sm:aspect-[5/4.6]">
                <Image
                  src="/images/hero/electrician-at-work.jpg"
                  alt="A technician carefully working on an electrical installation"
                  fill
                  priority
                  sizes="(max-width: 1024px) 90vw, 44vw"
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-primary/60 via-transparent to-transparent" />

                <div className="absolute inset-x-4 bottom-4 rounded-2xl border border-white/40 bg-background/95 p-4 shadow-lg backdrop-blur">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-primary">
                    Every job has a clear path
                  </p>
                  <div className="mt-3 flex items-center gap-1.5 text-[11px] font-medium sm:text-xs">
                    {["Requested", "Accepted", "In progress", "Completed"].map(
                      (status, index) => (
                        <span key={status} className="flex items-center gap-1.5">
                          <span
                            className={
                              index === 0
                                ? "rounded-full bg-primary px-2 py-1 text-primary-foreground"
                                : "rounded-full bg-muted px-2 py-1 text-muted-foreground"
                            }
                          >
                            {status}
                          </span>
                          {index < 3 ? (
                            <span className="h-px w-2 bg-border sm:w-3" />
                          ) : null}
                        </span>
                      ),
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="absolute -left-4 top-8 hidden rotate-[-3deg] rounded-xl border bg-card p-3 shadow-lg sm:block lg:-left-8">
              <div className="flex items-center gap-2.5">
                <span className="grid size-9 place-items-center rounded-lg bg-emerald-100 text-emerald-800">
                  <BadgeCheck className="size-4" aria-hidden="true" />
                </span>
                <div>
                  <p className="text-xs font-semibold">Admin reviewed</p>
                  <p className="text-[11px] text-muted-foreground">
                    Before it goes live
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="categories" className="page-shell py-16 lg:py-20">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <span className="eyebrow">Browse the essentials</span>
            <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
              Start with what needs fixing
            </h2>
            <p className="mt-2 max-w-2xl text-muted-foreground">
              Jump into a category, then compare the services technicians have
              made available in your area.
            </p>
          </div>
          <Button variant="outline" render={<Link href="/services" />}>
            See every service
            <ArrowRight aria-hidden="true" />
          </Button>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {categoryLinks.map((category) => {
            const Icon =
              categoryIcons[category.icon as keyof typeof categoryIcons] ??
              Wrench;
            return (
              <Link
                key={category.slug}
                href={`/services?category=${encodeURIComponent(category.name)}`}
                className="group relative min-h-52 overflow-hidden rounded-2xl border bg-card shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                <Image
                  src={category.image}
                  alt=""
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  className="object-cover transition duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-primary via-primary/55 to-primary/5" />
                <div className="absolute inset-x-0 bottom-0 p-5 text-primary-foreground">
                  <span className="mb-3 grid size-9 place-items-center rounded-lg bg-white/15 backdrop-blur">
                    <Icon className="size-4" aria-hidden="true" />
                  </span>
                  <span className="flex items-center justify-between gap-3">
                    <span>
                      <span className="block font-heading text-lg font-semibold">
                        {category.name}
                      </span>
                      <span className="mt-0.5 block text-xs text-primary-foreground/70">
                        {category.description}
                      </span>
                    </span>
                    <ArrowRight
                      className="size-5 shrink-0 transition-transform group-hover:translate-x-1"
                      aria-hidden="true"
                    />
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      <section className="border-y border-border/70 bg-card/50 py-16 lg:py-20">
        <div className="page-shell">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <span className="eyebrow">Available now</span>
              <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
                Services ready to book
              </h2>
              <p className="mt-2 max-w-2xl text-muted-foreground">
                Live listings from approved technicians. No placeholder prices,
                no invented reviews.
              </p>
            </div>
            <Button variant="outline" render={<Link href="/services" />}>
              Open the full catalog
              <ArrowRight aria-hidden="true" />
            </Button>
          </div>
          <div className="mt-8">
            <FeaturedServices />
          </div>
        </div>
      </section>

      <section id="how-it-works" className="page-shell py-16 lg:py-20">
        <div className="mx-auto max-w-2xl text-center">
          <span className="eyebrow">How it works</span>
          <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
            From broken to booked in three steps
          </h2>
          <p className="mt-3 text-muted-foreground">
            FixMate keeps the request, the technician’s updates, and the final
            payment connected to the same booking.
          </p>
        </div>

        <div className="relative mt-10 grid gap-5 md:grid-cols-3">
          <div className="absolute left-[16.66%] right-[16.66%] top-9 hidden h-px bg-gradient-to-r from-transparent via-primary/25 to-transparent md:block" />
          {steps.map((step) => (
            <Card
              key={step.number}
              className="relative border bg-card/90 shadow-sm"
            >
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <span className="grid size-11 place-items-center rounded-xl bg-secondary text-secondary-foreground">
                    <step.icon className="size-5" aria-hidden="true" />
                  </span>
                  <span className="font-heading text-sm font-bold text-primary/35">
                    {step.number}
                  </span>
                </div>
                <h3 className="mt-5 text-lg font-semibold">{step.title}</h3>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  {step.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section id="trust" className="page-shell py-16 lg:py-20">
        <div className="overflow-hidden rounded-[2rem] bg-primary text-primary-foreground shadow-xl shadow-primary/15">
          <div className="grid lg:grid-cols-2">
            <div className="relative min-h-80 lg:min-h-[34rem]">
              <Image
                src="/images/hero/repair-detail.jpg"
                alt="Close-up of a technician making a precise repair"
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-primary/60 via-transparent to-transparent lg:bg-gradient-to-r lg:from-transparent lg:to-primary/40" />
              <div className="absolute bottom-5 left-5 right-5 rounded-2xl border border-white/15 bg-primary/75 p-4 backdrop-blur lg:right-auto lg:max-w-xs">
                <p className="flex items-center gap-2 text-sm font-semibold">
                  <ClipboardCheck className="size-4 text-accent" aria-hidden="true" />
                  Built around the booking
                </p>
                <p className="mt-1 text-xs leading-5 text-primary-foreground/70">
                  Each request carries its own service, technician, schedule,
                  and payment status.
                </p>
              </div>
            </div>

            <div className="p-7 sm:p-10 lg:p-12">
              <span className="inline-flex items-center gap-2 rounded-full border border-primary-foreground/15 bg-primary-foreground/5 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-accent">
                <ShieldCheck className="size-3.5" aria-hidden="true" />
                What to expect
              </span>
              <h2 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
                Clarity at every step
              </h2>
              <p className="mt-3 max-w-lg text-primary-foreground/70">
                No mystery call-outs. No detached chat threads. Just a
                structured process that customers and technicians can both
                follow.
              </p>

              <div className="mt-8 space-y-5">
                {expectations.map((item) => (
                  <div key={item.title} className="flex gap-4">
                    <span className="mt-0.5 grid size-10 shrink-0 place-items-center rounded-xl bg-primary-foreground/10 text-accent">
                      <item.icon className="size-5" aria-hidden="true" />
                    </span>
                    <div>
                      <h3 className="text-base font-semibold">{item.title}</h3>
                      <p className="mt-1 text-sm leading-6 text-primary-foreground/65">
                        {item.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="page-shell pb-4 pt-10">
        <div className="flex flex-col items-start justify-between gap-6 rounded-2xl border border-accent/50 bg-accent/40 p-7 sm:flex-row sm:items-center sm:p-9">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-accent-foreground/70">
              For technicians
            </p>
            <h2 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">
              Turn your repair skills into a clear service listing.
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-accent-foreground/75">
              Create your services, manage assigned bookings, and record the
              final amount when the work is finished.
            </p>
          </div>
          <Button
            size="lg"
            className="shrink-0"
            render={<Link href="/register?role=technician" />}
          >
            Join as a technician
            <ArrowRight aria-hidden="true" />
          </Button>
        </div>
      </section>
    </>
  );
}
