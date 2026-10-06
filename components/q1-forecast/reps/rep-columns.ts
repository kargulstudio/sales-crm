const NUMBER = "justify-end tabular-nums";

export const REP_COLUMNS = [
  { key: "owner", label: "Owner", className: "justify-start" },
  { key: "quota", label: "Quota", className: NUMBER },
  { key: "commit", label: "Commit", className: NUMBER },
  { key: "bestCase", label: "Best Case", className: NUMBER },
  { key: "pipeline", label: "Pipeline", className: NUMBER },
  { key: "weighted", label: "Weighted", className: NUMBER },
  { key: "coverage", label: "Coverage", className: NUMBER },
] as const;

export type RepColumnKey = (typeof REP_COLUMNS)[number]["key"];

export const REP_GRID_CLASS =
  "grid min-w-max grid-cols-[repeat(7,max-content)] justify-between";

export const REP_ROW_CLASS = "col-span-full grid grid-cols-subgrid";

export const REP_CELL_CLASS = "flex items-center";

export function repColumnClass(key: RepColumnKey) {
  return REP_COLUMNS.find((column) => column.key === key)?.className ?? "";
}
