import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

export default function Kbd({ className, ...props }: ComponentProps<"kbd">) {
  return (
    <kbd
      data-slot="kbd"
      className={cn(
        "border-line-strong bg-muted text-fg-secondary inline-flex h-5 min-w-5 items-center justify-center rounded-md border px-1.5 text-[11px] leading-none",
        className,
      )}
      {...props}
    />
  );
}
