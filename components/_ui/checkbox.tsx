"use client";

import type { ComponentProps } from "react";
import { Checkbox as CheckboxPrimitive } from "radix-ui";
import { cn } from "@/lib/utils";
import SquareIcon from "@/assets/icons/companies/table/square.svg?react";
import CheckSquareIcon from "@/assets/icons/companies/table/check-square.svg?react";
import MinusSquareIcon from "@/assets/icons/companies/table/minus-square.svg?react";

function Checkbox({
  className,
  ...props
}: ComponentProps<typeof CheckboxPrimitive.Root>) {
  return (
    <CheckboxPrimitive.Root
      data-slot="checkbox"
      className={cn(
        "group peer ease-power3-out hover:text-line-strong focus-visible:ring-ring/60 inline-flex size-4 shrink-0 cursor-pointer items-center justify-center rounded-[4px] text-[#323232] transition-[color] duration-150 outline-none select-none focus-visible:ring-2 disabled:cursor-not-allowed disabled:opacity-50",
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
        className="hidden size-4 group-data-[state=checked]:block"
      />
      <MinusSquareIcon
        aria-hidden
        className="hidden size-4 group-data-[state=indeterminate]:block"
      />
    </CheckboxPrimitive.Root>
  );
}

export { Checkbox };
