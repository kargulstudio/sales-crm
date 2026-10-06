import {
  OPEN_STAGES,
  STALE_AFTER_DAYS,
  type CloseWindow,
  type Deal,
  type DealActivityType,
  type DealSortKey,
  type DealStage,
  type Region,
} from "@/data/deals";
import {
  TODAY,
  TREND_WEEKS,
  daysSince,
  formatCount,
  formatMoney,
  type CompanySummary,
} from "@/lib/companies";

export const STAGE_BASE: Record<DealStage, number> = {
  Discovery: 10,
  Evaluation: 25,
  Proposal: 50,
  Procurement: 75,
  "Closed Won": 100,
  "Closed Lost": 0,
};

export const ACTIVITY_EFFECTS: Record<
  DealActivityType,
  { label: string; delta: number }
> = {
  meeting: { label: "Meeting booked", delta: 10 },
  reply: { label: "Reply received", delta: 5 },
  proposalViewed: { label: "Proposal viewed", delta: 5 },
  decisionMaker: { label: "Decision-maker added", delta: 10 },
  closePushed: { label: "Close date pushed", delta: -10 },
  unanswered: { label: "Email unanswered", delta: -5 },
  championLeft: { label: "Champion left", delta: -20 },
};

export const STALE_PENALTY = -15;

export const MAX_COUNTED_PER_TYPE = 2;
export const MIN_OPEN_WIN = 1;
export const MAX_OPEN_WIN = 99;
export const OVERRIDE_STEP = 5;

export type DealFilters = {
  sortBy: DealSortKey;
  owner: string;
  motion: string;
  closeWindow: CloseWindow;
  region: string;
};

export type DealScope = "all" | Region;

export const ALL_DEAL_OWNERS = "all";
export const ANY_MOTION = "any";
export const ANY_REGION = "any";

export const DEFAULT_DEAL_FILTERS: DealFilters = {
  sortBy: "value",
  owner: ALL_DEAL_OWNERS,
  motion: ANY_MOTION,
  closeWindow: "any",
  region: ANY_REGION,
};

export function dealActiveFilterCount({
  owner,
  motion,
  closeWindow,
  region,
}: DealFilters) {
  return [
    owner !== DEFAULT_DEAL_FILTERS.owner,
    motion !== DEFAULT_DEAL_FILTERS.motion,
    closeWindow !== DEFAULT_DEAL_FILTERS.closeWindow,
    region !== DEFAULT_DEAL_FILTERS.region,
  ].filter(Boolean).length;
}

export function isOpenStage(stage: DealStage) {
  return OPEN_STAGES.includes(stage);
}

export function addDays(iso: string, days: number) {
  const day = 24 * 60 * 60 * 1000;
  return new Date(Date.parse(iso) + days * day).toISOString().slice(0, 10);
}

const NOT_ACTIVITY: DealActivityType[] = ["closePushed", "championLeft"];

export function lastActivityDate(deal: Deal) {
  return deal.activity
    .filter((event) => !NOT_ACTIVITY.includes(event.type))
    .reduce(
      (newest, event) => (event.date > newest ? event.date : newest),
      deal.stageChangedAt,
    );
}

export function lastActivityDays(deal: Deal) {
  return daysSince(lastActivityDate(deal));
}

export function isStale(deal: Deal) {
  return isOpenStage(deal.stage) && lastActivityDays(deal) > STALE_AFTER_DAYS;
}

export type WinAdjustment = {
  key: string;
  label: string;
  delta: number;
  date?: string;
};

export type WinBreakdown = {
  base: number;
  adjustments: WinAdjustment[];
  computed: number;
  manual: boolean;
  win: number;
};

function clampOpen(value: number) {
  return Math.min(MAX_OPEN_WIN, Math.max(MIN_OPEN_WIN, value));
}

