"use client";

import { useState } from "react";
import Button from "@/components/_ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/_ui/dropdown-menu";
import type { Deal } from "@/data/deals";
import { NO_CALCULATION } from "@/lib/companies";
import { DEAL_CALCULATIONS, calculateDeals, openDeals } from "@/lib/deals";
import PlusIcon from "@/public/assets/images/_common/plus.svg";

type BoardFooterProps = {
  deals: Deal[];
};

const DEFAULT_SLOTS = ["totalValue", "weightedValue", "avgWin"];

export default function BoardFooter({ deals }: BoardFooterProps) {
  const [slots, setSlots] = useState(DEFAULT_SLOTS);

  function setSlot(index: number, value: string) {
    setSlots((current) =>
      current.map((slot, slotIndex) => (slotIndex === index ? value : slot)),
    );
  }

  return (
    <div className="caption-style border-border bg-background grid shrink-0 grid-cols-2 gap-px border-t border-b p-px sm:grid-cols-4">
      <div className="outline-border flex items-center gap-2 p-3 outline-1">
        <span className="text-foreground tabular-nums">
          {openDeals(deals).length}
        </span>
        <span className="text-muted-foreground">Open deals in view</span>
      </div>
      {slots.map((slot, index) => {
        const calculation = DEAL_CALCULATIONS.find(
          (item) => item.value === slot,
        );
        return (
          <DropdownMenu key={index}>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="none"
                className="caption-style outline-border h-auto min-w-0 justify-start gap-2 rounded-none p-3 font-normal outline-1 hover:bg-white/4 data-[state=open]:bg-white/6"
              >
                {calculation ? (
                  <>
                    <span className="text-foreground tabular-nums">
                      {calculateDeals(slot, deals)}
                    </span>
                    <span className="text-muted-foreground truncate">
                      {calculation.label}
                    </span>
                  </>
                ) : (
                  <>
                    <PlusIcon
                      aria-hidden
                      className="text-muted-foreground size-3 shrink-0"
                    />
                    <span className="text-muted-foreground truncate">
                      Add Calculation
                    </span>
                  </>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" side="top">
              <DropdownMenuLabel>Calculate</DropdownMenuLabel>
              <DropdownMenuRadioGroup
                value={slot}
                onValueChange={(value) => setSlot(index, value)}
              >
                {DEAL_CALCULATIONS.map((item) => (
                  <DropdownMenuRadioItem key={item.value} value={item.value}>
                    {item.label}
                  </DropdownMenuRadioItem>
                ))}
                <DropdownMenuRadioItem value={NO_CALCULATION}>
                  None
                </DropdownMenuRadioItem>
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      })}
    </div>
  );
}
