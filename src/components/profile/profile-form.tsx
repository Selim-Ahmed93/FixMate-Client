"use client";

import * as React from "react";
import {
  Camera,
  Loader2,
  Mail,
  MapPin,
  Phone,
  Save,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { ErrorState } from "@/components/shared/error-state";
import { PageHeader } from "@/components/dashboard/page-header";
import { useSession } from "@/components/providers/session-provider";
import { useToast } from "@/components/providers/toast-provider";
import { api, getErrorMessage } from "@/lib/api";
import { formatDate, initials, roleLabels } from "@/lib/format";
import type { ProfileInput, User } from "@/lib/types";

interface FormValues {
  name: string;
  phone: string;
  area: string;
  bio: string;
}

type FormErrors = Partial<Record<keyof FormValues, string>>;

const PHONE_PATTERN = /^[+]?[\d\s().-]{7,25}$/;
const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
];
const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const fieldOrder: Array<keyof FormValues> = ["name", "phone", "area", "bio"];

function valuesFromUser(user: User): FormValues {
  return {
    name: user.name ?? "",
    phone: user.phone ?? "",
    area: user.area ?? "",
    bio: user.bio ?? "",
  };
}

function validate(values: FormValues): FormErrors {
  const errors: FormErrors = {};
  const name = values.name.trim();
  const phone = values.phone.trim();
  const area = values.area.trim();
  const bio = values.bio.trim();

  if (!name) {
    errors.name = "Name is required.";
  } else if (name.length < 2 || name.length > 100) {
    errors.name = "Use between 2 and 100 characters.";
  }

  if (phone && !PHONE_PATTERN.test(phone)) {
    errors.phone = "Enter a valid phone number with at least 7 digits.";
  }

  if (area.length > 100) {
    errors.area = "Use 100 characters or fewer.";
  }

  if (bio.length > 500) {
    errors.bio = "Use 500 characters or fewer.";
  }

  return errors;
}

function ProfileSkeleton() {
  return (
    <div className="space-y-6" aria-busy="true" aria-label="Loading profile">
      <div className="space-y-2">
        <Skeleton className="h-9 w-40" />
        <Skeleton className="h-4 w-96 max-w-full" />
      </div>
      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <Skeleton className="h-96 rounded-2xl" />
        <div className="space-y-6">
          <Skeleton className="h-64 rounded-2xl" />
          <Skeleton className="h-40 rounded-2xl" />
        </div>
      </div>
    </div>
  );
}

function Field({
  id,
  label,
  error,
  hint,
  className,
  children,
}: {
  id: string;
  label: string;
  error?: string;
  hint: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={className ? `space-y-1.5 ${className}` : "space-y-1.5"}>
      <Label htmlFor={id}>{label}</Label>
      {children}
      {error ? (
        <p id={`${id}-error`} className="text-xs font-medium text-destructive">
          {error}
        </p>
      ) : (
        <p id={`${id}-hint`} className="text-xs text-muted-foreground">
          {hint}
        </p>
      )}
    </div>
  );
}

