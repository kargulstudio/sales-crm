import { ownerByName } from "@/data/companies";
import { DEAL_STAGES, type Deal, type DealStage } from "@/data/deals";
import { Q1_QUARTER_ID, QUOTAS, type ForecastCategory } from "@/data/forecast";
import { TEAMS, type Team } from "@/data/team";
import { dealWin, isOpenStage, weightedTotal } from "@/lib/deals";
import {
  buildRollup,
  dealCategory,
  dealsInQuarter,
  quotaOwners,
  teamTotals,
  type Rollup,
} from "@/lib/forecast";
import { averageOpenWin } from "@/lib/team";

export const ALL_Q1 = "all";

export const HEALTHY_COVERAGE = 3;

export type Q1Filters = {
  owner: string;
  team: string;
};

export const DEFAULT_Q1_FILTERS: Q1Filters = {
  owner: ALL_Q1,
  team: ALL_Q1,
};

export const Q1_TEAMS: Team[] = [...TEAMS];

export const Q1_CATEGORIES: ForecastCategory[] = [
  "Closed",
  "Commit",
  "Best Case",
  "Pipeline",
];

export const Q1_MONTHS = [
  { key: "2027-01", label: "January" },
  { key: "2027-02", label: "February" },
  { key: "2027-03", label: "March" },
];

export function q1ActiveFilterCount({ owner, team }: Q1Filters) {
  return [owner !== ALL_Q1, team !== ALL_Q1].filter(Boolean).length;
}

export function q1Owners(deals: Deal[], team: string) {
  const names = new Set([
    ...quotaOwners(Q1_QUARTER_ID),
    ...dealsInQuarter(deals, Q1_QUARTER_ID).map((deal) => deal.owner),
  ]);
  return [...names]
    .filter((name) => team === ALL_Q1 || ownerByName(name).team === team)
    .sort((a, b) => a.localeCompare(b));
}

function q1DealsInView(deals: Deal[], { owner, team }: Q1Filters) {
  const names = q1Owners(deals, team).filter(
    (name) => owner === ALL_Q1 || name === owner,
  );
  return dealsInQuarter(deals, Q1_QUARTER_ID)
    .filter((deal) => names.includes(deal.owner))
    .sort(
      (a, b) => a.closeDate.localeCompare(b.closeDate) || b.value - a.value,
    );
}

function q1Coverage(openPipeline: number, quota: number) {
  return quota > 0 ? openPipeline / quota : null;
}

export function formatQ1Coverage(coverage: number | null) {
  return coverage === null ? "—" : `${coverage.toFixed(1)}x`;
}

export type Q1Month = {
  key: string;
  label: string;
  count: number;
  total: number;
  byCategory: Record<string, number>;
};

export type Q1Stage = {
  stage: DealStage;
  count: number;
  value: number;
  avgWin: number | null;
  weighted: number | null;
};

export type Q1Rep = Rollup & {
  weighted: number;
  openPipeline: number;
  openCoverage: number | null;
};

export type Q1Report = {
  deals: Deal[];
  counted: Deal[];
  totals: Rollup;
  openPipeline: number;
  weighted: number;
  coverage: number | null;
  needed: number;
  months: Q1Month[];
  stages: Q1Stage[];
  reps: Q1Rep[];
  repTotal: Q1Rep;
};

function openPipelineOf(rollup: Rollup) {
  return rollup.commit + rollup.bestCase + rollup.pipeline;
}

function toRep(rollup: Rollup, deals: Deal[]): Q1Rep {
  const open = openPipelineOf(rollup);
  return {
    ...rollup,
    weighted: weightedTotal(deals.filter((deal) => isOpenStage(deal.stage))),
    openPipeline: open,
    openCoverage: q1Coverage(open, rollup.quota),
  };
}

export function buildQ1Report(deals: Deal[], filters: Q1Filters): Q1Report {
  const inView = q1DealsInView(deals, filters);
  const counted = inView.filter((deal) => dealCategory(deal) !== "Omitted");
  const names = q1Owners(deals, filters.team).filter(
    (name) => filters.owner === ALL_Q1 || name === filters.owner,
  );

  const rollups = names.map((name) =>
    buildRollup(
      name,
      QUOTAS[Q1_QUARTER_ID][name] ?? 0,
      counted.filter((deal) => deal.owner === name),
    ),
  );
  const reps = rollups
    .map((rollup) =>
      toRep(
        rollup,
        counted.filter((deal) => deal.owner === rollup.owner),
      ),
    )
    .sort((a, b) => b.openPipeline - a.openPipeline || b.quota - a.quota);

  const totals = teamTotals(rollups);
  const openPipeline = openPipelineOf(totals);
  const open = counted.filter((deal) => isOpenStage(deal.stage));

  const months = Q1_MONTHS.map((month) => {
    const list = counted.filter((deal) => deal.closeDate.startsWith(month.key));
    const byCategory: Record<string, number> = {};
    for (const category of Q1_CATEGORIES) {
      byCategory[category] = list
        .filter((deal) => dealCategory(deal) === category)
        .reduce((sum, deal) => sum + deal.value, 0);
    }
    return {
      ...month,
      count: list.length,
      total: list.reduce((sum, deal) => sum + deal.value, 0),
      byCategory,
    };
  });

  const stages = DEAL_STAGES.map((stage) => {
    const list = counted.filter((deal) => deal.stage === stage);
    return {
      stage,
      count: list.length,
      value: list.reduce((sum, deal) => sum + deal.value, 0),
      avgWin: averageOpenWin(list),
      weighted: isOpenStage(stage) ? weightedTotal(list) : null,
    };
  }).filter((row) => isOpenStage(row.stage) || row.count > 0);

  return {
    deals: inView,
    counted,
    totals,
    openPipeline,
    weighted: weightedTotal(open),
    coverage: q1Coverage(openPipeline, totals.quota),
    needed: Math.max(0, HEALTHY_COVERAGE * totals.quota - openPipeline),
    months,
    stages,
    reps,
    repTotal: toRep(totals, counted),
  };
}

export function q1OpenDealCount(deals: Deal[]) {
  return q1DealsInView(deals, DEFAULT_Q1_FILTERS).filter((deal) =>
    isOpenStage(deal.stage),
  ).length;
}

function q1DealWeighted(deal: Deal) {
  return Math.round((deal.value * dealWin(deal)) / 100);
}

export function q1CsvRows(
  deals: Deal[],
  companyName: (companyId: string) => string,
) {
  return [
    [
      "Deal",
      "Company",
      "Owner",
      "Stage",
      "Category",
      "Value",
      "Win Probability (%)",
      "Weighted Value",
      "Close Date",
    ],
    ...deals.map((deal) => [
      deal.name,
      companyName(deal.companyId),
      deal.owner,
      deal.stage,
      dealCategory(deal),
      deal.value,
      dealWin(deal),
      q1DealWeighted(deal),
      deal.closeDate,
    ]),
  ];
}
