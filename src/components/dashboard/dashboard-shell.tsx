"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  CalendarDays,
  ClipboardList,
  CreditCard,
  LayoutDashboard,
  LogOut,
  Menu,
  ShieldCheck,
  UserRound,
  Users,
  Wallet,
  Wrench,
} from "lucide-react";
import { cn } from "cn";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { useSession } from "@/components/providers/session-provider";
import { useToast } from "@/components/providers/toast-provider";
import { Logo } from "@/components/site/logo";
import { initials, roleLabels } from "@/lib/format";
import type { Role } from "@/lib/types";

const navigation: Record<
  Role,
  Array<{ href: string; label: string; icon: typeof LayoutDashboard }>
> = {
  customer: [
    { href: "/dashboard/customer", label: "Overview", icon: LayoutDashboard },
    {
      href: "/dashboard/customer/bookings",
      label: "My bookings",
      icon: CalendarDays,
    },
    {
      href: "/dashboard/customer/payments",
      label: "Payments",
      icon: CreditCard,
    },
    { href: "/dashboard/profile", label: "Profile", icon: UserRound },
  ],
  technician: [
    {
      href: "/dashboard/technician",
      label: "Overview",
      icon: LayoutDashboard,
    },
    {
      href: "/dashboard/technician/services",
      label: "My services",
      icon: Wrench,
    },
    {
      href: "/dashboard/technician/bookings",
      label: "Bookings",
      icon: ClipboardList,
    },
    { href: "/dashboard/profile", label: "Profile", icon: UserRound },
  ],
  admin: [
    { href: "/dashboard/admin", label: "Overview", icon: LayoutDashboard },
    { href: "/dashboard/admin/users", label: "Users", icon: Users },
    { href: "/dashboard/admin/services", label: "Services", icon: ShieldCheck },
    {
      href: "/dashboard/admin/bookings",
      label: "Bookings",
      icon: ClipboardList,
    },
    { href: "/dashboard/admin/payments", label: "Payments", icon: Wallet },
    { href: "/dashboard/profile", label: "Profile", icon: UserRound },
  ],
};

function navForRole(role: Role) {
  return navigation[role];
}

