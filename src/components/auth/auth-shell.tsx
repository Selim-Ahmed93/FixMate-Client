import Image from "next/image";
import Link from "next/link";
import { CheckCircle2, ShieldCheck, Wrench } from "lucide-react";
import { Logo } from "@/components/site/logo";

export function AuthShell({
  title,
  description,
  children,
  footer,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  return (
    <section className="page-shell py-10 lg:py-16">
      <div className="grid overflow-hidden rounded-3xl border bg-card shadow-xl shadow-primary/5 lg:grid-cols-[0.92fr_1.08fr]">
        <div className="relative hidden min-h-[38rem] lg:block">
          <Image
            src="/images/hero/electrician-at-work.jpg"
            alt="A FixMate technician at work"
            fill
            priority
            sizes="45vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-primary via-primary/65 to-primary/10" />
          <div className="absolute inset-0 flex flex-col justify-between p-8 text-primary-foreground">
            <Logo onDark />
            <div>
              <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] backdrop-blur">
                <ShieldCheck className="size-3.5 text-accent" aria-hidden="true" />
                One account, one clear workspace
              </span>
              <h2 className="mt-5 max-w-sm text-3xl font-bold leading-tight">
                The right dashboard for every side of the job.
              </h2>
              <ul className="mt-6 space-y-3 text-sm text-primary-foreground/75">
                {[
                  "Customers book, track, and pay in one place.",
                  "Technicians manage services and assigned jobs.",
                  "Admins review listings and keep the marketplace healthy.",
                ].map((item) => (
                  <li key={item} className="flex gap-2.5">
                    <CheckCircle2
                      className="mt-0.5 size-4 shrink-0 text-accent"
                      aria-hidden="true"
                    />
                    {item}
                  </li>
                ))}
              </ul>
              <div className="mt-8 flex items-center gap-3 rounded-xl border border-white/15 bg-white/5 p-3 text-xs text-primary-foreground/70">
                <Wrench className="size-4 text-accent" aria-hidden="true" />
                <span>
                  Need the public catalog first?{" "}
                  <Link
                    href="/services"
                    className="font-semibold text-primary-foreground underline underline-offset-4"
                  >
                    Browse services
                  </Link>
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 sm:p-10 lg:p-12">
          <div className="mx-auto w-full max-w-md">
            <div className="lg:hidden">
              <Logo />
            </div>
            <div className="mt-8 lg:mt-0">
              <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                {description}
              </p>
            </div>
            <div className="mt-8">{children}</div>
            {footer ? (
              <div className="mt-8 border-t pt-6 text-center text-sm text-muted-foreground">
                {footer}
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}
