import { ownerByName } from "@/data/companies";
import type { Deal } from "@/data/deals";
import { CURRENT_QUARTER_ID } from "@/data/forecast";
import { TEAMS, type Team } from "@/data/team";
import { TODAY, formatCount, formatMoney } from "@/lib/companies";
import {
  MAX_COUNTED_PER_TYPE,
  addDays,
  dealWin,
  isOpenStage,
} from "@/lib/deals";
import { quarterById } from "@/lib/forecast";

export const ALL_SLIPPING = "all";
export const ANY_REASON = "any";

export const SLIPPING_TEAMS: Team[] = [...TEAMS];

export const REASON_FILTER_OPTIONS = [
  { value: ANY_REASON, label: "Any" },
  { value: "Pushed", label: "Pushed" },
  { value: "Past due", label: "Past due" },
];

export const SLIPPING_SORT_OPTIONS = [
  { value: "daysSlipped", label: "Days Slipped" },
  { value: "value", label: "Value" },
  { value: "slips", label: "Slip Count" },
  { value: "closeDate", label: "Close Date" },
] as const;

export type SlippingSortKey = (typeof SLIPPING_SORT_OPTIONS)[number]["value"];

export type SlipReason = "Pushed" | "Past due" | "Both";

export type SlippingFilters = {
  reason: string;
  owner: string;
  team: string;
  sortBy: SlippingSortKey;
};

export const DEFAULT_SLIPPING_FILTERS: SlippingFilters = {
  reason: ANY_REASON,
  owner: ALL_SLIPPING,
  team: ALL_SLIPPING,
  sortBy: "daysSlipped",
};

export function slippingActiveFilterCount({
  reason,
  owner,
  team,
  sortBy,
}: SlippingFilters) {
  return [
    reason !== DEFAULT_SLIPPING_FILTERS.reason,
    owner !== DEFAULT_SLIPPING_FILTERS.owner,
    team !== DEFAULT_SLIPPING_FILTERS.team,
    sortBy !== DEFAULT_SLIPPING_FILTERS.sortBy,
  ].filter(Boolean).length;
}

export type SlippingDeal = {
  deal: Deal;
  slips: number;
  daysSlipped: number;
  pastDueDays: number;
  reason: SlipReason;
  value: number;
  win: number;
  lastPush: string | null;
  firstFrom: string | null;
};

function daysBetween(later: string, earlier: string) {
  const day = 24 * 60 * 60 * 1000;
  return Math.round((Date.parse(later) - Date.parse(earlier)) / day);
}

function slippingRow(deal: Deal): SlippingDeal | null {
  if (!isOpenStage(deal.stage)) return null;
  const pushes = deal.activity.filter((event) => event.type === "closePushed");
  const pastDueDays =
    deal.closeDate < TODAY ? daysBetween(TODAY, deal.closeDate) : 0;
  if (pushes.length === 0 && pastDueDays === 0) return null;
  const origins = pushes
    .map((event) => event.from)
    .filter((from): from is string => from !== undefined)
    .sort();
  const firstFrom = origins[0] ?? null;
  const lastPush = pushes.reduce<string | null>(
    (newest, event) =>
      newest === null || event.date > newest ? event.date : newest,
    null,
  );
  return {
    deal,
    slips: pushes.length,
    daysSlipped: firstFrom
      ? Math.max(0, daysBetween(deal.closeDate, firstFrom))
      : 0,
    pastDueDays,
    reason:
      pushes.length > 0 && pastDueDays > 0
        ? "Both"
        : pushes.length > 0
          ? "Pushed"
          : "Past due",
    value: deal.value,
    win: dealWin(deal),
    lastPush,
    firstFrom,
  };
}

export function slippingRows(deals: Deal[]) {
  return deals.flatMap((deal) => slippingRow(deal) ?? []);
}

export function slippingCount(deals: Deal[]) {
  return slippingRows(deals).length;
}

export function slippingOwners(rows: SlippingDeal[], team: string) {
  return [...new Set(rows.map((row) => row.deal.owner))]
    .filter((name) => team === ALL_SLIPPING || ownerByName(name).team === team)
    .sort((a, b) => a.localeCompare(b));
}

function sortSlipping(rows: SlippingDeal[], sortBy: SlippingSortKey) {
  return [...rows].sort((a, b) => {
    switch (sortBy) {
      case "value":
        return b.value - a.value;
      case "slips":
        return b.slips - a.slips || b.daysSlipped - a.daysSlipped;
      case "closeDate":
        return a.deal.closeDate.localeCompare(b.deal.closeDate);
      default:
        return (
          b.daysSlipped - a.daysSlipped ||
          b.pastDueDays - a.pastDueDays ||
          b.value - a.value
        );
    }
  });
}

