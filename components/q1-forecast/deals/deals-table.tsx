"use client";

import { ScrollArea } from "@/components/_ui/scroll-area";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/_ui/table";
import DealRow from "./deal-row";
import {
  DEAL_CELL_CLASS,
  DEAL_COLUMNS,
  DEAL_GRID_CLASS,
  DEAL_ROW_CLASS,
  dealColumnClass,
} from "./deal-columns";
import { cn } from "@/lib/utils";
import { useCompaniesStore } from "@/stores/companies-store";
import { useDealsStore } from "@/stores/deals-store";
import { useQ1Report } from "@/stores/q1-forecast-store";

export default function DealsTable() {
  const { deals } = useQ1Report();
  const detailId = useDealsStore((state) => state.detailId);
  const detailOpen = useDealsStore((state) => state.detailOpen);
  const openDetail = useDealsStore((state) => state.openDetail);
  const companies = useCompaniesStore((state) => state.companies);

  return (
    <section className="border-border flex shrink-0 flex-col border-t">
      <div className="flex h-[38px] items-center px-3">
        <span className="eyebrow-style text-subtle">Deals closing in Q1</span>
      </div>
      <ScrollArea orientation="horizontal" className="border-border border-t">
        <Table role="table" className={cn(DEAL_GRID_CLASS, "w-full")}>
          <TableHeader role="rowgroup" className="contents">
            <TableRow role="row" className={DEAL_ROW_CLASS}>
              {DEAL_COLUMNS.map((column) => (
                <TableHead
                  key={column.key}
                  role="columnheader"
                  className={cn(DEAL_CELL_CLASS, dealColumnClass(column.key))}
                >
                  {column.label}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody role="rowgroup" className="contents">
            {deals.map((deal) => (
              <DealRow
                key={deal.id}
                deal={deal}
                companyName={
                  companies.find((company) => company.id === deal.companyId)
                    ?.name ?? deal.companyId
                }
                active={detailOpen && detailId === deal.id}
                onOpen={() => openDetail(deal.id)}
              />
            ))}
            {deals.length === 0 && (
              <TableRow role="row" className={DEAL_ROW_CLASS}>
                <td
                  role="cell"
                  className="caption-style text-muted-foreground col-span-full flex h-[120px] items-center justify-center"
                >
                  No deals close in Q1 for this selection.
                </td>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </ScrollArea>
      <div className="caption-style border-border bg-background border-t border-b p-3">
        <span className="text-foreground tabular-nums">{deals.length}</span>{" "}
        <span className="text-muted-foreground">
          {deals.length === 1 ? "Deal" : "Deals"} in view
        </span>
      </div>
    </section>
  );
}
