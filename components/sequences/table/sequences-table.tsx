"use client";

import { ScrollArea } from "@/components/_ui/scroll-area";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/_ui/table";
import SequenceRow from "./sequence-row";
import SequencesFooter from "./table-footer";
import {
  TABLE_CELL_CLASS,
  TABLE_COLUMNS,
  TABLE_GRID_CLASS,
  TABLE_ROW_CLASS,
} from "./table-columns";
import { statsFor } from "@/lib/sequences";
import { cn } from "@/lib/utils";
import { useCompaniesStore } from "@/stores/companies-store";
import {
  useSequenceStats,
  useSequencesStore,
  useVisibleSequences,
} from "@/stores/sequences-store";

export default function SequencesTable() {
  const visible = useVisibleSequences();
  const stats = useSequenceStats();
  const detailId = useSequencesStore((state) => state.detailId);
  const detailOpen = useSequencesStore((state) => state.detailOpen);
  const openDetail = useSequencesStore((state) => state.openDetail);
  const openProfile = useCompaniesStore((state) => state.openProfile);

  return (
    <div className="border-border flex min-h-0 flex-1 flex-col border-t">
      <ScrollArea orientation="both" className="min-h-0 flex-1">
        <Table role="table" className={cn(TABLE_GRID_CLASS, "w-full")}>
          <TableHeader role="rowgroup" className="contents">
            <TableRow
              role="row"
              className={cn(TABLE_ROW_CLASS, "bg-background sticky top-0 z-10")}
            >
              {TABLE_COLUMNS.map((column) => (
                <TableHead
                  key={column.key}
                  role="columnheader"
                  className={cn(TABLE_CELL_CLASS, column.className)}
                >
                  {column.label}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody role="rowgroup" className="contents">
            {visible.map((sequence) => (
              <SequenceRow
                key={sequence.id}
                sequence={sequence}
                stats={statsFor(stats, sequence.id)}
                active={detailOpen && detailId === sequence.id}
                onOpen={() => openDetail(sequence.id)}
                onOpenOwner={() => openProfile(sequence.owner)}
              />
            ))}
            {visible.length === 0 && (
              <TableRow role="row" className={TABLE_ROW_CLASS}>
                <td
                  role="cell"
                  className="caption-style text-muted-foreground col-span-full flex h-[120px] items-center justify-center"
                >
                  No sequences match the current filters.
                </td>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </ScrollArea>
      <SequencesFooter sequences={visible} stats={stats} />
    </div>
  );
}
