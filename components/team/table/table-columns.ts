export type TeamColumnKey =
  | "rep"
  | "quota"
  | "closed"
  | "attainment"
  | "commit"
  | "pipeline"
  | "openDeals"
  | "avgWin"
  | "stale"
  | "lastActivity"
  | "meetings";

export type TeamColumn = {
  key: TeamColumnKey;
  label: string;
  className: string;
};

const NUMBER = "justify-end tabular-nums";

export const AE_COLUMNS: TeamColumn[] = [
  { key: "rep", label: "Rep", className: "justify-start" },
  { key: "quota", label: "Quota", className: NUMBER },
  { key: "closed", label: "Closed Won", className: NUMBER },
  { key: "attainment", label: "Attainment", className: NUMBER },
  { key: "commit", label: "Commit", className: NUMBER },
  { key: "pipeline", label: "Open Pipeline", className: NUMBER },
  { key: "openDeals", label: "Open Deals", className: NUMBER },
  { key: "avgWin", label: "Avg Win", className: NUMBER },
  { key: "stale", label: "Stale", className: NUMBER },
  { key: "lastActivity", label: "Last Activity", className: "justify-start" },
];

export const SDR_COLUMNS: TeamColumn[] = [
  { key: "rep", label: "Rep", className: "justify-start" },
  { key: "meetings", label: "Meetings", className: NUMBER },
  { key: "openDeals", label: "Open Deals", className: NUMBER },
  { key: "pipeline", label: "Open Pipeline", className: NUMBER },
  { key: "avgWin", label: "Avg Win", className: NUMBER },
  { key: "lastActivity", label: "Last Activity", className: "justify-start" },
];

export const AE_GRID_CLASS =
  "grid min-w-max grid-cols-[repeat(10,max-content)] justify-between";

export const SDR_GRID_CLASS =
  "grid min-w-max grid-cols-[repeat(6,max-content)] justify-between";

export const TEAM_ROW_CLASS = "col-span-full grid grid-cols-subgrid";

export const TEAM_CELL_CLASS = "flex items-center";
