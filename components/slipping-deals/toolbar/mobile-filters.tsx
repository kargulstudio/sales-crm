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
import {
  SLIPPING_SORT_FILTER_OPTIONS,
  SLIPPING_TEAM_OPTIONS,
  slippingOwnerOptions,
} from "./filter-options";
import { ownerByName } from "@/data/companies";
import {
  ALL_SLIPPING,
  REASON_FILTER_OPTIONS,
  slippingActiveFilterCount,
  type SlippingSortKey,
} from "@/lib/slipping";
import { cn } from "@/lib/utils";
import { useSlippingReport, useSlippingStore } from "@/stores/slipping-store";
import FilterIcon from "@/public/assets/images/_common/filter.svg";
import XIcon from "@/public/assets/images/companies/detail/x.svg";

type MobileFiltersProps = {
  className?: string;
};

export default function MobileFilters({ className }: MobileFiltersProps) {
  const [open, setOpen] = useState(false);
  const reason = useSlippingStore((state) => state.reason);
  const owner = useSlippingStore((state) => state.owner);
  const team = useSlippingStore((state) => state.team);
  const sortBy = useSlippingStore((state) => state.sortBy);
  const setReason = useSlippingStore((state) => state.setReason);
  const setOwner = useSlippingStore((state) => state.setOwner);
  const setTeam = useSlippingStore((state) => state.setTeam);
  const setSortBy = useSlippingStore((state) => state.setSortBy);
  const resetFilters = useSlippingStore((state) => state.resetFilters);
  const { all, rows } = useSlippingReport();

  const activeCount = slippingActiveFilterCount({
    reason,
    owner,
    team,
    sortBy,
  });
  const resultCount = rows.length;

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
            Choose the reason, owner, team and sort order for slipping deals
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
            <Field label="Reason" htmlFor="mobile-slipping-reason">
              <Select value={reason} onValueChange={setReason}>
                <SelectTrigger id="mobile-slipping-reason">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {REASON_FILTER_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>

            <Field label="Owner" htmlFor="mobile-slipping-owner">
              <Select value={owner} onValueChange={setOwner}>
                <SelectTrigger id="mobile-slipping-owner">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {slippingOwnerOptions(all, team).map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.value === ALL_SLIPPING ? (
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

            <Field label="Team" htmlFor="mobile-slipping-team">
              <Select value={team} onValueChange={setTeam}>
                <SelectTrigger id="mobile-slipping-team">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SLIPPING_TEAM_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>

            <Field label="Sort by" htmlFor="mobile-slipping-sort">
              <Select
                value={sortBy}
                onValueChange={(value) => setSortBy(value as SlippingSortKey)}
              >
                <SelectTrigger id="mobile-slipping-sort">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SLIPPING_SORT_FILTER_OPTIONS.map((option) => (
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
