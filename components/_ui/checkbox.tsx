"use client";

import type { ComponentProps } from "react";
import { Checkbox as CheckboxPrimitive } from "radix-ui";
import { cn } from "@/lib/utils";
import SquareIcon from "@/public/assets/images/companies/table/square.svg";
import CheckSquareIcon from "@/public/assets/images/companies/table/check-square.svg";
import MinusSquareIcon from "@/public/assets/images/companies/table/minus-square.svg";

function Checkbox({
  className,
  ...props
}: ComponentProps<typeof CheckboxPrimitive.Root>) {
  return (
    <CheckboxPrimitive.Root
      data-slot="checkbox"
      className={cn(
        "group peer text-ring duration-fast ease-power3-out hover:text-fg-secondary data-[state=checked]:text-selected data-[state=indeterminate]:text-selected focus-visible:ring-ring relative inline-flex size-4 shrink-0 cursor-pointer items-center justify-center rounded-sm transition-[color] outline-none select-none after:absolute after:-inset-2 after:content-[''] focus-visible:ring-2 disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...props}
    >
      <SquareIcon
        aria-hidden
        className="size-4 group-data-[state=checked]:hidden group-data-[state=indeterminate]:hidden"
      />
      <CheckSquareIcon
        aria-hidden
        className="group-data-[state=checked]:animate-in group-data-[state=checked]:zoom-in-75 duration-fast hidden size-4 group-data-[state=checked]:block"
      />
      <MinusSquareIcon
        aria-hidden
        className="group-data-[state=indeterminate]:animate-in group-data-[state=indeterminate]:zoom-in-75 duration-fast hidden size-4 group-data-[state=indeterminate]:block"
      />
    </CheckboxPrimitive.Root>
  );
}

export { Checkbox };