export function filterSlipping(
  rows: SlippingDeal[],
  { reason, owner, team, sortBy }: SlippingFilters,
) {
  return sortSlipping(
    rows.filter(
      (row) =>
        (reason === ANY_REASON ||
          row.reason === reason ||
          row.reason === "Both") &&
        (owner === ALL_SLIPPING || row.deal.owner === owner) &&
        (team === ALL_SLIPPING || ownerByName(row.deal.owner).team === team),
    ),
    sortBy,
  );
}

export type SlippingSummary = {
  count: number;
  value: number;
  avgDays: number;
  totalSlips: number;
  pushedThisQuarter: number;
  pastDueCount: number;
  pastDueValue: number;
  avgWin: number;
  largest: number;
};

export function slippingSummary(rows: SlippingDeal[]): SlippingSummary {
  const { start, end } = quarterById(CURRENT_QUARTER_ID);
  const slipped = rows.filter((row) => row.daysSlipped > 0);
  const pastDue = rows.filter((row) => row.pastDueDays > 0);
  const sum = (list: SlippingDeal[], pick: (row: SlippingDeal) => number) =>
    list.reduce((total, row) => total + pick(row), 0);
  return {
    count: rows.length,
    value: sum(rows, (row) => row.value),
    avgDays: slipped.length
      ? Math.round(sum(slipped, (row) => row.daysSlipped) / slipped.length)
      : 0,
    totalSlips: sum(rows, (row) => row.slips),
    pushedThisQuarter: sum(
      rows,
      (row) =>
        row.deal.activity.filter(
          (event) =>
            event.type === "closePushed" &&
            event.date >= start &&
            event.date <= end,
        ).length,
    ),
    pastDueCount: pastDue.length,
    pastDueValue: sum(pastDue, (row) => row.value),
    avgWin: rows.length
      ? Math.round(sum(rows, (row) => row.win) / rows.length)
      : 0,
    largest: Math.max(0, ...rows.map((row) => row.value)),
  };
}

export const SLIPPING_CALCULATIONS = [
  { value: "valueAtRisk", label: "Value at risk" },
  { value: "avgDays", label: "Avg days slipped" },
  { value: "totalSlips", label: "Total slips" },
  { value: "pastDueValue", label: "Past due value" },
  { value: "avgWin", label: "Avg win probability" },
  { value: "largest", label: "Largest deal" },
];

export function calculateSlipping(kind: string, summary: SlippingSummary) {
  switch (kind) {
    case "valueAtRisk":
      return `$${formatMoney(summary.value)}`;
    case "avgDays":
      return `${summary.avgDays}d`;
    case "totalSlips":
      return formatCount(summary.totalSlips);
    case "pastDueValue":
      return `$${formatMoney(summary.pastDueValue)}`;
    case "avgWin":
      return `${summary.avgWin}%`;
    case "largest":
      return `$${formatMoney(summary.largest)}`;
    default:
      return "";
  }
}

export function pushCapped(deal: Deal) {
  return (
    deal.activity.filter(
      (event) =>
        event.type === "closePushed" && event.date >= deal.stageChangedAt,
    ).length >= MAX_COUNTED_PER_TYPE
  );
}

export function minPushDate(deal: Deal) {
  const next = addDays(deal.closeDate, 1);
  return next > TODAY ? next : TODAY;
}

export function endOfNextQuarter() {
  const [year, month] = TODAY.split("-").map(Number);
  const index = Math.floor((month - 1) / 3) + 1;
  const endYear = year + Math.floor(index / 4);
  const endQuarter = (index % 4) + 1;
  const endMonth = endQuarter * 3;
  const lastDay = new Date(Date.UTC(endYear, endMonth, 0)).getUTCDate();
  return `${endYear}-${String(endMonth).padStart(2, "0")}-${String(lastDay).padStart(2, "0")}`;
}

export function slippingCsvRows(
  rows: SlippingDeal[],
  companyName: (companyId: string) => string,
) {
  return [
    [
      "Deal",
      "Company",
      "Owner",
      "Stage",
      "Value",
      "Win Probability (%)",
      "Close Date",
      "Original Close Date",
      "Slips",
      "Days Slipped",
      "Days Past Due",
      "Reason",
    ],
    ...rows.map((row) => [
      row.deal.name,
      companyName(row.deal.companyId),
      row.deal.owner,
      row.deal.stage,
      row.value,
      row.win,
      row.deal.closeDate,
      row.firstFrom ?? "",
      row.slips,
      row.daysSlipped,
      row.pastDueDays,
      row.reason,
    ]),
  ];
}
