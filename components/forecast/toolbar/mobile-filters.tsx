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
  CATEGORY_OPTIONS,
  FORECAST_OWNER_OPTIONS,
  PERIOD_OPTIONS,
} from "./filter-options";
import { ownerByName } from "@/data/companies";
import {
  ALL_FORECAST_OWNERS,
  filterForecastDeals,
  forecastActiveFilterCount,
} from "@/lib/forecast";
import { cn } from "@/lib/utils";
import { useDealsStore } from "@/stores/deals-store";
import { useForecastStore } from "@/stores/forecast-store";
import FilterIcon from "@/public/assets/images/_common/filter.svg";
import XIcon from "@/public/assets/images/companies/detail/x.svg";

type MobileFiltersProps = {
  className?: string;
};

export default function MobileFilters({ className }: MobileFiltersProps) {
  const [open, setOpen] = useState(false);
  const deals = useDealsStore((state) => state.deals);
  const period = useForecastStore((state) => state.period);
  const owner = useForecastStore((state) => state.owner);
  const category = useForecastStore((state) => state.category);
  const setPeriod = useForecastStore((state) => state.setPeriod);
  const setOwner = useForecastStore((state) => state.setOwner);
  const setCategory = useForecastStore((state) => state.setCategory);
  const resetFilters = useForecastStore((state) => state.resetFilters);

  const activeCount = forecastActiveFilterCount({ period, owner, category });
  const resultCount = useMemo(
    () => filterForecastDeals(deals, { period, owner, category }).length,
    [deals, period, owner, category],
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
            Choose the period, owner and category for the forecast
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
            <Field label="Period" htmlFor="mobile-forecast-period">
              <Select value={period} onValueChange={setPeriod}>
                <SelectTrigger id="mobile-forecast-period">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PERIOD_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>

            <Field label="Owner" htmlFor="mobile-forecast-owner">
              <Select value={owner} onValueChange={setOwner}>
                <SelectTrigger id="mobile-forecast-owner">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {FORECAST_OWNER_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.value === ALL_FORECAST_OWNERS ? (
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

            <Field label="Category" htmlFor="mobile-forecast-category">
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger id="mobile-forecast-category">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORY_OPTIONS.map((option) => (
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
