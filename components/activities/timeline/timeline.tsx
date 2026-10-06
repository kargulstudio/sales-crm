"use client";

import { useMemo } from "react";
import Button from "@/components/_ui/button";
import ActivityRow from "./activity-row";
import { groupByDay } from "@/lib/activities";
import { cn } from "@/lib/utils";
import {
  useActivitiesStore,
  useVisibleActivities,
} from "@/stores/activities-store";
import { useCompanyMap } from "@/stores/companies-store";
import { useDealsStore } from "@/stores/deals-store";
import ListIcon from "@/public/assets/images/companies/sidebar/list.svg";

type TimelineProps = {
  className?: string;
};

export default function Timeline({ className }: TimelineProps) {
  const events = useVisibleActivities();
  const companyById = useCompanyMap();
  const openDetail = useDealsStore((state) => state.openDetail);
  const resetFilters = useActivitiesStore((state) => state.resetFilters);
  const shown = useActivitiesStore((state) => state.shown);
  const showMore = useActivitiesStore((state) => state.showMore);
  const visible = useMemo(() => events.slice(0, shown), [events, shown]);
  const groups = useMemo(() => groupByDay(visible), [visible]);

  if (events.length === 0) {
    return (
      <div
        className={cn(
          "border-line-strong flex flex-col items-center gap-4 rounded-xl border px-6 py-16 text-center",
          className,
        )}
      >
        <span className="bg-muted flex size-10 items-center justify-center rounded-full">
          <ListIcon aria-hidden className="text-icon size-4" />
        </span>
        <div className="flex flex-col gap-1.5">
          <span className="text-foreground">No activity matches</span>
          <span className="caption-style text-subtle">
            Widen the window or clear a filter to see more.
          </span>
        </div>
        <Button variant="secondary" size="sm" onClick={resetFilters}>
          Clear filters
        </Button>
      </div>
    );
  }

  return (
    <div className={cn("flex flex-col gap-5", className)}>
      {groups.map((group) => (
        <section
          key={group.date}
          aria-label={group.label}
          className="flex flex-col gap-2"
        >
          <span className="eyebrow-style text-soft">{group.label}</span>
          <ul className="divide-line-strong border-line-strong divide-y overflow-hidden rounded-xl border">
            {group.events.map((event) => (
              <ActivityRow
                key={event.id}
                event={event}
                company={companyById.get(event.companyId)}
                onOpen={openDetail}
              />
            ))}
          </ul>
        </section>
      ))}
      {visible.length < events.length && (
        <div className="flex justify-center">
          <Button variant="secondary" size="sm" onClick={showMore}>
            Show more
          </Button>
        </div>
      )}
    </div>
  );
}