function DashboardNav({
  role,
  pathname,
  onNavigate,
}: {
  role: Role;
  pathname: string;
  onNavigate?: () => void;
}) {
  return (
    <nav aria-label="Dashboard navigation" className="space-y-1">
      {navForRole(role).map((item) => {
        const active =
          item.href === `/dashboard/${role}`
            ? pathname === item.href
            : pathname === item.href || pathname.startsWith(`${item.href}/`);
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              active
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:bg-muted hover:text-foreground",
            )}
          >
            <item.icon className="size-4 shrink-0" aria-hidden="true" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

function pageTitle(pathname: string): string {
  if (pathname === "/dashboard/profile") return "Profile";
  const segments = pathname.split("/").filter(Boolean);
  const last = segments[segments.length - 1];
  if (!last || last === "dashboard") return "Dashboard";
  const map: Record<string, string> = {
    customer: "Customer dashboard",
    technician: "Technician dashboard",
    admin: "Admin dashboard",
    bookings: "Bookings",
    payments: "Payments",
    services: "Services",
    users: "Users",
    profile: "Profile",
  };
  if (map[last]) return map[last];
  return last
    .replace(/-/g, " ")
    .replace(/\b\w/g, (character) => character.toUpperCase());
}

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const { user, status, signOut } = useSession();
  const pathname = usePathname();
  const router = useRouter();
  const { toast } = useToast();
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [signingOut, setSigningOut] = React.useState(false);

  React.useEffect(() => {
    if (status === "unauthenticated") {
      router.replace(`/login?next=${encodeURIComponent(pathname)}`);
    }
  }, [pathname, router, status]);

  async function handleSignOut() {
    setSigningOut(true);
    try {
      await signOut();
      toast({ title: "Signed out" });
      router.push("/");
      router.refresh();
    } catch (error) {
      toast({
        title: "Could not sign out",
        description:
          error instanceof Error ? error.message : "Please try again.",
        variant: "error",
      });
    } finally {
      setSigningOut(false);
      setMobileOpen(false);
    }
  }

  if (status === "loading" || !user) {
    return (
      <div className="page-shell py-10" aria-busy="true">
        <Skeleton className="h-10 w-64" />
        <div className="mt-8 grid gap-6 lg:grid-cols-[240px_1fr]">
          <Skeleton className="h-72 rounded-2xl" />
          <div className="space-y-4">
            <Skeleton className="h-36 rounded-2xl" />
            <Skeleton className="h-72 rounded-2xl" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/20">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r bg-card lg:flex">
        <div className="flex h-16 items-center border-b px-5">
          <Logo />
        </div>
        <div className="flex-1 overflow-y-auto p-3">
          <p className="px-3 pb-2 pt-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            {roleLabels[user.role]} workspace
          </p>
          <DashboardNav role={user.role} pathname={pathname} />
        </div>
        <div className="border-t p-3">
          <div className="mb-2 flex items-center gap-3 rounded-lg px-2 py-2">
            <Avatar>
              {user.image ? <AvatarImage src={user.image} alt="" /> : null}
              <AvatarFallback className="bg-secondary font-semibold text-secondary-foreground">
                {initials(user.name)}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <p className="truncate text-sm font-medium">{user.name}</p>
              <p className="truncate text-xs text-muted-foreground">
                {roleLabels[user.role]}
              </p>
            </div>
          </div>
          <Link
            href="/"
            className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-muted-foreground transition hover:bg-muted hover:text-foreground"
          >
            <LayoutDashboard className="size-4" aria-hidden="true" />
            Public site
          </Link>
          <Button
            variant="ghost"
            className="mt-1 w-full justify-start text-muted-foreground hover:text-destructive"
            onClick={handleSignOut}
            disabled={signingOut}
          >
            <LogOut aria-hidden="true" />
            {signingOut ? "Signing out…" : "Sign out"}
          </Button>
        </div>
      </aside>

      <div className="lg:pl-64">
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between gap-3 border-b bg-background/85 px-4 backdrop-blur-xl sm:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger
                render={
                  <Button
                    variant="ghost"
                    size="icon"
                    className="lg:hidden"
                    aria-label="Open dashboard menu"
                  />
                }
              >
                <Menu aria-hidden="true" />
              </SheetTrigger>
              <SheetContent className="w-[min(88vw,20rem)] p-0">
                <SheetHeader className="border-b p-5">
                  <SheetTitle>
                    <Logo />
                  </SheetTitle>
                </SheetHeader>
                <div className="p-3">
                  <p className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                    {roleLabels[user.role]} workspace
                  </p>
                  <DashboardNav
                    role={user.role}
                    pathname={pathname}
                    onNavigate={() => setMobileOpen(false)}
                  />
                </div>
                <div className="mt-auto space-y-1 border-t p-3">
                  <Button
                    variant="ghost"
                    className="w-full justify-start"
                    render={<Link href="/" />}
                    onClick={() => setMobileOpen(false)}
                  >
                    <LayoutDashboard aria-hidden="true" />
                    Public site
                  </Button>
                  <Button
                    variant="ghost"
                    className="w-full justify-start text-destructive hover:text-destructive"
                    onClick={handleSignOut}
                    disabled={signingOut}
                  >
                    <LogOut aria-hidden="true" />
                    {signingOut ? "Signing out…" : "Sign out"}
                  </Button>
                </div>
              </SheetContent>
            </Sheet>
            <div className="min-w-0">
              <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
                {roleLabels[user.role]}
              </p>
              <h1 className="truncate text-base font-semibold">
                {pageTitle(pathname)}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              render={<Link href="/services" />}
              className="hidden sm:inline-flex"
            >
              Browse services
            </Button>
            <Link
              href="/dashboard/profile"
              className="rounded-full transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              aria-label="Open profile"
            >
              <Avatar>
                {user.image ? <AvatarImage src={user.image} alt="" /> : null}
                <AvatarFallback className="bg-secondary font-semibold text-secondary-foreground">
                  {initials(user.name)}
                </AvatarFallback>
              </Avatar>
            </Link>
          </div>
        </header>

        <main
          id="main-content"
          className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8"
        >
          {children}
        </main>
        <footer className="border-t px-4 py-5 text-center text-xs text-muted-foreground sm:px-6">
          FixMate · {roleLabels[user.role]} workspace
        </footer>
      </div>
    </div>
  );
}
