export const TABLE_COLUMNS = [
  { key: "name", label: "Contacts", className: "justify-start" },
  { key: "company", label: "Company", className: "justify-start" },
  { key: "role", label: "Role", className: "justify-start" },
  { key: "status", label: "Status", className: "justify-start" },
  { key: "deals", label: "Open Deals", className: "justify-start" },
  {
    key: "engagement",
    label: "Engagement",
    className: "justify-end tabular-nums",
  },
  { key: "lastTouch", label: "Last Touch", className: "justify-start" },
  { key: "reach", label: "Reach out", className: "justify-center" },
  { key: "action", label: "Action", className: "justify-center" },
] as const;

export type TableColumnKey = (typeof TABLE_COLUMNS)[number]["key"];

export const TABLE_GRID_CLASS =
  "grid min-w-max grid-cols-[repeat(9,max-content)] justify-between";

export const TABLE_ROW_CLASS = "col-span-full grid grid-cols-subgrid";

export const TABLE_CELL_CLASS = "flex items-center";

export function columnClass(key: TableColumnKey) {
  return TABLE_COLUMNS.find((column) => column.key === key)?.className ?? "";
}
