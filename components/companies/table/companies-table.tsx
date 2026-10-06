"use client";

import { useMemo } from "react";
import { Checkbox } from "@/components/_ui/checkbox";
import { ScrollArea } from "@/components/_ui/scroll-area";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/_ui/table";
import CompanyRow from "./company-row";
import TableFooter from "./table-footer";
import {
  TABLE_CELL_CLASS,
  TABLE_COLUMNS,
  TABLE_GRID_CLASS,
  TABLE_ROW_CLASS,
} from "./table-columns";
import { filterCompanies, summaryFor } from "@/lib/companies";
import { cn } from "@/lib/utils";
import { useCompaniesStore } from "@/stores/companies-store";
import { useCompanySummaries } from "@/stores/deals-store";

export default function CompaniesTable() {
  const companies = useCompaniesStore((state) => state.companies);
  const summaries = useCompanySummaries();
  const sortBy = useCompaniesStore((state) => state.sortBy);
  const owner = useCompaniesStore((state) => state.owner);
  const stage = useCompaniesStore((state) => state.stage);
  const activityWindow = useCompaniesStore((state) => state.activityWindow);
  const selectedIds = useCompaniesStore((state) => state.selectedIds);
  const detailId = useCompaniesStore((state) => state.detailId);
  const detailOpen = useCompaniesStore((state) => state.detailOpen);
  const toggleSelected = useCompaniesStore((state) => state.toggleSelected);
  const setSelected = useCompaniesStore((state) => state.setSelected);
  const openDetail = useCompaniesStore((state) => state.openDetail);
  const openProfile = useCompaniesStore((state) => state.openProfile);

  const visible = useMemo(
    () =>
      filterCompanies(
        companies,
        { sortBy, owner, stage, activityWindow },
        summaries,
      ),
    [companies, sortBy, owner, stage, activityWindow, summaries],
  );

  const selectedVisible = visible.filter((company) =>
    selectedIds.includes(company.id),
  );
  const allSelected =
    visible.length > 0 && selectedVisible.length === visible.length;
  const someSelected = selectedVisible.length > 0 && !allSelected;

  function toggleAll() {
    setSelected(allSelected ? [] : visible.map((company) => company.id));
  }

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
                  {column.key === "name" ? (
                    <span className="flex items-center gap-5">
                      <Checkbox
                        checked={
                          allSelected
                            ? true
                            : someSelected
                              ? "indeterminate"
                              : false
                        }
                        onCheckedChange={toggleAll}
                        aria-label="Select all companies"
                      />
                      {column.label}
                    </span>
                  ) : (
                    column.label
                  )}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody role="rowgroup" className="contents">
            {visible.map((company) => (
              <CompanyRow
                key={company.id}
                company={company}
                summary={summaryFor(summaries, company.id)}
                selected={selectedIds.includes(company.id)}
                active={detailOpen && detailId === company.id}
                onToggle={() => toggleSelected(company.id)}
                onOpen={() => openDetail(company.id)}
                onOpenOwner={() => openProfile(company.owner)}
              />
            ))}
            {visible.length === 0 && (
              <TableRow role="row" className={TABLE_ROW_CLASS}>
                <td
                  role="cell"
                  className="caption-style text-muted-foreground col-span-full flex h-[120px] items-center justify-center"
                >
                  No companies match the current filters.
                </td>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </ScrollArea>
      <TableFooter companies={visible} summaries={summaries} />
    </div>
  );
}
