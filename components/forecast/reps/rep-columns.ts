export const REP_COLUMNS = [
  { key: "owner", label: "Owner", className: "justify-start" },
  { key: "quota", label: "Quota", className: "justify-end tabular-nums" },
  {
    key: "closed",
    label: "Closed Won",
    className: "justify-end tabular-nums",
  },
  { key: "commit", label: "Commit", className: "justify-end tabular-nums" },
  {
    key: "bestCase",
    label: "Best Case",
    className: "justify-end tabular-nums",
  },
  {
    key: "pipeline",
    label: "Pipeline",
    className: "justify-end tabular-nums",
  },
  {
    key: "attainment",
    label: "Attainment",
    className: "justify-end tabular-nums",
  },
  { key: "coverage", label: "Coverage", className: "justify-end tabular-nums" },
] as const;

export type RepColumnKey = (typeof REP_COLUMNS)[number]["key"];

export const REP_GRID_CLASS =
  "grid min-w-max grid-cols-[repeat(8,max-content)] justify-between";

export const REP_ROW_CLASS = "col-span-full grid grid-cols-subgrid";

export const REP_CELL_CLASS = "flex items-center";

export function repColumnClass(key: RepColumnKey) {
  return REP_COLUMNS.find((column) => column.key === key)?.className ?? "";
}
