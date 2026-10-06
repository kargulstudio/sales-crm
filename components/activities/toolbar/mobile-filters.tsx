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
  ACTIVITY_OWNER_OPTIONS,
  TYPE_OPTIONS,
  WINDOW_OPTIONS,
  useCompanyOptions,
} from "./filter-options";
import { ownerByName } from "@/data/companies";
import {
  ALL_ACTIVITY_OWNERS,
  activityActiveFilterCount,
} from "@/lib/activities";
import { cn } from "@/lib/utils";
import {
  useActivitiesStore,
  useVisibleActivities,
} from "@/stores/activities-store";
import FilterIcon from "@/public/assets/images/_common/filter.svg";
import XIcon from "@/public/assets/images/companies/detail/x.svg";

type MobileFiltersProps = {
  className?: string;
};

export default function MobileFilters({ className }: MobileFiltersProps) {
  const [open, setOpen] = useState(false);
  const type = useActivitiesStore((state) => state.type);
  const owner = useActivitiesStore((state) => state.owner);
  const company = useActivitiesStore((state) => state.company);
  const window = useActivitiesStore((state) => state.window);
  const setType = useActivitiesStore((state) => state.setType);
  const setOwner = useActivitiesStore((state) => state.setOwner);
  const setCompany = useActivitiesStore((state) => state.setCompany);
  const setWindow = useActivitiesStore((state) => state.setWindow);
  const resetFilters = useActivitiesStore((state) => state.resetFilters);
  const companyOptions = useCompanyOptions();
  const resultCount = useVisibleActivities().length;

  const activeCount = activityActiveFilterCount({
    type,
    owner,
    company,
    window,
  });

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
            Choose the type, owner, company and window for the activity timeline
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
            <Field label="Type" htmlFor="mobile-activity-type">
              <Select value={type} onValueChange={setType}>
                <SelectTrigger id="mobile-activity-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TYPE_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>

            <Field label="Owner" htmlFor="mobile-activity-owner">
              <Select value={owner} onValueChange={setOwner}>
                <SelectTrigger id="mobile-activity-owner">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ACTIVITY_OWNER_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.value === ALL_ACTIVITY_OWNERS ? (
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

            <Field label="Company" htmlFor="mobile-activity-company">
              <Select value={company} onValueChange={setCompany}>
                <SelectTrigger id="mobile-activity-company">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {companyOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>

            <Field label="Window" htmlFor="mobile-activity-window">
              <Select value={window} onValueChange={setWindow}>
                <SelectTrigger id="mobile-activity-window">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {WINDOW_OPTIONS.map((option) => (
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
              Show {resultCount} {resultCount === 1 ? "activity" : "activities"}
            </Button>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