export function dealWinBreakdown(deal: Deal): WinBreakdown {
  const base = STAGE_BASE[deal.stage];
  if (!isOpenStage(deal.stage)) {
    return { base, adjustments: [], computed: base, manual: false, win: base };
  }

  const counted = new Map<DealActivityType, number>();
  const adjustments: WinAdjustment[] = deal.activity
    .filter((event) => event.date >= deal.stageChangedAt)
    .sort((a, b) => a.date.localeCompare(b.date))
    .map((event) => {
      const seen = counted.get(event.type) ?? 0;
      counted.set(event.type, seen + 1);
      const capped = seen >= MAX_COUNTED_PER_TYPE;
      return {
        key: event.id,
        label: capped
          ? `${ACTIVITY_EFFECTS[event.type].label} (already counted twice)`
          : ACTIVITY_EFFECTS[event.type].label,
        delta: capped ? 0 : ACTIVITY_EFFECTS[event.type].delta,
        date: event.date,
      };
    });

  if (isStale(deal)) {
    adjustments.push({
      key: "stale",
      label: `No activity in ${STALE_AFTER_DAYS} days`,
      delta: STALE_PENALTY,
    });
  }

  const computed = clampOpen(
    adjustments.reduce((sum, item) => sum + item.delta, base),
  );
  const manual = deal.winOverride !== undefined;
  const win = manual ? clampOpen(deal.winOverride as number) : computed;
  return { base, adjustments, computed, manual, win };
}

export function dealWin(deal: Deal) {
  return dealWinBreakdown(deal).win;
}

export function isManualWin(deal: Deal) {
  return isOpenStage(deal.stage) && deal.winOverride !== undefined;
}

function companyWinMap(deals: Deal[]) {
  const totals = new Map<
    string,
    { weighted: number; value: number; sum: number; count: number }
  >();
  for (const deal of deals) {
    if (!isOpenStage(deal.stage)) continue;
    const entry = totals.get(deal.companyId) ?? {
      weighted: 0,
      value: 0,
      sum: 0,
      count: 0,
    };
    const win = dealWin(deal);
    entry.weighted += deal.value * win;
    entry.value += deal.value;
    entry.sum += win;
    entry.count += 1;
    totals.set(deal.companyId, entry);
  }
  const wins = new Map<string, number>();
  for (const [companyId, entry] of totals) {
    wins.set(
      companyId,
      Math.round(
        entry.value > 0
          ? entry.weighted / entry.value
          : entry.sum / entry.count,
      ),
    );
  }
  return wins;
}

export const INTERACTION_LABELS: Record<DealActivityType, string> = {
  meeting: "Meeting",
  reply: "Reply",
  proposalViewed: "Proposal viewed",
  decisionMaker: "New contact",
  closePushed: "Close pushed",
  unanswered: "No reply",
  championLeft: "Champion left",
};

export function companySummaryMap(deals: Deal[]) {
  const wins = companyWinMap(deals);
  const summaries = new Map<string, CompanySummary>();
  for (const deal of deals) {
    const summary = summaries.get(deal.companyId) ?? {
      openDeals: 0,
      pipelineValue: 0,
      win: wins.get(deal.companyId) ?? null,
      lastActivity: null,
      trend: Array.from({ length: TREND_WEEKS }, () => 0),
      events: [],
      stageValue: {},
    };
    if (isOpenStage(deal.stage)) {
      summary.openDeals += 1;
      summary.pipelineValue += deal.value;
      summary.stageValue[deal.stage] =
        (summary.stageValue[deal.stage] ?? 0) + deal.value;
    }
    for (const event of deal.activity) {
      summary.events.push({ date: event.date, type: event.type });
      if (
        summary.lastActivity === null ||
        event.date > summary.lastActivity.date
      ) {
        summary.lastActivity = {
          date: event.date,
          label: INTERACTION_LABELS[event.type],
        };
      }
      const week = Math.floor(daysSince(event.date) / 7);
      if (week < TREND_WEEKS) summary.trend[TREND_WEEKS - 1 - week] += 1;
    }
    summaries.set(deal.companyId, summary);
  }
  return summaries;
}

