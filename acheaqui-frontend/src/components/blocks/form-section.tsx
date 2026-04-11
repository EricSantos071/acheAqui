"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import {
  Button,
  Input,
  Textarea,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Checkbox,
  Label,
} from "@/components/ui";
import { ContentWrapper, Section } from "@/components/layout";
import { useCSRFToken } from "@/hooks/use-csrf-token";
import { useUTMFormFields } from "@/hooks/use-utm-params";
import type { FormConfig, FormFieldConfig } from "@/types/page-config";

interface FormSectionProps {
  config: FormConfig;
  className?: string;
  formName: string;
  pageSlug?: string;
  pageUrl?: string;
}

interface FormState {
  isSubmitting: boolean;
  error: string | null;
  fieldErrors: Record<string, string>;
}

/**
 * Secure form section with CSRF protection and validation
 */
export function FormSection({
  config,
  className,
  formName,
  pageSlug,
  pageUrl,
}: FormSectionProps) {
  const router = useRouter();
  const { token: csrfToken, isLoading: csrfLoading, error: csrfError } = useCSRFToken();
  const utmFields = useUTMFormFields();
  const formRef = useRef<HTMLFormElement>(null);
  const startTimeRef = useRef<number>(0);

  useEffect(() => {
    startTimeRef.current = Date.now();
  }, []);

  const [state, setState] = useState<FormState>({
    isSubmitting: false,
    error: null,
    fieldErrors: {},
  });

  const [gdprConsent, setGdprConsent] = useState(false);

  // Reset start time when component mounts (for bot detection)
  useEffect(() => {
    startTimeRef.current = Date.now();
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!csrfToken) {
      setState((prev) => ({
        ...prev,
        error: "Security token not available. Please refresh and try again.",
      }));
      return;
    }

    setState({ isSubmitting: true, error: null, fieldErrors: {} });

    const formData = new FormData(e.currentTarget);
    const fields: Record<string, string> = {};

    // Collect form fields
    for (const [key, value] of formData.entries()) {
      if (typeof value === "string") {
        fields[key] = value;
      }
    }

    // Add UTM params
    Object.assign(fields, utmFields);

    // Calculate submission time for bot detection
    const submissionTime = Date.now() - startTimeRef.current;

    try {
      const response = await fetch("/api/form", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-Token": csrfToken,
        },
        body: JSON.stringify({
          fields,
          formName,
          pageSlug,
          pageUrl: pageUrl || window.location.href,
          hubspotPortalId: config.hubspotPortalId,
          hubspotFormId: config.hubspotFormId,
          gdprConsent,
          submissionTime,
          customerio: config.customerio,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.details) {
          setState({
            isSubmitting: false,
            error: "Please fix the errors below.",
            fieldErrors: data.details,
          });
        } else {
          setState({
            isSubmitting: false,
            error: data.error || "Something went wrong. Please try again.",
            fieldErrors: {},
          });
        }
        return;
      }

      // Success - redirect if configured
      if (config.successRedirect) {
        router.push(config.successRedirect);
      } else {
        // Reset form
        formRef.current?.reset();
        setGdprConsent(false);
        setState({
          isSubmitting: false,
          error: null,
          fieldErrors: {},
        });
      }
    } catch {
      setState({
        isSubmitting: false,
        error: "Network error. Please check your connection and try again.",
        fieldErrors: {},
      });
    }
  };

  return (
    <Section className={className} id="form">
      <ContentWrapper>
        <div className="max-w-xl mx-auto">
          {(config.title || config.subtitle) && (
            <div className="text-center mb-8">
              {config.title && (
                <h2 className="text-2xl sm:text-3xl font-medium text-foreground mb-2">
                  {config.title}
                </h2>
              )}
              {config.subtitle && (
                <p className="text-muted-foreground">{config.subtitle}</p>
              )}
            </div>
          )}

          {csrfError && (
            <div className="mb-6 p-4 rounded-lg bg-destructive/10 text-destructive text-sm">
              Unable to load security token. Please refresh the page.
            </div>
          )}

          {state.error && (
            <div
              className="mb-6 p-4 rounded-lg bg-destructive/10 text-destructive text-sm"
              role="alert"
            >
              {state.error}
            </div>
          )}

          <form
            ref={formRef}
            onSubmit={handleSubmit}
            className="space-y-6"
            noValidate
          >
            {config.fields.map((field) => (
              <FormField
                key={field.name}
                field={field}
                error={state.fieldErrors[field.name]}
              />
            ))}

            {config.gdprText && (
              <div className="flex items-start gap-3">
                <Checkbox
                  id="gdpr-consent"
                  checked={gdprConsent}
                  onCheckedChange={(checked) =>
                    setGdprConsent(checked === true)
                  }
                  required
                />
                <Label
                  htmlFor="gdpr-consent"
                  className="text-sm text-muted-foreground leading-normal cursor-pointer"
                >
                  {typeof config.gdprText === "string" ? (
                    config.gdprText
                  ) : (
                    config.gdprText
                  )}
                </Label>
              </div>
            )}

            <Button
              type="submit"
              size="lg"
              className="w-full"
              disabled={state.isSubmitting || csrfLoading || !csrfToken}
            >
              {state.isSubmitting && <Loader2 className="animate-spin" />}
              {config.submitLabel || "Submit"}
            </Button>
          </form>
        </div>
      </ContentWrapper>
    </Section>
  );
}

interface FormFieldProps {
  field: FormFieldConfig;
  error?: string;
}

function FormField({ field, error }: FormFieldProps) {
  const { name, label, type, placeholder, required, options, validation } =
    field;

  const inputProps = {
    name,
    placeholder,
    required,
    minLength: validation?.minLength,
    maxLength: validation?.maxLength,
    pattern: validation?.pattern,
  };

  return (
    <div>
      <Label htmlFor={name} className="mb-3 block">
        {label}
        {required && <span className="text-destructive ml-1">*</span>}
      </Label>

      {type === "textarea" ? (
        <>
          <Textarea id={name} rows={4} {...inputProps} />
          {error && <p className="text-sm text-destructive mt-1">{error}</p>}
        </>
      ) : type === "select" && options ? (
        <>
          <Select name={name} required={required}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder={placeholder || `Select ${label}`} />
            </SelectTrigger>
            <SelectContent>
              {options.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {error && <p className="text-sm text-destructive mt-1">{error}</p>}
        </>
      ) : (
        <>
          <Input id={name} type={type} {...inputProps} />
          {error && <p className="text-sm text-destructive mt-1">{error}</p>}
        </>
      )}
    </div>
  );
}
