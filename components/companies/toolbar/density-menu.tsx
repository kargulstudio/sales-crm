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
import Tooltip from "@/components/_ui/tooltip";
import { cn } from "@/lib/utils";
import { useCompaniesStore, type Density } from "@/stores/companies-store";
import ListIcon from "@/public/assets/images/companies/sidebar/list.svg";

export default function DensityMenu({ className }: { className?: string }) {
  const density = useCompaniesStore((state) => state.density);
  const setDensity = useCompaniesStore((state) => state.setDensity);

  return (
    <DropdownMenu>
      <Tooltip content="Row density">
        <DropdownMenuTrigger asChild>
          <Button
            variant="secondary"
            size="icon"
            aria-label="Row density"
            className={cn("data-[state=open]:bg-muted", className)}
          >
            <ListIcon aria-hidden className="size-3.5" />
          </Button>
        </DropdownMenuTrigger>
      </Tooltip>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Row density</DropdownMenuLabel>
        <DropdownMenuRadioGroup
          value={density}
          onValueChange={(value) => setDensity(value as Density)}
        >
          <DropdownMenuRadioItem value="comfortable">
            Comfortable
          </DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="compact">Compact</DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
