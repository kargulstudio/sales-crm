import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

export default function Skeleton({
  className,
  ...props
}: ComponentProps<"span">) {
  return (
    <span
      aria-hidden
      className={cn(
        "bg-overlay-3 block animate-pulse rounded-sm motion-reduce:animate-none",
        className,
      )}
      {...props}
    />
  );
}
