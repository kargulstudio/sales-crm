export const DEAL_COLUMNS = [
  { key: "name", label: "Deal", className: "justify-start" },
  { key: "company", label: "Company", className: "justify-start" },
  { key: "owner", label: "Owner", className: "justify-center" },
  { key: "stage", label: "Stage", className: "justify-start" },
  { key: "value", label: "Value", className: "justify-end tabular-nums" },
  { key: "win", label: "Win", className: "justify-end tabular-nums" },
  { key: "closeDate", label: "Close Date", className: "justify-start" },
  { key: "category", label: "Category", className: "justify-start" },
] as const;

export type DealColumnKey = (typeof DEAL_COLUMNS)[number]["key"];

export const DEAL_GRID_CLASS =
  "grid min-w-max grid-cols-[repeat(8,max-content)] justify-between";

export const DEAL_ROW_CLASS = "col-span-full grid grid-cols-subgrid";

export const DEAL_CELL_CLASS = "flex items-center";

export function dealColumnClass(key: DealColumnKey) {
  return DEAL_COLUMNS.find((column) => column.key === key)?.className ?? "";
}
