import { cva, type VariantProps } from "class-variance-authority";
import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

export const tagVariants = cva(
  "inline-flex shrink-0 items-center justify-center whitespace-nowrap rounded-full border text-sm leading-none tabular-nums",
  {
    variants: {
      tone: {
        blue: "border-(--tag-blue-border) bg-(--tag-blue-bg) text-(--tag-blue-text)",
        purple:
          "border-(--tag-purple-border) bg-(--tag-purple-bg) text-(--tag-purple-text)",
        green:
          "border-(--tag-green-border) bg-(--tag-green-bg) text-(--tag-green-text)",
        moss: "border-(--tag-moss-border) bg-(--tag-moss-bg) text-(--tag-moss-text)",
        red: "border-(--tag-red-border) bg-(--tag-red-bg) text-(--tag-red-text)",
        orange:
          "border-(--tag-orange-border) bg-(--tag-orange-bg) text-(--tag-orange-text)",
        amber:
          "border-(--tag-amber-border) bg-(--tag-amber-bg) text-(--tag-amber-text)",
        teal: "border-(--tag-teal-border) bg-(--tag-teal-bg) text-(--tag-teal-text)",
        yellow:
          "border-(--tag-yellow-border) bg-(--tag-yellow-bg) text-(--tag-yellow-text)",
        neutral:
          "border-(--tag-neutral-border) bg-(--tag-neutral-bg) text-(--tag-neutral-text)",
      },
      size: {
        md: "h-5.5 px-2",
        sm: "h-5.5 px-1.5",
        xs: "caption-style h-5 gap-1 px-1.5",
      },
    },
    defaultVariants: {
      tone: "neutral",
      size: "md",
    },
  },
);

type TagProps = ComponentProps<"span"> & VariantProps<typeof tagVariants>;

export default function Tag({ tone, size, className, ...props }: TagProps) {
  return (
    <span className={cn(tagVariants({ tone, size }), className)} {...props} />
  );
}
