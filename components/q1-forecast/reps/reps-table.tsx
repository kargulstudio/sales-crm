"use client";

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
import { cn } from "@/lib/utils";
import { useCompaniesStore } from "@/stores/companies-store";
import { useQ1Report } from "@/stores/q1-forecast-store";

export default function RepsTable() {
  const { reps, repTotal } = useQ1Report();
  const openProfile = useCompaniesStore((state) => state.openProfile);

  return (
    <section className="border-border flex shrink-0 flex-col border-t">
      <div className="flex h-[38px] items-center px-3">
        <span className="eyebrow-style text-subtle">By rep</span>
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
            {reps.map((rep) => (
              <RepRow
                key={rep.owner}
                rep={rep}
                onOpenOwner={() => openProfile(rep.owner)}
              />
            ))}
            {reps.length === 0 ? (
              <TableRow role="row" className={REP_ROW_CLASS}>
                <td
                  role="cell"
                  className="caption-style text-muted-foreground col-span-full flex h-[120px] items-center justify-center"
                >
                  No quotas are set for this selection.
                </td>
              </TableRow>
            ) : (
              <RepRow rep={repTotal} total />
            )}
          </TableBody>
        </Table>
      </ScrollArea>
    </section>
  );
}
