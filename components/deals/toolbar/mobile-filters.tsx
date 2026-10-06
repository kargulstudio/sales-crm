"use client";

import { useMemo, useState } from "react";
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
  CLOSE_WINDOW_OPTIONS,
  DEAL_OWNER_OPTIONS,
  DEAL_SORT_MENU_OPTIONS,
  MOTION_OPTIONS,
  REGION_OPTIONS,
} from "./filter-options";
import { ownerByName } from "@/data/companies";
import type { CloseWindow, DealSortKey, Region } from "@/data/deals";
import {
  ALL_DEAL_OWNERS,
  ANY_REGION,
  DEFAULT_DEAL_FILTERS,
  dealActiveFilterCount,
  filterDeals,
  type DealScope,
} from "@/lib/deals";
import { cn } from "@/lib/utils";
import { useDealFilters, useDealsStore } from "@/stores/deals-store";
import FilterIcon from "@/public/assets/images/_common/filter.svg";
import XIcon from "@/public/assets/images/companies/detail/x.svg";

type MobileFiltersProps = {
  className?: string;
  region?: Region;
};

export default function MobileFilters({
  className,
  region,
}: MobileFiltersProps) {
  const [open, setOpen] = useState(false);
  const deals = useDealsStore((state) => state.deals);
  const scope: DealScope = region ?? "all";
  const {
    sortBy,
    owner,
    motion,
    closeWindow,
    region: regionFilter,
  } = useDealFilters(scope);
  const setFilters = useDealsStore((state) => state.setFilters);
  const resetFilters = useDealsStore((state) => state.resetFilters);

  const activeRegion = region ?? regionFilter;
  const activeCount = dealActiveFilterCount({
    sortBy,
    owner,
    motion,
    closeWindow,
    region: region ? ANY_REGION : regionFilter,
  });
  const resultCount = useMemo(
    () =>
      filterDeals(deals, {
        sortBy,
        owner,
        motion,
        closeWindow,
        region: activeRegion,
      }).length,
    [deals, sortBy, owner, motion, closeWindow, activeRegion],
  );

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
            Sort and filter the deals board
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
            <Field label="Sort by" htmlFor="mobile-deal-sort">
              <Select
                value={sortBy}
                onValueChange={(value) =>
                  setFilters(scope, { sortBy: value as DealSortKey })
                }
              >
                <SelectTrigger id="mobile-deal-sort">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DEAL_SORT_MENU_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>

            <Field label="Deal owner" htmlFor="mobile-deal-owner">
              <Select
                value={owner}
                onValueChange={(value) => setFilters(scope, { owner: value })}
              >
                <SelectTrigger id="mobile-deal-owner">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DEAL_OWNER_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.value === ALL_DEAL_OWNERS ? (
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

            <Field label="Motion" htmlFor="mobile-deal-motion">
              <Select
                value={motion}
                onValueChange={(value) => setFilters(scope, { motion: value })}
              >
                <SelectTrigger id="mobile-deal-motion">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {MOTION_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>

            {!region && (
              <Field label="Region" htmlFor="mobile-deal-region">
                <Select
                  value={regionFilter}
                  onValueChange={(value) =>
                    setFilters(scope, { region: value })
                  }
                >
                  <SelectTrigger id="mobile-deal-region">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {REGION_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
            )}

            <Field label="Close date" htmlFor="mobile-deal-close">
              <Select
                value={closeWindow}
                onValueChange={(value) =>
                  setFilters(scope, { closeWindow: value as CloseWindow })
                }
              >
                <SelectTrigger id="mobile-deal-close">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CLOSE_WINDOW_OPTIONS.map((option) => (
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
            onClick={() => resetFilters(scope)}
            disabled={
              activeCount === 0 && sortBy === DEFAULT_DEAL_FILTERS.sortBy
            }
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
