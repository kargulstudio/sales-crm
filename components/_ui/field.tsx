import type { ReactNode } from "react";
import { Label } from "@/components/_ui/label";
import { cn } from "@/lib/utils";

type FieldProps = {
  label: string;
  htmlFor: string;
  required?: boolean;
  hint?: string;
  error?: string;
  trailing?: ReactNode;
  className?: string;
  children: ReactNode;
};

export default function Field({
  label,
  htmlFor,
  required,
  hint,
  error,
  trailing,
  className,
  children,
}: FieldProps) {
  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <div className="flex items-center justify-between gap-2">
        <Label htmlFor={htmlFor}>
          {label}
          {required && (
            <span aria-hidden className="text-fg-tertiary">
              {" "}
              *
            </span>
          )}
        </Label>
        {trailing}
      </div>
      {children}
      {error ? (
        <span
          id={`${htmlFor}-error`}
          role="alert"
          className="caption-style text-danger block leading-snug"
        >
          {error}
        </span>
      ) : (
        hint && (
          <span
            id={`${htmlFor}-hint`}
            className="caption-style text-fg-tertiary block leading-snug"
          >
            {hint}
          </span>
        )
      )}
    </div>
  );
}
