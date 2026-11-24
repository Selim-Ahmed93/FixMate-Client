"use client";

import * as React from "react";
import {
  CalendarDays,
  Mail,
  MapPin,
  Phone,
  Search,
  ShieldCheck,
  UserRound,
  Users,
  Wrench,
  X,
  type LucideIcon,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import { PageHeader } from "@/components/dashboard/page-header";
import { UserRoleDialog } from "@/components/dashboard/admin/user-role-dialog";
import { useSession } from "@/components/providers/session-provider";
import { api, getErrorMessage } from "@/lib/api";
import { formatDate, initials, pluralize, roleLabels } from "@/lib/format";
import type { Role, User } from "@/lib/types";

const roleFilterItems: Array<{ value: "all" | Role; label: string }> = [
  { value: "all", label: "All roles" },
  { value: "customer", label: "Customers" },
  { value: "technician", label: "Technicians" },
  { value: "admin", label: "Admins" },
];

const roleTones: Record<Role, string> = {
  customer: "border-sky-200 bg-sky-50 text-sky-800",
  technician: "border-emerald-200 bg-emerald-50 text-emerald-800",
  admin: "border-violet-200 bg-violet-50 text-violet-800",
};

const roleIcons: Record<Role, LucideIcon> = {
  customer: UserRound,
  technician: Wrench,
  admin: ShieldCheck,
};

function RoleBadge({ role }: { role: Role }) {
  const Icon = roleIcons[role];

  return (
    <Badge variant="outline" className={roleTones[role]}>
      <Icon aria-hidden="true" />
      {roleLabels[role]}
    </Badge>
  );
}

function UsersSkeleton() {
  return (
    <div className="space-y-3" aria-busy="true" aria-label="Loading users">
      {Array.from({ length: 4 }).map((_, index) => (
        <div key={index} className="rounded-2xl border bg-card p-5 shadow-sm">
          <div className="flex gap-3">
            <Skeleton className="size-10 shrink-0 rounded-full" />
            <div className="min-w-0 flex-1 space-y-2">
              <Skeleton className="h-5 w-56 max-w-full" />
              <Skeleton className="h-4 w-72 max-w-full" />
              <div className="flex gap-4 pt-2">
                <Skeleton className="h-3 w-28" />
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-3 w-32" />
              </div>
            </div>
            <Skeleton className="hidden h-7 w-28 sm:block" />
          </div>
        </div>
      ))}
    </div>
  );
}

function UserCard({
  user,
  isSelf,
  onChangeRole,
}: {
  user: User;
  isSelf: boolean;
  onChangeRole: () => void;
}) {
  return (
    <article className="rounded-2xl border bg-card p-5 shadow-sm transition hover:border-primary/20 hover:shadow-md hover:shadow-primary/5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex min-w-0 items-start gap-3">
          <Avatar size="lg" className="mt-0.5">
            {user.image ? <AvatarImage src={user.image} alt="" /> : null}
            <AvatarFallback className="bg-secondary font-semibold text-secondary-foreground">
              {initials(user.name)}
            </AvatarFallback>
          </Avatar>

          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="truncate text-base font-semibold">{user.name}</h2>
              <RoleBadge role={user.role} />
              {isSelf ? (
                <Badge variant="secondary">You</Badge>
              ) : null}
            </div>

            <p className="mt-1 flex items-center gap-1.5 break-all text-sm text-muted-foreground">
              <Mail className="size-3.5 shrink-0" aria-hidden="true" />
              {user.email}
            </p>

            <dl className="mt-3 grid gap-x-6 gap-y-2 text-xs text-muted-foreground sm:grid-cols-2 lg:grid-cols-3">
              <div className="flex min-w-0 items-center gap-1.5">
                <Phone className="size-3.5 shrink-0" aria-hidden="true" />
                <dt className="sr-only">Phone</dt>
                <dd className="truncate">{user.phone || "Not provided"}</dd>
              </div>
              <div className="flex min-w-0 items-center gap-1.5">
                <MapPin className="size-3.5 shrink-0" aria-hidden="true" />
                <dt className="sr-only">Area</dt>
                <dd className="truncate">{user.area || "Not provided"}</dd>
              </div>
              <div className="flex min-w-0 items-center gap-1.5">
                <CalendarDays className="size-3.5 shrink-0" aria-hidden="true" />
                <dt className="sr-only">Joined</dt>
                <dd className="truncate">Joined {formatDate(user.createdAt)}</dd>
              </div>
            </dl>
          </div>
        </div>

        <div className="flex shrink-0 flex-col items-start gap-1 sm:items-end">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onChangeRole}
            disabled={isSelf}
          >
            <ShieldCheck aria-hidden="true" />
            Change role
          </Button>
          {isSelf ? (
            <p className="max-w-44 text-[11px] leading-4 text-muted-foreground sm:text-right">
              You cannot change your own role.
            </p>
          ) : null}
        </div>
      </div>
    </article>
  );
}

