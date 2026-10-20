"use client";

import { useEffect, useMemo, useRef, useState, type UIEvent } from "react";
import Button from "@/components/_ui/button";
import EmptyState from "@/components/_ui/empty-state";
import Skeleton from "@/components/_ui/skeleton";
import { Checkbox } from "@/components/_ui/checkbox";
import { ScrollArea } from "@/components/_ui/scroll-area";
import {
  Table,
  TableBody,
  TableHead,
  TableCell,
  TableHeader,
  TableRow,
} from "@/components/_ui/table";
import CompanyRow from "./company-row";
import CompanyCard from "./company-card";
import TableFooter from "./table-footer";
import BulkActions from "./bulk-actions";
import {
  STICKY_CELL_CLASS,
  TABLE_CELL_CLASS,
  TABLE_COLUMNS,
  TABLE_GRID_CLASS,
  TABLE_HEAD_ROW_CLASS,
  TABLE_ROW_CLASS,
  type TableColumnKey,
} from "./table-columns";
import { filterCompanies, pickFilters } from "@/lib/companies";
import { cn } from "@/lib/utils";
import { useShallow } from "zustand/react/shallow";
import { useCompaniesStore } from "@/stores/companies-store";
import { useStoreHydrated } from "@/hooks/use-store-hydrated";
import { useTableKeyboard } from "@/hooks/use-table-keyboard";
import FilterIcon from "@/public/assets/images/_common/filter.svg";
import ChevronDownIcon from "@/public/assets/images/_common/chevron-down.svg";
import type { SortKey } from "@/data/companies";
import type { SortDir } from "@/lib/companies";

const SKELETON_WIDTHS: Record<TableColumnKey, string> = {
  name: "w-24",
  segment: "w-32",
  owner: "w-28",
  openDeals: "w-4",
  pipelineValue: "w-16",
  winProbability: "w-28",
  trend: "w-14",
  lastInteraction: "w-28",
  action: "w-4",
};

type SortButtonProps = {
  column: (typeof TABLE_COLUMNS)[number];
  sortBy: SortKey;
  sortDir: SortDir;
  onSort: (key: SortKey) => void;
};

function SortButton({ column, sortBy, sortDir, onSort }: SortButtonProps) {
  if (!("sort" in column)) return column.label;
  const active = sortBy === column.sort;
  return (
    <button
      type="button"
      onClick={() => onSort(column.sort)}
      data-active={active}
      data-align={column.className.includes("justify-end") ? "end" : "start"}
      className="group/sort hover:text-foreground data-[active=true]:text-foreground focus-visible:ring-ring relative -mx-1 inline-flex cursor-pointer items-center rounded-sm px-1 py-0.5 outline-none focus-visible:ring-2"
    >
      <span className="relative">
        {column.label}
        <ChevronDownIcon
          aria-hidden
          data-dir={active ? sortDir : undefined}
          className="ease-power3-out duration-fast absolute top-1/2 size-2.5 -translate-y-1/2 opacity-0 transition-[opacity,rotate] group-hover/sort:opacity-60 group-data-[active=true]/sort:opacity-100 group-data-[align=end]/sort:right-full group-data-[align=end]/sort:mr-1 group-data-[align=start]/sort:left-full group-data-[align=start]/sort:ml-1 data-[dir=asc]:rotate-180"
        />
      </span>
    </button>
  );
}

function SkeletonRows() {
  return Array.from({ length: 8 }, (_, row) => (
    <TableRow key={row} role="row" className={TABLE_ROW_CLASS}>
      {TABLE_COLUMNS.map((column) => (
        <TableCell
          key={column.key}
          role="cell"
          className={cn(TABLE_CELL_CLASS, column.className)}
        >
          <Skeleton className={cn("h-3", SKELETON_WIDTHS[column.key])} />
        </TableCell>
      ))}
    </TableRow>
  ));
}

