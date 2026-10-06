"use client";

import { useMemo } from "react";
import { ScrollArea } from "@/components/_ui/scroll-area";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/_ui/table";
import RepRow from "./rep-row";
import {
  REP_CELL_CLASS,
  REP_COLUMNS,
  REP_GRID_CLASS,
  REP_ROW_CLASS,
  repColumnClass,
} from "./rep-columns";
import { repRollups, teamTotals } from "@/lib/forecast";
import { cn } from "@/lib/utils";
import { useCompaniesStore } from "@/stores/companies-store";
import { useDealsStore } from "@/stores/deals-store";
import { useForecastStore } from "@/stores/forecast-store";

export default function RepsTable() {
  const deals = useDealsStore((state) => state.deals);
  const period = useForecastStore((state) => state.period);
  const owner = useForecastStore((state) => state.owner);
  const openProfile = useCompaniesStore((state) => state.openProfile);

  const rollups = useMemo(
    () => repRollups(deals, period, owner),
    [deals, period, owner],
  );
  const totals = useMemo(() => teamTotals(rollups), [rollups]);

  return (
    <section className="border-border flex shrink-0 flex-col border-t">
      <div className="flex h-[38px] items-center px-3">
        <span className="eyebrow-style text-subtle">Rep rollup</span>
      </div>
      <ScrollArea orientation="horizontal" className="border-border border-t">
        <Table role="table" className={cn(REP_GRID_CLASS, "w-full")}>
          <TableHeader role="rowgroup" className="contents">
            <TableRow role="row" className={REP_ROW_CLASS}>
              {REP_COLUMNS.map((column) => (
                <TableHead
                  key={column.key}
                  role="columnheader"
                  className={cn(REP_CELL_CLASS, repColumnClass(column.key))}
                >
                  {column.label}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody role="rowgroup" className="contents">
            {rollups.map((rollup) => (
              <RepRow
                key={rollup.owner}
                rollup={rollup}
                onOpenOwner={() => openProfile(rollup.owner)}
              />
            ))}
            {rollups.length === 0 ? (
              <TableRow role="row" className={REP_ROW_CLASS}>
                <td
                  role="cell"
                  className="caption-style text-muted-foreground col-span-full flex h-[120px] items-center justify-center"
                >
                  No quotas are set for this selection.
                </td>
              </TableRow>
            ) : (
              <RepRow rollup={totals} total />
            )}
          </TableBody>
        </Table>
      </ScrollArea>
    </section>
  );
}
