"use client";

import Button from "@/components/_ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/_ui/dropdown-menu";
import { cn } from "@/lib/utils";
import ChevronDownIcon from "@/assets/icons/_common/chevron-down.svg?react";

export type FilterOption = { value: string; label: string };

type FilterMenuProps = {
  label?: string;
  value: string;
  options: FilterOption[];
  onChange: (value: string) => void;
  align?: "start" | "end";
  className?: string;
};

export default function FilterMenu({
  label,
  value,
  options,
  onChange,
  align = "start",
  className,
}: FilterMenuProps) {
  const current = options.find((option) => option.value === value);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="secondary"
          size="none"
          className={cn(
            "group data-[state=open]:bg-muted h-[30px] gap-0 overflow-hidden text-[12px]",
            className,
          )}
        >
          {label && (
            <>
              <span className="text-subtle px-[9px] font-normal">{label}</span>
              <span aria-hidden className="h-full w-px bg-white/8" />
            </>
          )}
          <span
            className={cn(
              "flex items-center px-[9px]",
              label ? "gap-1.5" : "gap-1",
            )}
          >
            {current?.label ?? value}
            <ChevronDownIcon
              aria-hidden
              className="ease-power3-out size-3 text-[#898b8d] transition-transform duration-200 group-data-[state=open]:rotate-180"
            />
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align={align}>
        {label && <DropdownMenuLabel>{label}</DropdownMenuLabel>}
        <DropdownMenuRadioGroup value={value} onValueChange={onChange}>
          {options.map((option) => (
            <DropdownMenuRadioItem key={option.value} value={option.value}>
              {option.label}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
