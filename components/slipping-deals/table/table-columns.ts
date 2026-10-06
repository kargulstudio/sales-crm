export const SLIPPING_COLUMNS = [
  { key: "deal", label: "Deal", className: "justify-start" },
  { key: "owner", label: "Owner", className: "justify-center" },
  { key: "stage", label: "Stage", className: "justify-start" },
  { key: "value", label: "Value", className: "justify-end tabular-nums" },
  { key: "win", label: "Win", className: "justify-end tabular-nums" },
  { key: "closeDate", label: "Close Date", className: "justify-start" },
  { key: "slips", label: "Slips", className: "justify-end tabular-nums" },
  {
    key: "daysSlipped",
    label: "Days Slipped",
    className: "justify-end tabular-nums",
  },
  { key: "reason", label: "Reason", className: "justify-start" },
  { key: "action", label: "Action", className: "justify-center" },
] as const;

export type SlippingColumnKey = (typeof SLIPPING_COLUMNS)[number]["key"];

export const SLIPPING_GRID_CLASS =
  "grid min-w-max grid-cols-[repeat(10,max-content)] justify-between";

export const SLIPPING_ROW_CLASS = "col-span-full grid grid-cols-subgrid";

export const SLIPPING_CELL_CLASS = "flex items-center";

export function slippingColumnClass(key: SlippingColumnKey) {
  return SLIPPING_COLUMNS.find((column) => column.key === key)?.className ?? "";
}
