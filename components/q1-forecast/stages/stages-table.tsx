"use client";

import { ScrollArea } from "@/components/_ui/scroll-area";
import Tag from "@/components/_ui/tag";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/_ui/table";
import Money from "@/components/_common/money";
import { STAGE_TONES } from "@/lib/forecast";
import { cn } from "@/lib/utils";
import { useQ1Report } from "@/stores/q1-forecast-store";
import {
  STAGE_CELL_CLASS,
  STAGE_COLUMNS,
  STAGE_GRID_CLASS,
  STAGE_ROW_CLASS,
} from "./stage-columns";

export default function StagesTable() {
  const { stages } = useQ1Report();

  return (
    <section className="border-border flex shrink-0 flex-col border-t">
      <div className="flex h-[38px] items-center px-3">
        <span className="eyebrow-style text-subtle">By stage</span>
      </div>
      <ScrollArea orientation="horizontal" className="border-border border-t">
        <Table role="table" className={cn(STAGE_GRID_CLASS, "w-full")}>
          <TableHeader role="rowgroup" className="contents">
            <TableRow role="row" className={STAGE_ROW_CLASS}>
              {STAGE_COLUMNS.map((column) => (
                <TableHead
                  key={column.key}
                  role="columnheader"
                  className={cn(STAGE_CELL_CLASS, column.className)}
                >
                  {column.label}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody role="rowgroup" className="contents">
            {stages.map((row) => (
              <TableRow key={row.stage} role="row" className={STAGE_ROW_CLASS}>
                <TableCell
                  role="cell"
                  className={cn(STAGE_CELL_CLASS, STAGE_COLUMNS[0].className)}
                >
                  <Tag tone={STAGE_TONES[row.stage]} size="sm">
                    {row.stage}
                  </Tag>
                </TableCell>
                <TableCell
                  role="cell"
                  className={cn(STAGE_CELL_CLASS, STAGE_COLUMNS[1].className)}
                >
                  {row.count}
                </TableCell>
                <TableCell
                  role="cell"
                  className={cn(STAGE_CELL_CLASS, STAGE_COLUMNS[2].className)}
                >
                  <Money value={row.value} />
                </TableCell>
                <TableCell
                  role="cell"
                  className={cn(STAGE_CELL_CLASS, STAGE_COLUMNS[3].className)}
                >
                  {row.avgWin === null ? (
                    <span className="text-muted-foreground">—</span>
                  ) : (
                    `${row.avgWin}%`
                  )}
                </TableCell>
                <TableCell
                  role="cell"
                  className={cn(STAGE_CELL_CLASS, STAGE_COLUMNS[4].className)}
                >
                  {row.weighted === null ? (
                    <span className="text-muted-foreground">—</span>
                  ) : (
                    <Money value={row.weighted} />
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </ScrollArea>
    </section>
  );
}
