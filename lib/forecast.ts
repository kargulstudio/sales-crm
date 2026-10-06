import type { TagTone } from "@/data/companies";
import { LOST_STAGE, WON_STAGE, type Deal, type DealStage } from "@/data/deals";
import {
  CURRENT_QUARTER_ID,
  QUARTERS,
  QUOTAS,
  type ForecastCategory,
  type Quarter,
} from "@/data/forecast";
import { formatMoney } from "@/lib/companies";
import { dealWin, isOpenStage, weightedValue } from "@/lib/deals";

export type ForecastFilters = {
  period: string;
  owner: string;
  category: string;
};

export type Submission = {
  amount: number;
  note: string;
  date: string;
};

export const STAGE_TONES: Record<DealStage, TagTone> = {
  Discovery: "neutral",
  Evaluation: "blue",
  Proposal: "purple",
  Procurement: "amber",
  "Closed Won": "green",
  "Closed Lost": "red",
};

export const CATEGORY_TONES: Record<ForecastCategory, TagTone> = {
  Commit: "green",
  "Best Case": "amber",
  Pipeline: "blue",
  Closed: "moss",
  Omitted: "neutral",
};

export const ALL_FORECAST_OWNERS = "all";
export const ANY_CATEGORY = "any";

export const DEFAULT_FORECAST_FILTERS: ForecastFilters = {
  period: CURRENT_QUARTER_ID,
  owner: ALL_FORECAST_OWNERS,
  category: ANY_CATEGORY,
};

export function forecastActiveFilterCount({
  period,
  owner,
  category,
}: ForecastFilters) {
  return [
    period !== DEFAULT_FORECAST_FILTERS.period,
    owner !== DEFAULT_FORECAST_FILTERS.owner,
    category !== DEFAULT_FORECAST_FILTERS.category,
  ].filter(Boolean).length;
}

export function quarterById(id: string): Quarter {
  return QUARTERS.find((quarter) => quarter.id === id) ?? QUARTERS[0];
}

function defaultCategory(deal: Deal): ForecastCategory {
  if (deal.stage === WON_STAGE) return "Closed";
  if (deal.stage === LOST_STAGE) return "Omitted";
  const win = dealWin(deal);
  if (deal.stage === "Procurement" || win >= 70) return "Commit";
  if (deal.stage === "Proposal" || win >= 40) return "Best Case";
  return "Pipeline";
}

export function dealCategory(deal: Deal): ForecastCategory {
  if (deal.stage === WON_STAGE) return "Closed";
  if (deal.stage === LOST_STAGE) return "Omitted";
  return deal.category ?? defaultCategory(deal);
}

export function canEditCategory(deal: Deal) {
  return isOpenStage(deal.stage);
}

export function dealsInQuarter(deals: Deal[], period: string) {
  const { start, end } = quarterById(period);
  return deals.filter(
    (deal) => deal.closeDate >= start && deal.closeDate <= end,
  );
}

export function openDealsInQuarter(deals: Deal[], period: string) {
  return dealsInQuarter(deals, period).filter((deal) =>
    isOpenStage(deal.stage),
  );
}

export function filterForecastDeals(
  deals: Deal[],
  { period, owner, category }: ForecastFilters,
) {
  return dealsInQuarter(deals, period)
    .filter(
      (deal) =>
        (owner === ALL_FORECAST_OWNERS || deal.owner === owner) &&
        (category === ANY_CATEGORY || dealCategory(deal) === category),
    )
    .sort((a, b) => b.value - a.value);
}

export type Rollup = {
  owner: string;
  quota: number;
  closed: number;
  commit: number;
  bestCase: number;
  pipeline: number;
  attainment: number;
  coverage: number | null;
};

function sumCategory(deals: Deal[], category: ForecastCategory) {
  return deals
    .filter((deal) => dealCategory(deal) === category)
    .reduce((sum, deal) => sum + deal.value, 0);
}

