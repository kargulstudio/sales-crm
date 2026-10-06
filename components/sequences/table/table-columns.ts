export const TABLE_COLUMNS = [
  { key: "name", label: "Sequence", className: "justify-start" },
  { key: "owner", label: "Owner", className: "justify-start" },
  { key: "status", label: "Status", className: "justify-start" },
  {
    key: "enrolled",
    label: "Enrolled",
    className: "justify-end tabular-nums",
  },
  { key: "active", label: "Active", className: "justify-end tabular-nums" },
  {
    key: "openRate",
    label: "Open Rate",
    className: "justify-end tabular-nums",
  },
  {
    key: "replyRate",
    label: "Reply Rate",
    className: "justify-end tabular-nums",
  },
  {
    key: "meetings",
    label: "Meetings",
    className: "justify-end tabular-nums",
  },
  { key: "lastSent", label: "Last Sent", className: "justify-start" },
  { key: "action", label: "Action", className: "justify-center" },
] as const;

export type TableColumnKey = (typeof TABLE_COLUMNS)[number]["key"];

export const TABLE_GRID_CLASS =
  "grid min-w-max grid-cols-[repeat(10,max-content)] justify-between";

export const TABLE_ROW_CLASS = "col-span-full grid grid-cols-subgrid";

export const TABLE_CELL_CLASS = "flex items-center";

export function columnClass(key: TableColumnKey) {
  return TABLE_COLUMNS.find((column) => column.key === key)?.className ?? "";
}
