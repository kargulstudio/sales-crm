import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

function Input({
  className,
  type = "text",
  ...props
}: ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "border-input bg-secondary text-foreground duration-fast ease-power3-out placeholder:text-fg-tertiary focus-visible:border-selected focus-visible:ring-selected/20 flex h-9 w-full min-w-0 rounded-lg border px-3 text-sm leading-none transition-[border-color,box-shadow] outline-none focus-visible:ring-3 disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...props}
    />
  );
}

export { Input };