function inWindow(closeDate: string, closeWindow: CloseWindow) {
  if (closeWindow === "any") return true;
  const [year, month] = closeDate.split("-").map(Number);
  const [todayYear, todayMonth] = TODAY.split("-").map(Number);
  const quarter = Math.floor((month - 1) / 3);
  const todayQuarter = Math.floor((todayMonth - 1) / 3);
  if (closeWindow === "month") {
    return year === todayYear && month === todayMonth;
  }
  if (closeWindow === "quarter") {
    return year === todayYear && quarter === todayQuarter;
  }
  const nextIndex = todayQuarter + 1;
  return (
    year === todayYear + Math.floor(nextIndex / 4) && quarter === nextIndex % 4
  );
}

export function filterDeals(
  deals: Deal[],
  { owner, motion, closeWindow, region }: DealFilters,
) {
  return deals.filter(
    (deal) =>
      (owner === ALL_DEAL_OWNERS || deal.owner === owner) &&
      (motion === ANY_MOTION || deal.motion === motion) &&
      (region === ANY_REGION || deal.region === region) &&
      inWindow(deal.closeDate, closeWindow),
  );
}

function sortDeals(deals: Deal[], sortBy: DealSortKey) {
  return [...deals].sort((a, b) => {
    switch (sortBy) {
      case "closeDate":
        return a.closeDate.localeCompare(b.closeDate);
      case "winProbability":
        return dealWin(b) - dealWin(a);
      default:
        return b.value - a.value;
    }
  });
}

export function visibleDeals(deals: Deal[], filters: DealFilters) {
  return sortDeals(filterDeals(deals, filters), filters.sortBy);
}

export function dealsInStage(deals: Deal[], stage: DealStage) {
  return deals.filter((deal) => deal.stage === stage);
}

export function weightedTotal(deals: Deal[]) {
  return deals.reduce(
    (sum, deal) => sum + (deal.value * dealWin(deal)) / 100,
    0,
  );
}

export function weightedValue(deals: Deal[]) {
  return Math.round(weightedTotal(deals));
}

export function openDeals(deals: Deal[]) {
  return deals.filter((deal) => isOpenStage(deal.stage));
}

export function dealsCsvRows(
  deals: Deal[],
  companyName: (companyId: string) => string,
) {
  return [
    [
      "Deal",
      "Company",
      "Stage",
      "Region",
      "Owner",
      "Value",
      "Win Probability (%)",
      "Close Date",
      "Motion",
      "Next Step",
      "Days Since Activity",
    ],
    ...deals.map((deal) => [
      deal.name,
      companyName(deal.companyId),
      deal.stage,
      deal.region,
      deal.owner,
      deal.value,
      dealWin(deal),
      deal.closeDate,
      deal.motion,
      deal.nextStep,
      lastActivityDays(deal),
    ]),
  ];
}

export const DEAL_CALCULATIONS = [
  { value: "totalValue", label: "Total value" },
  { value: "weightedValue", label: "Weighted value" },
  { value: "avgWin", label: "Avg win probability" },
  { value: "avgValue", label: "Avg deal value" },
  { value: "largest", label: "Largest deal" },
  { value: "count", label: "Open deals" },
];

export function calculateDeals(kind: string, deals: Deal[]) {
  const open = openDeals(deals);
  const count = open.length;
  const total = open.reduce((sum, deal) => sum + deal.value, 0);
  const win = open.reduce((sum, deal) => sum + dealWin(deal), 0);

  switch (kind) {
    case "totalValue":
      return `$${formatMoney(total)}`;
    case "weightedValue":
      return `$${formatMoney(weightedValue(open))}`;
    case "avgWin":
      return `${count ? Math.round(win / count) : 0}%`;
    case "avgValue":
      return `$${formatMoney(count ? Math.round(total / count) : 0)}`;
    case "largest":
      return `$${formatMoney(Math.max(0, ...open.map((deal) => deal.value)))}`;
    case "count":
      return formatCount(count);
    default:
      return "";
  }
}
