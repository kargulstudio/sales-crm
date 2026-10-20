import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

export default function CountBadge({
  className,
  ...props
}: ComponentProps<"span">) {
  return (
    <span
      className={cn(
        "caption-style border-line-strong bg-muted text-fg-secondary inline-flex h-4 min-w-6 shrink-0 items-center justify-center rounded-full border-[0.5px] px-1 text-center tabular-nums",
        className,
      )}
      {...props}
    />
  );
}
