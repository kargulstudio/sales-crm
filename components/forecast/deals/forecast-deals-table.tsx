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
import ForecastDealRow from "./forecast-deal-row";
import DealsFooter from "./deals-footer";
import {
  DEAL_CELL_CLASS,
  DEAL_COLUMNS,
  DEAL_GRID_CLASS,
  DEAL_ROW_CLASS,
  dealColumnClass,
} from "./deal-columns";
import { filterForecastDeals } from "@/lib/forecast";
import { cn } from "@/lib/utils";
import { useCompaniesStore } from "@/stores/companies-store";
import { useDealsStore } from "@/stores/deals-store";
import { useForecastStore } from "@/stores/forecast-store";

export default function ForecastDealsTable() {
  const deals = useDealsStore((state) => state.deals);
  const detailId = useDealsStore((state) => state.detailId);
  const detailOpen = useDealsStore((state) => state.detailOpen);
  const openDetail = useDealsStore((state) => state.openDetail);
  const setCategory = useDealsStore((state) => state.setCategory);
  const companies = useCompaniesStore((state) => state.companies);
  const period = useForecastStore((state) => state.period);
  const owner = useForecastStore((state) => state.owner);
  const category = useForecastStore((state) => state.category);

  const visible = useMemo(
    () => filterForecastDeals(deals, { period, owner, category }),
    [deals, period, owner, category],
  );

  return (
    <section className="border-border flex shrink-0 flex-col border-t">
      <div className="flex h-[38px] items-center px-3">
        <span className="eyebrow-style text-subtle">Deals in period</span>
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
            {visible.map((deal) => (
              <ForecastDealRow
                key={deal.id}
                deal={deal}
                companyName={
                  companies.find((company) => company.id === deal.companyId)
                    ?.name ?? deal.companyId
                }
                active={detailOpen && detailId === deal.id}
                onOpen={() => openDetail(deal.id)}
                onSetCategory={(next) => setCategory(deal.id, next)}
              />
            ))}
            {visible.length === 0 && (
              <TableRow role="row" className={DEAL_ROW_CLASS}>
                <td
                  role="cell"
                  className="caption-style text-muted-foreground col-span-full flex h-[120px] items-center justify-center"
                >
                  No deals match the current filters.
                </td>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </ScrollArea>
      <DealsFooter deals={visible} />
    </section>
  );
}
