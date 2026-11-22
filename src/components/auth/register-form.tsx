"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Eye,
  EyeOff,
  Loader2,
  UserPlus,
  UserRound,
  Wrench,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useSession } from "@/components/providers/session-provider";
import { useToast } from "@/components/providers/toast-provider";
import { getErrorMessage } from "@/lib/api";
import { dashboardPrefix } from "@/lib/config";
import { cn } from "cn";
import type { Role } from "@/lib/types";

const signupRoles: Array<{
  value: Extract<Role, "customer" | "technician">;
  label: string;
  description: string;
  icon: typeof UserRound;
}> = [
  {
    value: "customer",
    label: "I need a repair",
    description: "Book services and manage your home jobs.",
    icon: UserRound,
  },
  {
    value: "technician",
    label: "I fix things",
    description: "List services and manage assigned bookings.",
    icon: Wrench,
  },
];

function safeNext(value: string | null): string | null {
  if (!value || !value.startsWith("/") || value.startsWith("//")) return null;
  return value;
}

export function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { signUp, user, status } = useSession();
  const { toast } = useToast();
  const requestedRole = searchParams.get("role");
  const next = safeNext(searchParams.get("next"));
  const [role, setRole] = React.useState<"customer" | "technician">(
    requestedRole === "technician" ? "technician" : "customer",
  );
  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [phone, setPhone] = React.useState("");
  const [area, setArea] = React.useState("");
  const [bio, setBio] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [showPassword, setShowPassword] = React.useState(false);
  const [submitting, setSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (status === "authenticated" && user) {
      router.replace(next ?? dashboardPrefix[user.role]);
    }
  }, [next, router, status, user]);

  function validate(): string | null {
    if (name.trim().length < 2) return "Enter your full name.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      return "Enter a valid email address.";
    }
    if (phone.trim() && phone.replace(/\D/g, "").length < 7) {
      return "Enter a valid phone number with at least 7 digits.";
    }
    if (area.trim().length > 100) return "Area must be 100 characters or fewer.";
    if (bio.trim().length > 500) return "Bio must be 500 characters or fewer.";
    if (password.length < 8) return "Password must be at least 8 characters.";
    if (password.length > 128) return "Password must be 128 characters or fewer.";
    if (password !== confirmPassword) return "The passwords do not match.";
    return null;
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setSubmitting(true);
    try {
      await signUp({
        name: name.trim(),
        email: email.trim(),
        password,
        role,
        ...(phone.trim() ? { phone: phone.trim() } : {}),
        ...(area.trim() ? { area: area.trim() } : {}),
        ...(bio.trim() ? { bio: bio.trim() } : {}),
      });
      toast({
        title: "Account created",
        description:
          role === "technician"
            ? "Add your first service from the technician dashboard."
            : "You can start booking approved services now.",
      });
      router.replace(next ?? dashboardPrefix[role]);
      router.refresh();
    } catch (reason) {
      const message = getErrorMessage(reason);
      setError(message);
      toast({
        title: "Could not create account",
        description: message,
        variant: "error",
      });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5" noValidate>
      {error ? (
        <div
          role="alert"
          className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-800"
        >
          {error}
        </div>
      ) : null}

      <fieldset>
        <legend className="mb-2 text-sm font-medium">I want to join as</legend>
        <div className="grid gap-2 sm:grid-cols-2">
          {signupRoles.map((option) => {
            const Icon = option.icon;
            const selected = role === option.value;
            return (
              <label
                key={option.value}
                className={cn(
                  "relative flex cursor-pointer gap-3 rounded-xl border p-3 transition focus-within:ring-2 focus-within:ring-ring",
                  selected
                    ? "border-primary bg-primary/5 shadow-sm"
                    : "bg-background hover:border-primary/30",
                )}
              >
                <input
                  type="radio"
                  name="role"
                  value={option.value}
                  checked={selected}
                  onChange={() => setRole(option.value)}
                  className="sr-only"
                  disabled={submitting}
                />
                <span
                  className={cn(
                    "mt-0.5 grid size-9 shrink-0 place-items-center rounded-lg",
                    selected
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground",
                  )}
                >
                  <Icon className="size-4" aria-hidden="true" />
                </span>
                <span>
                  <span className="block text-sm font-semibold">
                    {option.label}
                  </span>
                  <span className="mt-0.5 block text-xs leading-5 text-muted-foreground">
                    {option.description}
                  </span>
                </span>
              </label>
            );
          })}
        </div>
      </fieldset>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="register-name">Full name</Label>
          <Input
            id="register-name"
            autoComplete="name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Your full name"
            required
            minLength={2}
            maxLength={100}
            className="h-10"
            disabled={submitting}
          />
        </div>

        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="register-email">Email address</Label>
          <Input
            id="register-email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="you@example.com"
            required
            className="h-10"
            disabled={submitting}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="register-phone">
            Phone <span className="font-normal text-muted-foreground">(optional)</span>
          </Label>
          <Input
            id="register-phone"
            type="tel"
            autoComplete="tel"
            value={phone}
            onChange={(event) => setPhone(event.target.value)}
            placeholder="+880 17 1234 5678"
            maxLength={25}
            className="h-10"
            disabled={submitting}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="register-area">
            Area <span className="font-normal text-muted-foreground">(optional)</span>
          </Label>
          <Input
            id="register-area"
            value={area}
            onChange={(event) => setArea(event.target.value)}
            placeholder="e.g. Dhanmondi, Dhaka"
            maxLength={100}
            className="h-10"
            disabled={submitting}
          />
        </div>

        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="register-bio">
            {role === "technician" ? "About your work" : "About you"}{" "}
            <span className="font-normal text-muted-foreground">(optional)</span>
          </Label>
          <Textarea
            id="register-bio"
            value={bio}
            onChange={(event) => setBio(event.target.value)}
            placeholder={
              role === "technician"
                ? "Briefly describe your repair experience and specialties."
                : "Anything a technician should know when visiting your home?"
            }
            maxLength={500}
            rows={2}
            disabled={submitting}
          />
          <p className="field-help">{bio.length}/500 characters</p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="register-password">Password</Label>
          <div className="relative">
            <Input
              id="register-password"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="At least 8 characters"
              required
              minLength={8}
              maxLength={128}
              className="h-10 pr-10"
              disabled={submitting}
            />
            <button
              type="button"
              onClick={() => setShowPassword((value) => !value)}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1.5 text-muted-foreground transition hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? (
                <EyeOff className="size-4" aria-hidden="true" />
              ) : (
                <Eye className="size-4" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="register-confirm">Confirm password</Label>
          <Input
            id="register-confirm"
            type={showPassword ? "text" : "password"}
            autoComplete="new-password"
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            placeholder="Repeat your password"
            required
            minLength={8}
            maxLength={128}
            className="h-10"
            disabled={submitting}
          />
        </div>
      </div>

      <Button type="submit" className="h-10 w-full" disabled={submitting}>
        {submitting ? (
          <Loader2 className="animate-spin" aria-hidden="true" />
        ) : (
          <UserPlus aria-hidden="true" />
        )}
        {submitting ? "Creating your account…" : "Create account"}
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link
          href={`/login${next ? `?next=${encodeURIComponent(next)}` : ""}`}
          className="font-semibold text-primary hover:underline"
        >
          Sign in
        </Link>
      </p>
    </form>
  );
}
