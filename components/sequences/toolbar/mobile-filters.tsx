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
  SEQUENCE_OWNER_OPTIONS,
  SEQUENCE_SORT_MENU_OPTIONS,
  SEQUENCE_STATUS_OPTIONS,
} from "./filter-options";
import { ownerByName } from "@/data/companies";
import {
  ALL_SEQUENCE_OWNERS,
  DEFAULT_SEQUENCE_FILTERS,
  sequenceActiveFilterCount,
  type SequenceSortKey,
} from "@/lib/sequences";
import { cn } from "@/lib/utils";
import {
  useSequencesStore,
  useVisibleSequences,
} from "@/stores/sequences-store";
import FilterIcon from "@/public/assets/images/_common/filter.svg";
import XIcon from "@/public/assets/images/companies/detail/x.svg";

type MobileFiltersProps = {
  className?: string;
};

export default function MobileFilters({ className }: MobileFiltersProps) {
  const [open, setOpen] = useState(false);
  const sortBy = useSequencesStore((state) => state.sortBy);
  const status = useSequencesStore((state) => state.status);
  const owner = useSequencesStore((state) => state.owner);
  const setSortBy = useSequencesStore((state) => state.setSortBy);
  const setStatusFilter = useSequencesStore((state) => state.setStatusFilter);
  const setOwner = useSequencesStore((state) => state.setOwner);
  const resetFilters = useSequencesStore((state) => state.resetFilters);
  const resultCount = useVisibleSequences().length;

  const activeCount = sequenceActiveFilterCount({ sortBy, status, owner });

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
            Sort and filter the email sequences table
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
            <Field label="Sort by" htmlFor="mobile-sequence-sort">
              <Select
                value={sortBy}
                onValueChange={(value) => setSortBy(value as SequenceSortKey)}
              >
                <SelectTrigger id="mobile-sequence-sort">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SEQUENCE_SORT_MENU_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>

            <Field label="Status" htmlFor="mobile-sequence-status">
              <Select value={status} onValueChange={setStatusFilter}>
                <SelectTrigger id="mobile-sequence-status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SEQUENCE_STATUS_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>

            <Field label="Owner" htmlFor="mobile-sequence-owner">
              <Select value={owner} onValueChange={setOwner}>
                <SelectTrigger id="mobile-sequence-owner">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SEQUENCE_OWNER_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.value === ALL_SEQUENCE_OWNERS ? (
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
          </div>
        </ScrollArea>

        <SheetFooter className="px-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={resetFilters}
            disabled={
              activeCount === 0 && sortBy === DEFAULT_SEQUENCE_FILTERS.sortBy
            }
            className="-ml-1.5"
          >
            Reset
          </Button>
          <SheetClose asChild>
            <Button variant="primary" size="sm">
              Show {resultCount} {resultCount === 1 ? "sequence" : "sequences"}
            </Button>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
