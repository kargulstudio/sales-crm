"use client";

import Button from "@/components/_ui/button";
import { ScrollArea } from "@/components/_ui/scroll-area";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/_ui/table";
import Summary from "../summary/summary";
import SlippingRow from "./slipping-row";
import TableFooter from "./table-footer";
import {
  SLIPPING_CELL_CLASS,
  SLIPPING_COLUMNS,
  SLIPPING_GRID_CLASS,
  SLIPPING_ROW_CLASS,
} from "./table-columns";
import { cn } from "@/lib/utils";
import { useCompaniesStore } from "@/stores/companies-store";
import { useDealsStore } from "@/stores/deals-store";
import { useSlippingReport, useSlippingStore } from "@/stores/slipping-store";

export default function SlippingTable() {
  const { all, rows, summary } = useSlippingReport();
  const resetFilters = useSlippingStore((state) => state.resetFilters);
  const detailId = useDealsStore((state) => state.detailId);
  const detailOpen = useDealsStore((state) => state.detailOpen);
  const companies = useCompaniesStore((state) => state.companies);

  return (
    <div className="border-border flex min-h-0 flex-1 flex-col border-t">
      <ScrollArea orientation="both" className="min-h-0 flex-1">
        <Summary />
        <Table role="table" className={cn(SLIPPING_GRID_CLASS, "w-full")}>
          <TableHeader role="rowgroup" className="contents">
            <TableRow
              role="row"
              className={cn(
                SLIPPING_ROW_CLASS,
                "bg-background sticky top-0 z-10",
              )}
            >
              {SLIPPING_COLUMNS.map((column) => (
                <TableHead
                  key={column.key}
                  role="columnheader"
                  className={cn(SLIPPING_CELL_CLASS, column.className)}
                >
                  {column.label}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody role="rowgroup" className="contents">
            {rows.map((row) => (
              <SlippingRow
                key={row.deal.id}
                row={row}
                companyName={
                  companies.find((company) => company.id === row.deal.companyId)
                    ?.name ?? row.deal.companyId
                }
                active={detailOpen && detailId === row.deal.id}
              />
            ))}
            {rows.length === 0 && (
              <TableRow role="row" className={SLIPPING_ROW_CLASS}>
                <td
                  role="cell"
                  className="caption-style text-muted-foreground col-span-full flex h-[120px] flex-col items-center justify-center gap-2"
                >
                  {all.length === 0
                    ? "No deals are slipping."
                    : "No slipping deals match the current filters."}
                  {all.length > 0 && (
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={resetFilters}
                    >
                      Reset filters
                    </Button>
                  )}
                </td>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </ScrollArea>
      <TableFooter count={rows.length} summary={summary} />
    </div>
  );
}
