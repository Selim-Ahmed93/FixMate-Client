"use client";

import * as React from "react";
import {
  Info,
  Loader2,
  Save,
  ShieldAlert,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ErrorState } from "@/components/shared/error-state";
import { useToast } from "@/components/providers/toast-provider";
import { api, getErrorMessage } from "@/lib/api";
import type { Service, ServiceInput } from "@/lib/types";

interface FormValues {
  title: string;
  category: string;
  description: string;
  image: string;
  basePrice: string;
  estimatedDuration: string;
  serviceMode: string;
  serviceArea: string;
}

type FormErrors = Partial<Record<keyof FormValues, string>>;

const fieldOrder: Array<keyof FormValues> = [
  "title",
  "category",
  "basePrice",
  "description",
  "image",
  "estimatedDuration",
  "serviceMode",
  "serviceArea",
];

function initialValues(service?: Service | null): FormValues {
  return {
    title: service?.title ?? "",
    category: service?.category ?? "",
    description: service?.description ?? "",
    image: service?.image ?? "",
    basePrice: service ? String(service.basePrice) : "",
    estimatedDuration: service?.estimatedDuration ?? "",
    serviceMode: service?.serviceMode ?? "",
    serviceArea: service?.serviceArea ?? "",
  };
}

function validate(values: FormValues): FormErrors {
  const errors: FormErrors = {};
  const title = values.title.trim();
  const category = values.category.trim();
  const description = values.description.trim();
  const image = values.image.trim();
  const estimatedDuration = values.estimatedDuration.trim();
  const serviceMode = values.serviceMode.trim();
  const serviceArea = values.serviceArea.trim();

  if (!title) {
    errors.title = "Title is required.";
  } else if (title.length < 3 || title.length > 100) {
    errors.title = "Use between 3 and 100 characters.";
  }

  if (!category) {
    errors.category = "Category is required.";
  } else if (category.length < 2 || category.length > 60) {
    errors.category = "Use between 2 and 60 characters.";
  }

  if (!description) {
    errors.description = "Description is required.";
  } else if (description.length < 10 || description.length > 2000) {
    errors.description = "Use between 10 and 2,000 characters.";
  }

  if (!values.basePrice.trim()) {
    errors.basePrice = "Base price is required.";
  } else {
    const price = Number(values.basePrice);
    if (!Number.isFinite(price) || price <= 0) {
      errors.basePrice = "Enter a price greater than 0.";
    }
  }

  if (image) {
    if (image.length > 2048) {
      errors.image = "Use an image URL of 2,048 characters or fewer.";
    } else {
      try {
        const url = new URL(image);
        if (url.protocol !== "http:" && url.protocol !== "https:") {
          errors.image = "Use a full http:// or https:// image URL.";
        }
      } catch {
        errors.image = "Enter a valid http:// or https:// image URL.";
      }
    }
  }

  if (!estimatedDuration) {
    errors.estimatedDuration = "Estimated duration is required.";
  } else if (estimatedDuration.length > 100) {
    errors.estimatedDuration = "Use 100 characters or fewer.";
  }

  if (!serviceMode) {
    errors.serviceMode = "Service mode is required.";
  } else if (serviceMode.length > 50) {
    errors.serviceMode = "Use 50 characters or fewer.";
  }

  if (!serviceArea) {
    errors.serviceArea = "Service area is required.";
  } else if (serviceArea.length > 100) {
    errors.serviceArea = "Use 100 characters or fewer.";
  }

  return errors;
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

export function ServiceFormDialog({
  service,
  onClose,
  onSaved,
}: {
  service?: Service | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const { toast } = useToast();
  const isEdit = Boolean(service);
  const [values, setValues] = React.useState<FormValues>(() =>
    initialValues(service),
  );
  const [errors, setErrors] = React.useState<FormErrors>({});
  const [formError, setFormError] = React.useState<string | null>(null);
  const [submitting, setSubmitting] = React.useState(false);

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
    if (submitting) return;

    const nextErrors = validate(values);
    setErrors(nextErrors);
    setFormError(null);

    const firstInvalid = fieldOrder.find((field) => nextErrors[field]);
    if (firstInvalid) {
      document.getElementById(`service-${firstInvalid}`)?.focus();
      return;
    }

    const input: ServiceInput = {
      title: values.title.trim(),
      category: values.category.trim(),
      description: values.description.trim(),
      image: values.image.trim() || null,
      basePrice: Number(values.basePrice),
      estimatedDuration: values.estimatedDuration.trim(),
      serviceMode: values.serviceMode.trim(),
      serviceArea: values.serviceArea.trim(),
    };

    setSubmitting(true);

    try {
      if (service) {
        await api.services.update(service._id, input);
        toast({
          title: "Service updated",
          description: `"${input.title}" was sent back for admin approval.`,
          variant: "success",
        });
      } else {
        await api.services.create(input);
        toast({
          title: "Service submitted",
          description: `"${input.title}" is pending admin approval.`,
          variant: "success",
        });
      }

      setSubmitting(false);
      onSaved();
      onClose();
    } catch (reason) {
      const message = getErrorMessage(reason);
      setSubmitting(false);
      setFormError(message);
      toast({
        title: isEdit ? "Could not update service" : "Could not create service",
        description: message,
        variant: "error",
      });
    }
  }

  return (
    <Dialog
      open
      onOpenChange={(nextOpen) => {
        if (!nextOpen && !submitting) onClose();
      }}
    >
      <DialogContent className="max-h-[calc(100dvh-2rem)] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? "Edit service" : "Create a service"}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Update the details customers see. Saving changes resets admin approval."
              : "Add a listing to your technician profile. New services start as pending."}
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={handleSubmit}
          noValidate
          aria-busy={submitting}
          className="space-y-4"
        >
          {isEdit ? (
            <div className="flex gap-3 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm leading-5 text-amber-950">
              <ShieldAlert
                className="mt-0.5 size-4 shrink-0"
                aria-hidden="true"
              />
              <p>
                Saving any change returns this service to{" "}
                <strong>Pending</strong> approval. It stays hidden from the
                public catalog until an admin approves it again.
              </p>
            </div>
          ) : (
            <div className="flex gap-3 rounded-lg border border-sky-200 bg-sky-50 p-3 text-sm leading-5 text-sky-950">
              <Info className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
              <p>
                New services start as <strong>Pending</strong>. They appear in
                the public catalog only after an admin approves them.
              </p>
            </div>
          )}

          {formError ? (
            <ErrorState
              compact
              title="Could not save this service"
              message={formError}
            />
          ) : null}

          <div className="grid gap-4 sm:grid-cols-2">
            <Field
              id="service-title"
              label="Title"
              hint="3–100 characters."
              error={errors.title}
              className="sm:col-span-2"
            >
              <Input
                id="service-title"
                value={values.title}
                onChange={(event) => updateValue("title", event.target.value)}
                maxLength={100}
                placeholder="Washing machine repair"
                aria-invalid={errors.title ? true : undefined}
                aria-describedby={describedBy("title", "service-title")}
                disabled={submitting}
              />
            </Field>

            <Field
              id="service-category"
              label="Category"
              hint="2–60 characters, for example Appliance Repair."
              error={errors.category}
            >
              <Input
                id="service-category"
                value={values.category}
                onChange={(event) =>
                  updateValue("category", event.target.value)
                }
                maxLength={60}
                placeholder="Appliance Repair"
                aria-invalid={errors.category ? true : undefined}
                aria-describedby={describedBy("category", "service-category")}
                disabled={submitting}
              />
            </Field>

            <Field
              id="service-basePrice"
              label="Base price (USD)"
              hint="Starting price in USD. Must be greater than 0."
              error={errors.basePrice}
            >
              <Input
                id="service-basePrice"
                type="number"
                inputMode="decimal"
                min="0.01"
                step="0.01"
                value={values.basePrice}
                onChange={(event) =>
                  updateValue("basePrice", event.target.value)
                }
                placeholder="45"
                aria-invalid={errors.basePrice ? true : undefined}
                aria-describedby={describedBy("basePrice", "service-basePrice")}
                disabled={submitting}
              />
            </Field>

            <Field
              id="service-description"
              label="Description"
              hint="10–2,000 characters. Explain what the service includes."
              error={errors.description}
              className="sm:col-span-2"
            >
              <Textarea
                id="service-description"
                value={values.description}
                onChange={(event) =>
                  updateValue("description", event.target.value)
                }
                maxLength={2000}
                rows={4}
                placeholder="Diagnosis and repair for front-load and top-load machines."
                aria-invalid={errors.description ? true : undefined}
                aria-describedby={describedBy(
                  "description",
                  "service-description",
                )}
                disabled={submitting}
                className="min-h-24"
              />
            </Field>

            <Field
              id="service-image"
              label="Image URL (optional)"
              hint="Optional. Use a full http:// or https:// image URL."
              error={errors.image}
              className="sm:col-span-2"
            >
              <Input
                id="service-image"
                type="url"
                inputMode="url"
                value={values.image}
                onChange={(event) => updateValue("image", event.target.value)}
                maxLength={2048}
                placeholder="https://example.com/service.jpg"
                aria-invalid={errors.image ? true : undefined}
                aria-describedby={describedBy("image", "service-image")}
                disabled={submitting}
              />
            </Field>

            <Field
              id="service-estimatedDuration"
              label="Estimated duration"
              hint="1–100 characters, for example 60 minutes."
              error={errors.estimatedDuration}
            >
              <Input
                id="service-estimatedDuration"
                value={values.estimatedDuration}
                onChange={(event) =>
                  updateValue("estimatedDuration", event.target.value)
                }
                maxLength={100}
                placeholder="60 minutes"
                aria-invalid={errors.estimatedDuration ? true : undefined}
                aria-describedby={describedBy(
                  "estimatedDuration",
                  "service-estimatedDuration",
                )}
                disabled={submitting}
              />
            </Field>

            <Field
              id="service-serviceMode"
              label="Service mode"
              hint="1–50 characters, for example On-site or Remote."
              error={errors.serviceMode}
            >
              <Input
                id="service-serviceMode"
                value={values.serviceMode}
                onChange={(event) =>
                  updateValue("serviceMode", event.target.value)
                }
                maxLength={50}
                placeholder="On-site"
                aria-invalid={errors.serviceMode ? true : undefined}
                aria-describedby={describedBy(
                  "serviceMode",
                  "service-serviceMode",
                )}
                disabled={submitting}
              />
            </Field>

            <Field
              id="service-serviceArea"
              label="Service area"
              hint="1–100 characters, for example Dhaka."
              error={errors.serviceArea}
              className="sm:col-span-2"
            >
              <Input
                id="service-serviceArea"
                value={values.serviceArea}
                onChange={(event) =>
                  updateValue("serviceArea", event.target.value)
                }
                maxLength={100}
                placeholder="Dhaka"
                aria-invalid={errors.serviceArea ? true : undefined}
                aria-describedby={describedBy(
                  "serviceArea",
                  "service-serviceArea",
                )}
                disabled={submitting}
              />
            </Field>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? (
                <Loader2 className="animate-spin" aria-hidden="true" />
              ) : isEdit ? (
                <Save aria-hidden="true" />
              ) : (
                <Sparkles aria-hidden="true" />
              )}
              {submitting
                ? isEdit
                  ? "Saving…"
                  : "Creating…"
                : isEdit
                  ? "Save changes"
                  : "Create service"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
