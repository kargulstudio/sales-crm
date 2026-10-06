"use client";

import { useState } from "react";
import Avatar from "@/components/_ui/avatar";
import Button from "@/components/_ui/button";
import CountBadge from "@/components/_ui/count-badge";
import Field from "@/components/_ui/field";
import { ScrollArea } from "@/components/_ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/_ui/select";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/_ui/sheet";
import { Q1_TEAM_OPTIONS, q1OwnerOptions } from "./filter-options";
import { ownerByName } from "@/data/companies";
import { ALL_Q1, q1ActiveFilterCount } from "@/lib/q1-forecast";
import { cn } from "@/lib/utils";
import { useDealsStore } from "@/stores/deals-store";
import { useQ1ForecastStore, useQ1Report } from "@/stores/q1-forecast-store";
import FilterIcon from "@/public/assets/images/_common/filter.svg";
import XIcon from "@/public/assets/images/companies/detail/x.svg";

type MobileFiltersProps = {
  className?: string;
};

export default function MobileFilters({ className }: MobileFiltersProps) {
  const [open, setOpen] = useState(false);
  const owner = useQ1ForecastStore((state) => state.owner);
  const team = useQ1ForecastStore((state) => state.team);
  const setOwner = useQ1ForecastStore((state) => state.setOwner);
  const setTeam = useQ1ForecastStore((state) => state.setTeam);
  const resetFilters = useQ1ForecastStore((state) => state.resetFilters);
  const { deals } = useQ1Report();
  const allDeals = useDealsStore((state) => state.deals);

  const activeCount = q1ActiveFilterCount({ owner, team });
  const resultCount = deals.length;

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <Button
        variant="secondary"
        size="sm"
        onClick={() => setOpen(true)}
        aria-label={
          activeCount > 0 ? `Filters, ${activeCount} active` : "Filters"
        }
        className={cn("data-[active=true]:bg-muted", className)}
        data-active={activeCount > 0}
      >
        <FilterIcon aria-hidden className="size-3" />
        Filters
        {activeCount > 0 && <CountBadge>{activeCount}</CountBadge>}
      </Button>

      <SheetContent side="bottom">
        <SheetHeader className="px-4">
          <SheetTitle>Filters</SheetTitle>
          <SheetDescription className="sr-only">
            Choose the owner and team for the Q1 forecast
          </SheetDescription>
          <SheetClose asChild>
            <Button
              variant="ghost"
              size="icon-sm"
              className="-mr-1"
              aria-label="Close filters"
            >
              <XIcon aria-hidden className="text-foreground size-4" />
            </Button>
          </SheetClose>
        </SheetHeader>

        <ScrollArea fade viewportClassName="max-h-[calc(85dvh-118px)]">
          <div className="flex flex-col gap-4 p-4">
            <Field label="Owner" htmlFor="mobile-q1-owner">
              <Select value={owner} onValueChange={setOwner}>
                <SelectTrigger id="mobile-q1-owner">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {q1OwnerOptions(allDeals, team).map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.value === ALL_Q1 ? (
                        option.label
                      ) : (
                        <span className="flex items-center gap-2">
                          <Avatar
                            src={ownerByName(option.value).avatar}
                            alt=""
                          />
                          {option.label}
                        </span>
                      )}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>

            <Field label="Team" htmlFor="mobile-q1-team">
              <Select value={team} onValueChange={setTeam}>
                <SelectTrigger id="mobile-q1-team">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Q1_TEAM_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
          </div>
        </ScrollArea>

        <SheetFooter className="px-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={resetFilters}
            disabled={activeCount === 0}
            className="-ml-1.5"
          >
            Reset
          </Button>
          <SheetClose asChild>
            <Button variant="primary" size="sm">
              Show {resultCount} {resultCount === 1 ? "deal" : "deals"}
            </Button>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