export function AdminUsers() {
  const { user: currentUser } = useSession();
  const [users, setUsers] = React.useState<User[]>([]);
  const [total, setTotal] = React.useState(0);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [roleFilter, setRoleFilter] = React.useState<"all" | Role>("all");
  const [searchInput, setSearchInput] = React.useState("");
  const [search, setSearch] = React.useState("");
  const [refreshKey, setRefreshKey] = React.useState(0);
  const [editor, setEditor] = React.useState<User | null>(null);

  React.useEffect(() => {
    let active = true;

    api.admin
      .users({
        role: roleFilter === "all" ? undefined : roleFilter,
        search: search || undefined,
      })
      .then((response) => {
        if (!active) return;
        setUsers(response.users);
        setTotal(response.totalUsers);
      })
      .catch((reason) => {
        if (active) setError(getErrorMessage(reason));
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [roleFilter, search, refreshKey]);

  const refresh = React.useCallback(() => {
    setLoading(true);
    setError(null);
    setRefreshKey((current) => current + 1);
  }, []);

  const filterActive = roleFilter !== "all" || Boolean(search);

  function handleSearch(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setSearch(searchInput.trim());
    setRefreshKey((current) => current + 1);
  }

  function clearFilters() {
    setLoading(true);
    setError(null);
    setRoleFilter("all");
    setSearchInput("");
    setSearch("");
    setRefreshKey((current) => current + 1);
  }

  function isSameUser(candidate: User) {
    const candidateId = candidate._id ?? candidate.id;
    const currentId = currentUser?._id ?? currentUser?.id;

    return (
      (Boolean(currentId) && candidateId === currentId) ||
      (Boolean(currentUser?.email) &&
        candidate.email.toLowerCase() === currentUser?.email.toLowerCase())
    );
  }

  function getUserId(user: User) {
    return user._id ?? user.id;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="User management"
        description="Search FixMate accounts and update workspace roles according to the backend authorization rules."
      />

      <div className="rounded-2xl border bg-card p-4 shadow-sm">
        <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_11rem_auto]">
          <form onSubmit={handleSearch} className="flex min-w-0 gap-2">
            <div className="relative min-w-0 flex-1">
              <Search
                className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground"
                aria-hidden="true"
              />
              <Input
                type="search"
                value={searchInput}
                onChange={(event) => setSearchInput(event.target.value)}
                placeholder="Search name or email"
                aria-label="Search users by name or email"
                maxLength={100}
                autoComplete="off"
                className="pl-8"
              />
            </div>
            <Button type="submit" variant="secondary" className="shrink-0">
              <Search aria-hidden="true" />
              Search
            </Button>
          </form>

          <Select
            items={roleFilterItems}
            value={roleFilter}
            onValueChange={(value) => {
              if (typeof value === "string") {
                setLoading(true);
                setError(null);
                setRoleFilter(value as "all" | Role);
              }
            }}
          >
            <SelectTrigger aria-label="Filter users by role" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {roleFilterItems.map((item) => (
                <SelectItem key={item.value} value={item.value}>
                  {item.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {filterActive ? (
            <Button type="button" variant="ghost" onClick={clearFilters}>
              <X aria-hidden="true" />
              Clear
            </Button>
          ) : (
            <div className="hidden md:block" aria-hidden="true" />
          )}
        </div>
      </div>

      {loading ? (
        <UsersSkeleton />
      ) : error ? (
        <ErrorState
          title="Could not load users"
          message={error}
          onRetry={refresh}
        />
      ) : users.length === 0 ? (
        <EmptyState
          icon={Users}
          title={filterActive ? "No users match these filters" : "No users found"}
          description={
            filterActive
              ? "Try a different search term or role filter to find the account you need."
              : "Registered customer, technician, and admin accounts will appear here."
          }
          action={
            filterActive ? (
              <Button type="button" variant="outline" onClick={clearFilters}>
                <X aria-hidden="true" />
                Clear filters
              </Button>
            ) : undefined
          }
        />
      ) : (
        <div className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2 px-1 text-sm">
            <p className="font-medium" aria-live="polite">
              {pluralize(total, "user")}
              {filterActive ? " matching filters" : ""}
            </p>
            <p className="text-xs text-muted-foreground">
              Newest accounts appear first
            </p>
          </div>

          <div className="space-y-3">
            {users.map((user) => (
              <UserCard
                key={getUserId(user)}
                user={user}
                isSelf={isSameUser(user)}
                onChangeRole={() => setEditor(user)}
              />
            ))}
          </div>
        </div>
      )}

      {editor ? (
        <UserRoleDialog
          key={getUserId(editor)}
          user={editor}
          onClose={() => setEditor(null)}
          onUpdated={refresh}
        />
      ) : null}
    </div>
  );
}
