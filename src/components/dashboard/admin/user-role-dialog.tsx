"use client";

import * as React from "react";
import { Loader2, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ErrorState } from "@/components/shared/error-state";
import { useToast } from "@/components/providers/toast-provider";
import { api, getErrorMessage } from "@/lib/api";
import { roleLabels } from "@/lib/format";
import type { Role, User } from "@/lib/types";

const roleOptions: Array<{ value: Role; label: string }> = [
  { value: "customer", label: "Customer" },
  { value: "technician", label: "Technician" },
  { value: "admin", label: "Admin" },
];

const roleDescriptions: Record<Role, string> = {
  customer: "Can book services and manage their own bookings and payments.",
  technician: "Can manage service listings and handle assigned bookings.",
  admin: "Can manage users, roles, services, and platform-wide data.",
};

export function UserRoleDialog({
  user,
  onClose,
  onUpdated,
}: {
  user: User;
  onClose: () => void;
  onUpdated: () => void | Promise<void>;
}) {
  const { toast } = useToast();
  const inFlight = React.useRef(false);
  const [role, setRole] = React.useState<Role>(user.role);
  const [submitting, setSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const userId = user._id ?? user.id;
  const roleChanged = role !== user.role;

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (inFlight.current) return;

    if (!userId) {
      setError("This account is missing an identifier.");
      return;
    }

    if (!roleChanged) {
      setError("Select a different role to continue.");
      return;
    }

    inFlight.current = true;
    setSubmitting(true);
    setError(null);

    try {
      await api.admin.updateUserRole(userId, role);
      toast({
        title: "User role updated",
        description: `${user.name} is now a ${roleLabels[role].toLowerCase()}.`,
        variant: "success",
      });
      await onUpdated();
      onClose();
    } catch (reason) {
      const message = getErrorMessage(reason);
      setError(message);
      toast({
        title: "Could not update user role",
        description: message,
        variant: "error",
      });
    } finally {
      inFlight.current = false;
      setSubmitting(false);
    }
  }

  return (
    <Dialog
      open
      onOpenChange={(nextOpen) => {
        if (!nextOpen && !submitting) onClose();
      }}
    >
      <DialogContent
        className="max-h-[calc(100dvh-2rem)] overflow-y-auto sm:max-w-md"
        showCloseButton={!submitting}
      >
        <DialogHeader>
          <DialogTitle>Change user role</DialogTitle>
          <DialogDescription>
            Update the workspace role for {user.name}. The change takes effect
            immediately.
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={handleSubmit}
          noValidate
          aria-busy={submitting}
          className="space-y-4"
        >
          <div className="rounded-lg border bg-muted/40 p-3 text-sm">
            <p className="font-semibold">{user.name}</p>
            <p className="mt-0.5 break-all text-xs text-muted-foreground">
              {user.email}
            </p>
            <p className="mt-2 text-xs text-muted-foreground">
              Current role:{" "}
              <span className="font-medium text-foreground">
                {roleLabels[user.role]}
              </span>
            </p>
          </div>

          {error ? (
            <ErrorState
              compact
              title="Could not update user role"
              message={error}
            />
          ) : null}

          <div className="space-y-2">
            <Label htmlFor="user-role">New role</Label>
            <Select
              id="user-role"
              items={roleOptions}
              value={role}
              onValueChange={(value) => {
                if (typeof value === "string") {
                  setRole(value as Role);
                  setError(null);
                }
              }}
              disabled={submitting}
            >
              <SelectTrigger aria-label="New role" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {roleOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs leading-5 text-muted-foreground">
              {roleDescriptions[role]}
            </p>
          </div>

          <p className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs leading-5 text-amber-950">
            You cannot change your own role, and at least one admin account must
            remain. The backend enforces these rules and will reject invalid
            changes.
          </p>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={submitting || !roleChanged}>
              {submitting ? (
                <Loader2 className="animate-spin" aria-hidden="true" />
              ) : (
                <ShieldCheck aria-hidden="true" />
              )}
              {submitting ? "Updating…" : "Update role"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