export default function CompaniesTable() {
  const hydrated = useStoreHydrated();
  const density = useCompaniesStore((state) => state.density);
  const companies = useCompaniesStore((state) => state.companies);
  const filters = useCompaniesStore(useShallow(pickFilters));
  const selectedIds = useCompaniesStore((state) => state.selectedIds);
  const detailId = useCompaniesStore((state) => state.detailId);
  const detailOpen = useCompaniesStore((state) => state.detailOpen);
  const toggleSelected = useCompaniesStore((state) => state.toggleSelected);
  const setSelected = useCompaniesStore((state) => state.setSelected);
  const openDetail = useCompaniesStore((state) => state.openDetail);
  const openProfile = useCompaniesStore((state) => state.openProfile);
  const toggleSort = useCompaniesStore((state) => state.toggleSort);
  const resetFilters = useCompaniesStore((state) => state.resetFilters);
  const setSearchOpen = useCompaniesStore((state) => state.setSearchOpen);
  const setShortcutsOpen = useCompaniesStore((state) => state.setShortcutsOpen);
  const [scrolledX, setScrolledX] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const tableRef = useRef<HTMLTableElement>(null);
  const rowsRef = useRef<HTMLDivElement>(null);

  const visible = useMemo(
    () => filterCompanies(companies, filters),
    [companies, filters],
  );

  const ids = useMemo(() => visible.map((company) => company.id), [visible]);
  const selectedVisible = visible.filter((company) =>
    selectedIds.includes(company.id),
  );
  const [cursor, setCursor] = useTableKeyboard({
    ids,
    tableRef: rowsRef,
    hasSelection: selectedVisible.length > 0,
    onOpen: openDetail,
    onToggle: toggleSelected,
    onClearSelection: () => setSelected([]),
    onSearch: () => setSearchOpen(true),
    onHelp: () => setShortcutsOpen(true),
  });

  const allSelected =
    visible.length > 0 && selectedVisible.length === visible.length;
  const someSelected = selectedVisible.length > 0 && !allSelected;

  function toggleAll() {
    setSelected(allSelected ? [] : visible.map((company) => company.id));
  }

  function measureScroll(viewport: HTMLElement) {
    setScrolledX(viewport.scrollLeft > 0);
    setCanScrollRight(
      viewport.scrollLeft + viewport.clientWidth < viewport.scrollWidth - 1,
    );
  }

  useEffect(() => {
    const table = tableRef.current;
    const viewport = table?.closest<HTMLElement>(
      "[data-slot=scroll-area-viewport]",
    );
    if (!table || !viewport) return;
    const observer = new ResizeObserver(() => measureScroll(viewport));
    observer.observe(viewport);
    observer.observe(table);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      className="border-border flex min-h-0 flex-1 flex-col border-t"
      onScrollCapture={(event: UIEvent<HTMLDivElement>) => {
        const target = event.target as HTMLElement;
        if (target.dataset.slot === "scroll-area-viewport") {
          measureScroll(target);
        }
      }}
    >
      <div ref={rowsRef} className="relative flex min-h-0 flex-1 flex-col">
        <ScrollArea orientation="both" className="min-h-0 flex-1">
          <Table
            ref={tableRef}
            role="table"
            data-scrolled-x={scrolledX}
            className={cn(
              TABLE_GRID_CLASS,
              "group/table w-full max-sm:hidden",
              density === "compact" && "[--row-height:34px]",
              selectedVisible.length > 0 && "pb-16",
            )}
          >
            <TableHeader role="rowgroup" className="contents">
              <TableRow
                role="row"
                className={cn(TABLE_ROW_CLASS, TABLE_HEAD_ROW_CLASS)}
              >
                {TABLE_COLUMNS.map((column) => (
                  <TableHead
                    key={column.key}
                    role="columnheader"
                    aria-sort={
                      "sort" in column && filters.sortBy === column.sort
                        ? filters.sortDir === "asc"
                          ? "ascending"
                          : "descending"
                        : undefined
                    }
                    className={cn(
                      TABLE_CELL_CLASS,
                      column.className,
                      column.key === "name" && STICKY_CELL_CLASS,
                    )}
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
                        <SortButton
                          column={column}
                          sortBy={filters.sortBy}
                          sortDir={filters.sortDir}
                          onSort={toggleSort}
                        />
                      </span>
                    ) : (
                      <SortButton
                        column={column}
                        sortBy={filters.sortBy}
                        sortDir={filters.sortDir}
                        onSort={toggleSort}
                      />
                    )}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody role="rowgroup" className="contents">
              {!hydrated && <SkeletonRows />}
              {hydrated &&
                visible.map((company, index) => (
                  <CompanyRow
                    key={company.id}
                    index={index}
                    cursor={cursor === index}
                    company={company}
                    selected={selectedIds.includes(company.id)}
                    active={detailOpen && detailId === company.id}
                    onToggle={() => toggleSelected(company.id)}
                    onOpen={() => {
                      setCursor(index);
                      openDetail(company.id);
                    }}
                    onOpenOwner={() => openProfile(company.owner)}
                  />
                ))}
              {hydrated &&
                visible.length === 0 &&
                companies.map((company) => (
                  <CompanyRow
                    key={company.id}
                    sizer
                    index={-1}
                    cursor={false}
                    company={company}
                    selected={false}
                    active={false}
                    onToggle={() => {}}
                    onOpen={() => {}}
                    onOpenOwner={() => {}}
                  />
                ))}
              {hydrated && visible.length === 0 && (
                <TableRow role="row" className={TABLE_ROW_CLASS}>
                  <td role="cell" className="col-span-full">
                    <EmptyState
                      icon={FilterIcon}
                      title="No companies match these filters"
                      description="Remove a filter or widen the activity window."
                      action={
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={resetFilters}
                        >
                          Reset filters
                        </Button>
                      }
                    />
                  </td>
                </TableRow>
              )}
            </TableBody>
          </Table>

          {hydrated && visible.length > 0 && (
            <div className="border-border flex items-center gap-3 border-b px-4 py-2.5 sm:hidden">
              <Checkbox
                id="select-all-cards"
                checked={
                  allSelected ? true : someSelected ? "indeterminate" : false
                }
                onCheckedChange={toggleAll}
              />
              <label
                htmlFor="select-all-cards"
                className="caption-style text-fg-secondary cursor-pointer"
              >
                {selectedVisible.length > 0
                  ? `${selectedVisible.length} of ${visible.length} selected`
                  : `Select all ${visible.length}`}
              </label>
            </div>
          )}
          <ul
            aria-label="Companies"
            className={cn("sm:hidden", selectedVisible.length > 0 && "pb-16")}
          >
            {!hydrated &&
              Array.from({ length: 6 }, (_, index) => (
                <li
                  key={index}
                  className="border-border flex gap-3 border-b px-4 py-3.5"
                >
                  <Skeleton className="size-8 rounded-lg" />
                  <div className="flex flex-1 flex-col gap-2 pt-1">
                    <Skeleton className="h-3 w-32" />
                    <Skeleton className="h-3 w-48" />
                  </div>
                </li>
              ))}
            {hydrated &&
              visible.map((company, index) => (
                <CompanyCard
                  key={company.id}
                  index={index}
                  cursor={cursor === index}
                  company={company}
                  selected={selectedIds.includes(company.id)}
                  active={detailOpen && detailId === company.id}
                  onToggle={() => toggleSelected(company.id)}
                  onOpen={() => {
                    setCursor(index);
                    openDetail(company.id);
                  }}
                />
              ))}
            {hydrated && visible.length === 0 && (
              <li>
                <EmptyState
                  icon={FilterIcon}
                  title="No companies match these filters"
                  description="Remove a filter or widen the activity window."
                  className="short:py-4"
                  action={
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={resetFilters}
                    >
                      Reset filters
                    </Button>
                  }
                />
              </li>
            )}
          </ul>
        </ScrollArea>
        {canScrollRight && (
          <div
            aria-hidden
            className="from-background z-sticky-header pointer-events-none absolute inset-y-0 right-0 w-10 bg-linear-to-l to-transparent max-sm:hidden"
          />
        )}
        <BulkActions visibleIds={ids} />
      </div>
      <TableFooter companies={visible} loading={!hydrated} />
    </div>
  );
}
