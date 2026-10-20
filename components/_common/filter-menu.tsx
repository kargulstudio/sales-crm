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
import ChevronDownIcon from "@/public/assets/images/_common/chevron-down.svg";

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
          size="control"
          className={cn(
            "group data-[state=open]:bg-muted gap-0 overflow-hidden",
            className,
          )}
        >
          {label && (
            <>
              <span className="text-fg-tertiary px-2.25 font-normal">
                {label}
              </span>
              <span aria-hidden className="bg-overlay-3 h-full w-px" />
            </>
          )}
          <span
            className={cn(
              "flex items-center px-2.25",
              label ? "gap-1.5" : "gap-1",
            )}
          >
            {current?.label ?? value}
            <ChevronDownIcon
              aria-hidden
              className="text-fg-tertiary duration-base ease-power3-out size-3 transition-transform group-data-[state=open]:rotate-180"
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
