import type { SortKey } from "@/data/companies";

type TableColumn = {
  key: string;
  label: string;
  className: string;
  sort?: SortKey;
};

export const TABLE_COLUMNS = [
  {
    key: "name",
    label: "Companies",
    className: "justify-start pl-4",
    sort: "name",
  },
  { key: "segment", label: "Segment & Stage", className: "justify-start" },
  { key: "owner", label: "Account Owner", className: "justify-start" },
  {
    key: "openDeals",
    label: "Open Deals",
    className: "justify-end pl-6 tabular-nums",
    sort: "openDeals",
  },
  {
    key: "pipelineValue",
    label: "Pipeline Value",
    className: "justify-end pl-6 tabular-nums",
    sort: "pipelineValue",
  },
  {
    key: "winProbability",
    label: "Win Probability",
    className: "justify-end pl-6 tabular-nums",
    sort: "winProbability",
  },
  { key: "trend", label: "Activity Trend", className: "justify-center" },
  {
    key: "lastInteraction",
    label: "Last Interaction",
    className: "justify-start",
    sort: "lastInteraction",
  },
  {
    key: "action",
    label: "Action",
    className: "justify-end",
  },
] as const satisfies readonly TableColumn[];

export type TableColumnKey = (typeof TABLE_COLUMNS)[number]["key"];

export const TABLE_GRID_CLASS =
  "grid min-w-max grid-cols-[repeat(9,max-content)] justify-between min-[1800px]:grid-cols-[repeat(8,max-content)_1fr] min-[1800px]:justify-start min-[1800px]:gap-x-10";

export const TABLE_ROW_CLASS = "col-span-full grid grid-cols-subgrid";

export const TABLE_HEAD_ROW_CLASS =
  "sticky top-0 z-sticky-header bg-background";

export const STICKY_CELL_CLASS =
  "sticky left-0 z-sticky bg-inherit transition-[box-shadow] duration-fast ease-power3-out group-data-[scrolled-x=true]/table:shadow-[1px_0_0_var(--line-strong)]";

export const TABLE_CELL_CLASS = "flex items-center";

export function columnClass(key: TableColumnKey) {
  return TABLE_COLUMNS.find((column) => column.key === key)?.className ?? "";
}
