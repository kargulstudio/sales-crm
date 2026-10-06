const NUMBER = "justify-end tabular-nums";

export const STAGE_COLUMNS = [
  { key: "stage", label: "Stage", className: "justify-start" },
  { key: "count", label: "Deals", className: NUMBER },
  { key: "value", label: "Value", className: NUMBER },
  { key: "avgWin", label: "Avg Win", className: NUMBER },
  { key: "weighted", label: "Weighted", className: NUMBER },
] as const;

export const STAGE_GRID_CLASS =
  "grid min-w-max grid-cols-[repeat(5,max-content)] justify-between";

export const STAGE_ROW_CLASS = "col-span-full grid grid-cols-subgrid";

export const STAGE_CELL_CLASS = "flex items-center";