export function ProfileForm() {
  const { refresh } = useSession();
  const { toast } = useToast();
  const [profile, setProfile] = React.useState<User | null>(null);
  const [values, setValues] = React.useState<FormValues>({
    name: "",
    phone: "",
    area: "",
    bio: "",
  });
  const [errors, setErrors] = React.useState<FormErrors>({});
  const [formError, setFormError] = React.useState<string | null>(null);
  const [imageError, setImageError] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [loadError, setLoadError] = React.useState<string | null>(null);
  const [saving, setSaving] = React.useState(false);
  const [uploading, setUploading] = React.useState(false);
  const inFlight = React.useRef(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const load = React.useCallback(async () => {
    setLoading(true);
    setLoadError(null);

    try {
      const response = await api.profile.get();
      setProfile(response.user);
      setValues(valuesFromUser(response.user));
    } catch (reason) {
      setLoadError(getErrorMessage(reason));
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    let active = true;

    api.profile
      .get()
      .then((response) => {
        if (!active) return;
        setProfile(response.user);
        setValues(valuesFromUser(response.user));
      })
      .catch((reason) => {
        if (active) setLoadError(getErrorMessage(reason));
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  function updateValue(field: keyof FormValues, value: string) {
    setValues((current) => ({ ...current, [field]: value }));
    setErrors((current) => {
      if (!current[field]) return current;
      const next = { ...current };
      delete next[field];
      return next;
    });
  }

  function describedBy(field: keyof FormValues, id: string) {
    return errors[field] ? `${id}-error` : `${id}-hint`;
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (inFlight.current) return;

    const nextErrors = validate(values);
    setErrors(nextErrors);
    setFormError(null);

    const firstInvalid = fieldOrder.find((field) => nextErrors[field]);
    if (firstInvalid) {
      document.getElementById(`profile-${firstInvalid}`)?.focus();
      return;
    }

    const input: ProfileInput = {
      name: values.name.trim(),
      bio: values.bio.trim(),
    };

    if (values.phone.trim()) input.phone = values.phone.trim();
    if (values.area.trim()) input.area = values.area.trim();

    inFlight.current = true;
    setSaving(true);

    try {
      const response = await api.profile.update(input);
      setProfile(response.user);
      setValues(valuesFromUser(response.user));
      toast({
        title: "Profile updated",
        description: "Your profile details were saved.",
        variant: "success",
      });
      await refresh();
    } catch (reason) {
      const message = getErrorMessage(reason);
      setFormError(message);
      toast({
        title: "Could not update profile",
        description: message,
        variant: "error",
      });
    } finally {
      inFlight.current = false;
      setSaving(false);
    }
  }

  function handlePickImage() {
    setImageError(null);
    fileInputRef.current?.click();
  }

  async function handleImageChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) return;

    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      setImageError("Choose a JPEG, PNG, WebP, or GIF image.");
      return;
    }

    if (file.size > MAX_IMAGE_BYTES) {
      setImageError("Choose an image smaller than 5 MB.");
      return;
    }

    setUploading(true);
    setImageError(null);

    try {
      const response = await api.profile.uploadImage(file);
      setProfile(response.user);
      toast({
        title: "Profile image updated",
        description: "Your new image is now used across FixMate.",
        variant: "success",
      });
      await refresh();
    } catch (reason) {
      const message = getErrorMessage(reason);
      setImageError(message);
      toast({
        title: "Could not upload image",
        description: message,
        variant: "error",
      });
    } finally {
      setUploading(false);
    }
  }

  if (loading) return <ProfileSkeleton />;

  if (loadError || !profile) {
    return (
      <ErrorState
        title="Could not load your profile"
        message={loadError ?? "Your profile could not be loaded."}
        onRetry={load}
      />
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Profile"
        description="Keep your contact details and profile image up to date. Your name and phone are used on the bookings you create."
      />

      <div className="grid gap-6 lg:grid-cols-[1fr_320px] lg:items-start">
        <Card>
          <CardHeader className="border-b">
            <CardTitle className="text-base">Profile details</CardTitle>
            <CardDescription>
              Update the information attached to your FixMate account.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <form
              onSubmit={handleSubmit}
              noValidate
              aria-busy={saving}
              className="space-y-5"
            >
              {formError ? (
                <ErrorState
                  compact
                  title="Could not save your profile"
                  message={formError}
                />
              ) : null}

              <Field
                id="profile-name"
                label="Full name"
                hint="2–100 characters. Shown on bookings and account views."
                error={errors.name}
              >
                <Input
                  id="profile-name"
                  autoComplete="name"
                  value={values.name}
                  onChange={(event) => updateValue("name", event.target.value)}
                  maxLength={100}
                  placeholder="Your full name"
                  aria-invalid={errors.name ? true : undefined}
                  aria-describedby={describedBy("name", "profile-name")}
                  disabled={saving}
                />
              </Field>

              <div className="grid gap-4 sm:grid-cols-2">
                <Field
                  id="profile-phone"
                  label="Phone"
                  hint="Optional. Required before booking if no phone is saved."
                  error={errors.phone}
                >
                  <Input
                    id="profile-phone"
                    type="tel"
                    autoComplete="tel"
                    value={values.phone}
                    onChange={(event) =>
                      updateValue("phone", event.target.value)
                    }
                    maxLength={25}
                    placeholder="+880 17 1234 5678"
                    aria-invalid={errors.phone ? true : undefined}
                    aria-describedby={describedBy("phone", "profile-phone")}
                    disabled={saving}
                  />
                </Field>

                <Field
                  id="profile-area"
                  label="Area"
                  hint="Optional. Your usual service area or neighborhood."
                  error={errors.area}
                >
                  <Input
                    id="profile-area"
                    value={values.area}
                    onChange={(event) => updateValue("area", event.target.value)}
                    maxLength={100}
                    placeholder="e.g. Dhanmondi, Dhaka"
                    aria-invalid={errors.area ? true : undefined}
                    aria-describedby={describedBy("area", "profile-area")}
                    disabled={saving}
                  />
                </Field>
              </div>

              <Field
                id="profile-bio"
                label="Bio"
                hint="Optional. Up to 500 characters about you or your work."
                error={errors.bio}
              >
                <Textarea
                  id="profile-bio"
                  value={values.bio}
                  onChange={(event) => updateValue("bio", event.target.value)}
                  maxLength={500}
                  rows={4}
                  placeholder={
                    profile.role === "technician"
                      ? "Briefly describe your repair experience and specialties."
                      : "Anything a technician should know when visiting your home?"
                  }
                  aria-invalid={errors.bio ? true : undefined}
                  aria-describedby={describedBy("bio", "profile-bio")}
                  disabled={saving}
                  className="min-h-24"
                />
              </Field>

              <p className="text-xs leading-5 text-muted-foreground">
                Phone and area keep their saved values if you leave the field
                blank.
              </p>

              <div className="flex flex-col gap-2 border-t pt-5 sm:flex-row sm:justify-end">
                <Button type="submit" disabled={saving}>
                  {saving ? (
                    <Loader2 className="animate-spin" aria-hidden="true" />
                  ) : (
                    <Save aria-hidden="true" />
                  )}
                  {saving ? "Saving…" : "Save changes"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader className="border-b">
              <CardTitle className="text-base">Profile image</CardTitle>
              <CardDescription>
                JPEG, PNG, WebP, or GIF up to 5 MB.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center gap-4 pt-6 text-center">
              <div className="relative size-24 overflow-hidden rounded-full border bg-muted">
                {profile.image ? (
                  // Profile images are arbitrary backend-hosted URLs.
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={profile.image}
                    alt={`${profile.name} profile image`}
                    className="size-full object-cover"
                  />
                ) : (
                  <span className="flex size-full items-center justify-center bg-secondary text-2xl font-semibold text-secondary-foreground">
                    {initials(profile.name)}
                  </span>
                )}
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept={ALLOWED_IMAGE_TYPES.join(",")}
                onChange={handleImageChange}
                className="sr-only"
                tabIndex={-1}
              />

              <Button
                type="button"
                variant="outline"
                onClick={handlePickImage}
                disabled={uploading}
              >
                {uploading ? (
                  <Loader2 className="animate-spin" aria-hidden="true" />
                ) : (
                  <Camera aria-hidden="true" />
                )}
                {uploading
                  ? "Uploading…"
                  : profile.image
                    ? "Change image"
                    : "Upload image"}
              </Button>

              {imageError ? (
                <p
                  role="alert"
                  className="w-full rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs leading-5 text-rose-800"
                >
                  {imageError}
                </p>
              ) : (
                <p className="text-xs leading-5 text-muted-foreground">
                  Your image is uploaded to the backend and used across FixMate.
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="border-b">
              <CardTitle className="text-base">Account</CardTitle>
              <CardDescription>
                These details are managed by your account and role.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 pt-5 text-sm">
              <p className="flex min-w-0 items-center gap-2">
                <Mail
                  className="size-4 shrink-0 text-muted-foreground"
                  aria-hidden="true"
                />
                <span className="break-all">{profile.email}</span>
              </p>
              <p className="flex items-center gap-2">
                <ShieldCheck
                  className="size-4 shrink-0 text-muted-foreground"
                  aria-hidden="true"
                />
                {roleLabels[profile.role]}
              </p>
              <p className="flex items-center gap-2">
                <MapPin
                  className="size-4 shrink-0 text-muted-foreground"
                  aria-hidden="true"
                />
                {profile.area || "Area not provided"}
              </p>
              <Separator />
              <p className="flex items-center gap-2 text-xs text-muted-foreground">
                <UserRound className="size-3.5 shrink-0" aria-hidden="true" />
                Member since {formatDate(profile.createdAt)}
              </p>
            </CardContent>
          </Card>

          <div className="rounded-xl border bg-secondary/50 p-4 text-xs leading-5 text-muted-foreground">
            <p className="flex items-center gap-2 font-semibold text-foreground">
              <Phone className="size-4 text-primary" aria-hidden="true" />
              Booking contact
            </p>
            <p className="mt-1.5">
              When you book a service, the technician receives your name, email,
              and phone number from your account.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
