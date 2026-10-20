import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type FormSectionProps = {
  title: string;
  children: ReactNode;
  className?: string;
};

export default function FormSection({
  title,
  children,
  className,
}: FormSectionProps) {
  return (
    <fieldset
      className={cn(
        "shadow-divider flex min-w-0 flex-col gap-4 px-6 py-5 last:shadow-none",
        className,
      )}
    >
      <legend className="eyebrow-style text-fg-secondary float-left mb-0 w-full">
        {title}
      </legend>
      {children}
    </fieldset>
  );
}