export function buildRollup(
  owner: string,
  quota: number,
  deals: Deal[],
): Rollup {
  const closed = sumCategory(deals, "Closed");
  const commit = sumCategory(deals, "Commit");
  const bestCase = sumCategory(deals, "Best Case");
  const pipeline = sumCategory(deals, "Pipeline");
  const remaining = quota - closed;
  return {
    owner,
    quota,
    closed,
    commit,
    bestCase,
    pipeline,
    attainment: quota > 0 ? Math.round((closed / quota) * 100) : 0,
    coverage: remaining > 0 ? (commit + bestCase + pipeline) / remaining : null,
  };
}

export function quotaOwners(period: string) {
  return Object.keys(QUOTAS[period] ?? {});
}

export function repRollups(deals: Deal[], period: string, owner: string) {
  const inQuarter = dealsInQuarter(deals, period);
  return quotaOwners(period)
    .filter((name) => owner === ALL_FORECAST_OWNERS || name === owner)
    .map((name) =>
      buildRollup(
        name,
        QUOTAS[period][name],
        inQuarter.filter((deal) => deal.owner === name),
      ),
    )
    .sort((a, b) => b.closed - a.closed || b.commit - a.commit);
}

export function teamTotals(rollups: Rollup[]): Rollup {
  const sum = (pick: (rollup: Rollup) => number) =>
    rollups.reduce((total, rollup) => total + pick(rollup), 0);
  const quota = sum((rollup) => rollup.quota);
  const closed = sum((rollup) => rollup.closed);
  const commit = sum((rollup) => rollup.commit);
  const bestCase = sum((rollup) => rollup.bestCase);
  const pipeline = sum((rollup) => rollup.pipeline);
  const remaining = quota - closed;
  return {
    owner: "Team total",
    quota,
    closed,
    commit,
    bestCase,
    pipeline,
    attainment: quota > 0 ? Math.round((closed / quota) * 100) : 0,
    coverage: remaining > 0 ? (commit + bestCase + pipeline) / remaining : null,
  };
}

export function gapToQuota(totals: Rollup) {
  return Math.max(0, totals.quota - totals.closed - totals.commit);
}

export function formatCoverage({
  coverage,
  commit,
  bestCase,
  pipeline,
}: Rollup) {
  if (coverage === null) return "Met";
  if (commit + bestCase + pipeline === 0) return "—";
  return `${coverage.toFixed(1)}x`;
}

export function forecastCsvRows(
  deals: Deal[],
  companyName: (companyId: string) => string,
) {
  return [
    [
      "Deal",
      "Company",
      "Stage",
      "Category",
      "Owner",
      "Value",
      "Win Probability (%)",
      "Close Date",
    ],
    ...deals.map((deal) => [
      deal.name,
      companyName(deal.companyId),
      deal.stage,
      dealCategory(deal),
      deal.owner,
      deal.value,
      dealWin(deal),
      deal.closeDate,
    ]),
  ];
}

export const FORECAST_CALCULATIONS = [
  { value: "totalValue", label: "Total value" },
  { value: "commitValue", label: "Commit value" },
  { value: "closedValue", label: "Closed won" },
  { value: "weightedValue", label: "Weighted open value" },
  { value: "avgValue", label: "Avg deal value" },
  { value: "largest", label: "Largest deal" },
];

export function calculateForecast(kind: string, deals: Deal[]) {
  const counted = deals.filter((deal) => dealCategory(deal) !== "Omitted");
  const open = counted.filter((deal) => isOpenStage(deal.stage));
  const total = counted.reduce((sum, deal) => sum + deal.value, 0);

  switch (kind) {
    case "totalValue":
      return `$${formatMoney(total)}`;
    case "commitValue":
      return `$${formatMoney(sumCategory(counted, "Commit"))}`;
    case "closedValue":
      return `$${formatMoney(sumCategory(counted, "Closed"))}`;
    case "weightedValue":
      return `$${formatMoney(weightedValue(open))}`;
    case "avgValue":
      return `$${formatMoney(counted.length ? Math.round(total / counted.length) : 0)}`;
    case "largest":
      return `$${formatMoney(Math.max(0, ...counted.map((deal) => deal.value)))}`;
    default:
      return "";
  }
}
