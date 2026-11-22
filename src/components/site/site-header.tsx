"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  ChevronDown,
  LayoutDashboard,
  LogOut,
  Menu,
  UserRound,
  Wrench,
} from "lucide-react";
import { cn } from "cn";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { useSession } from "@/components/providers/session-provider";
import { useToast } from "@/components/providers/toast-provider";
import { dashboardPrefix } from "@/lib/config";
import { initials, roleLabels } from "@/lib/format";
import { Logo } from "./logo";

const navigation = [
  { href: "/services", label: "Browse services" },
  { href: "/#how-it-works", label: "How it works" },
  { href: "/register?role=technician", label: "For technicians" },
];

export function SiteHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, status, signOut } = useSession();
  const { toast } = useToast();
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [signingOut, setSigningOut] = React.useState(false);

  const dashboardHref = user ? dashboardPrefix[user.role] : "/login";
  const profileHref = user ? `${dashboardPrefix[user.role]}/profile` : "/login";

  async function handleSignOut() {
    setSigningOut(true);
    try {
      await signOut();
      toast({ title: "Signed out", description: "See you next time." });
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

  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-background/85 backdrop-blur-xl">
      <div className="page-shell flex h-16 items-center justify-between gap-4">
        <Logo />

        <nav
          aria-label="Main navigation"
          className="hidden items-center gap-1 lg:flex"
        >
          {navigation.map((item) => {
            const active =
              item.href === "/services" && pathname.startsWith("/services");
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  active && "bg-muted text-foreground",
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="hidden items-center gap-2 lg:flex">
          {status === "loading" ? (
            <Skeleton className="size-9 rounded-full" />
          ) : user ? (
            <>
              <Button
                variant="outline"
                size="sm"
                render={<Link href={dashboardHref} />}
              >
                <LayoutDashboard aria-hidden="true" />
                Dashboard
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger
                  className="flex items-center gap-2 rounded-full p-0.5 pr-1.5 transition hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  aria-label="Open account menu"
                >
                  <Avatar>
                    {user.image ? (
                      <AvatarImage src={user.image} alt="" />
                    ) : null}
                    <AvatarFallback className="bg-secondary font-semibold text-secondary-foreground">
                      {initials(user.name)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="max-w-28 truncate text-sm font-medium">
                    {user.name.split(" ")[0]}
                  </span>
                  <ChevronDown className="size-4 text-muted-foreground" aria-hidden="true" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-60">
                  <DropdownMenuLabel className="px-2 py-2">
                    <span className="block truncate text-sm font-semibold text-foreground">
                      {user.name}
                    </span>
                    <span className="block truncate text-xs font-normal">
                      {user.email}
                    </span>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="px-2 py-2"
                    render={<Link href={dashboardHref} />}
                  >
                    <LayoutDashboard aria-hidden="true" />
                    {roleLabels[user.role]} dashboard
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="px-2 py-2"
                    render={<Link href={profileHref} />}
                  >
                    <UserRound aria-hidden="true" />
                    My profile
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    variant="destructive"
                    className="px-2 py-2"
                    disabled={signingOut}
                    onClick={handleSignOut}
                  >
                    <LogOut aria-hidden="true" />
                    {signingOut ? "Signing out…" : "Sign out"}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <>
              <Button variant="ghost" size="sm" render={<Link href="/login" />}>
                Log in
              </Button>
              <Button size="sm" render={<Link href="/register" />}>
                Get started
              </Button>
            </>
          )}
        </div>

        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger
            render={
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden"
                aria-label="Open menu"
              />
            }
          >
            <Menu aria-hidden="true" />
          </SheetTrigger>
          <SheetContent className="w-[min(88vw,22rem)] p-0">
            <SheetHeader className="border-b p-5 text-left">
              <SheetTitle>
                <Logo />
              </SheetTitle>
              <SheetDescription>
                Trusted help for the things that need fixing.
              </SheetDescription>
            </SheetHeader>
            <nav
              aria-label="Mobile navigation"
              className="flex flex-col gap-1 px-3 py-2"
            >
              {navigation.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className="rounded-lg px-3 py-2.5 text-sm font-medium transition hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
            <div className="mt-auto space-y-2 border-t p-4">
              {user ? (
                <>
                  <div className="mb-3 flex items-center gap-3">
                    <Avatar size="lg">
                      {user.image ? (
                        <AvatarImage src={user.image} alt="" />
                      ) : null}
                      <AvatarFallback className="bg-secondary font-semibold text-secondary-foreground">
                        {initials(user.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold">{user.name}</p>
                      <p className="truncate text-xs text-muted-foreground">
                        {roleLabels[user.role]} · {user.email}
                      </p>
                    </div>
                  </div>
                  <Button
                    className="w-full"
                    render={<Link href={dashboardHref} />}
                    onClick={() => setMobileOpen(false)}
                  >
                    <LayoutDashboard aria-hidden="true" />
                    Go to dashboard
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full"
                    render={<Link href={profileHref} />}
                    onClick={() => setMobileOpen(false)}
                  >
                    <UserRound aria-hidden="true" />
                    My profile
                  </Button>
                  <Button
                    variant="ghost"
                    className="w-full text-destructive hover:text-destructive"
                    onClick={handleSignOut}
                    disabled={signingOut}
                  >
                    <LogOut aria-hidden="true" />
                    {signingOut ? "Signing out…" : "Sign out"}
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    className="w-full"
                    render={<Link href="/register" />}
                    onClick={() => setMobileOpen(false)}
                  >
                    Create an account
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full"
                    render={<Link href="/login" />}
                    onClick={() => setMobileOpen(false)}
                  >
                    Log in
                  </Button>
                  <Button
                    variant="ghost"
                    className="w-full"
                    render={<Link href="/register?role=technician" />}
                    onClick={() => setMobileOpen(false)}
                  >
                    <Wrench aria-hidden="true" />
                    Join as a technician
                  </Button>
                </>
              )}
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
