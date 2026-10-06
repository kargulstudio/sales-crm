"use client";

import { useState } from "react";
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
import { QUARTER_OPTIONS, sortOptions } from "./filter-options";
import { CURRENT_QUARTER_ID } from "@/data/forecast";
import type { Team, TeamSortKey } from "@/data/team";
import { defaultTeamSort, resolveTeamSort, teamRoster } from "@/lib/team";
import { cn } from "@/lib/utils";
import { useTeamStore } from "@/stores/team-store";
import FilterIcon from "@/public/assets/images/_common/filter.svg";
import XIcon from "@/public/assets/images/companies/detail/x.svg";

type MobileFiltersProps = {
  team: Team;
  className?: string;
};

export default function MobileFilters({ team, className }: MobileFiltersProps) {
  const [open, setOpen] = useState(false);
  const period = useTeamStore((state) => state.period);
  const storedSort = useTeamStore((state) => state.sortBy);
  const setPeriod = useTeamStore((state) => state.setPeriod);
  const setSortBy = useTeamStore((state) => state.setSortBy);
  const resetFilters = useTeamStore((state) => state.resetFilters);

  const sortBy = resolveTeamSort(team, storedSort);
  const activeCount = [
    period !== CURRENT_QUARTER_ID,
    sortBy !== defaultTeamSort(team),
  ].filter(Boolean).length;
  const resultCount = teamRoster(team).length;

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
            Choose the quarter and sort order for the team
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
            <Field label="Quarter" htmlFor="mobile-team-quarter">
              <Select value={period} onValueChange={setPeriod}>
                <SelectTrigger id="mobile-team-quarter">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {QUARTER_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>

            <Field label="Sort by" htmlFor="mobile-team-sort">
              <Select
                value={sortBy}
                onValueChange={(value) => setSortBy(value as TeamSortKey)}
              >
                <SelectTrigger id="mobile-team-sort">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {sortOptions(team).map((option) => (
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
              Show {resultCount} {resultCount === 1 ? "rep" : "reps"}
            </Button>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
