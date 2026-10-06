import type { Company, SortKey } from "@/data/companies";
import type { DealActivityType, DealStage } from "@/data/deals";

export type CompanyFilters = {
  sortBy: SortKey;
  owner: string;
  stage: string;
  activityWindow: number;
};

export const TODAY = "2026-09-14";

export const TREND_WEEKS = 12;

export type CompanySummary = {
  openDeals: number;
  pipelineValue: number;
  win: number | null;
  lastActivity: { date: string; label: string } | null;
  trend: number[];
  events: { date: string; type: DealActivityType }[];
  stageValue: Partial<Record<DealStage, number>>;
};

export type CompanySummaries = ReadonlyMap<string, CompanySummary>;

export const EMPTY_SUMMARY: CompanySummary = {
  openDeals: 0,
  pipelineValue: 0,
  win: null,
  lastActivity: null,
  trend: Array.from({ length: TREND_WEEKS }, () => 0),
  events: [],
  stageValue: {},
};

export function summaryFor(summaries: CompanySummaries, companyId: string) {
  return summaries.get(companyId) ?? EMPTY_SUMMARY;
}

export const ALL_OWNERS = "all";
export const ANY_STAGE = "any";

export const DEFAULT_FILTERS: CompanyFilters = {
  sortBy: "pipelineValue",
  owner: ALL_OWNERS,
  stage: ANY_STAGE,
  activityWindow: 90,
};

export function activeFilterCount({
  owner,
  stage,
  activityWindow,
}: CompanyFilters) {
  return [
    owner !== DEFAULT_FILTERS.owner,
    stage !== DEFAULT_FILTERS.stage,
    activityWindow !== DEFAULT_FILTERS.activityWindow,
  ].filter(Boolean).length;
}

const TAG_CHAR_BUDGET = 20;

export function filterCompanies(
  companies: Company[],
  { sortBy, owner, stage, activityWindow }: CompanyFilters,
  summaries: CompanySummaries,
): Company[] {
  const filtered = companies.filter((company) => {
    if (owner !== ALL_OWNERS && company.owner !== owner) return false;
    if (stage !== ANY_STAGE && !company.tags.some((tag) => tag === stage)) {
      return false;
    }
    const last = summaryFor(summaries, company.id).lastActivity;
    return last === null || daysSince(last.date) <= activityWindow;
  });

  return filtered.sort((a, b) => {
    const left = summaryFor(summaries, a.id);
    const right = summaryFor(summaries, b.id);
    switch (sortBy) {
      case "name":
        return a.name.localeCompare(b.name);
      case "lastInteraction":
        return (right.lastActivity?.date ?? "").localeCompare(
          left.lastActivity?.date ?? "",
        );
      case "openDeals":
        return right.openDeals - left.openDeals;
      case "winProbability":
        if (left.win === null || right.win === null) {
          return Number(left.win === null) - Number(right.win === null);
        }
        return right.win - left.win;
      default:
        return right.pipelineValue - left.pipelineValue;
    }
  });
}

export function companiesCsvRows(
  companies: Company[],
  summaries: CompanySummaries,
) {
  return [
    [
      "Company",
      "Segment & Stage",
      "Account Owner",
      "Open Deals",
      "Pipeline Value",
      "Win Probability (%)",
      "Last Interaction Date",
      "Last Interaction",
    ],
    ...companies.map((company) => {
      const summary = summaryFor(summaries, company.id);
      return [
        company.name,
        company.tags.join("; "),
        company.owner,
        summary.openDeals,
        summary.pipelineValue,
        summary.win ?? "",
        summary.lastActivity?.date ?? "",
        summary.lastActivity?.label ?? "",
      ];
    }),
  ];
}

export function splitTags(tags: Company["tags"]) {
  let used = 0;
  const visible: Company["tags"] = [];

  for (const tag of tags) {
    if (visible.length === 2 || used + tag.length > TAG_CHAR_BUDGET) break;
    visible.push(tag);
    used += tag.length;
  }

  if (visible.length === 0 && tags.length > 0) visible.push(tags[0]);

  return { visible, hidden: tags.length - visible.length };
}

export const NO_CALCULATION = "none";

export const CALCULATIONS = [
  { value: "sumPipeline", label: "Sum of pipeline" },
  { value: "avgPipeline", label: "Avg pipeline value" },
  { value: "maxPipeline", label: "Largest pipeline" },
  { value: "sumDeals", label: "Total open deals" },
  { value: "avgWin", label: "Avg win probability" },
];

export function averageWin(companies: Company[], summaries: CompanySummaries) {
  const values = companies.flatMap(
    (item) => summaryFor(summaries, item.id).win ?? [],
  );
  return values.length
    ? Math.round(values.reduce((sum, value) => sum + value, 0) / values.length)
    : null;
}

export function calculate(
  kind: string,
  companies: Company[],
  summaries: CompanySummaries,
) {
  const count = companies.length;
  const rows = companies.map((item) => summaryFor(summaries, item.id));
  const pipeline = rows.reduce((sum, item) => sum + item.pipelineValue, 0);
  const deals = rows.reduce((sum, item) => sum + item.openDeals, 0);

  switch (kind) {
    case "sumPipeline":
      return `$${formatMoney(pipeline)}`;
    case "avgPipeline":
      return `$${formatMoney(count ? Math.round(pipeline / count) : 0)}`;
    case "maxPipeline":
      return `$${formatMoney(Math.max(0, ...rows.map((item) => item.pipelineValue)))}`;
    case "sumDeals":
      return formatCount(deals);
    case "avgWin": {
      const avg = averageWin(companies, summaries);
      return avg === null ? "—" : `${avg}%`;
    }
    default:
      return "";
  }
}

export function activityStats(summary: CompanySummary, range: string) {
  const days = Number(range.match(/\d+/)?.[0] ?? 30);
  const inRange = summary.events.filter(
    (event) => daysSince(event.date) < days,
  );
  const count = (...types: DealActivityType[]) =>
    inRange.filter((event) => types.includes(event.type)).length;
  const emails = count("reply", "unanswered");
  const meetings = count("meeting");
  return {
    total: inRange.length,
    touches: count("reply", "meeting", "proposalViewed", "decisionMaker"),
    emails,
    meetings,
    calls: inRange.length - emails - meetings,
  };
}

export function formatDate(iso: string) {
  const [, month, day] = iso.split("-").map(Number);
  const names = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sept",
    "Oct",
    "Nov",
    "Dec",
  ];
  return `${names[month - 1]} ${day}`;
}

export function formatMoney(value: number) {
  return value.toLocaleString("en-US");
}

export function formatCount(value: number) {
  return value.toLocaleString("en-US");
}

export function daysSince(iso: string) {
  const day = 24 * 60 * 60 * 1000;
  return Math.max(0, Math.round((Date.parse(TODAY) - Date.parse(iso)) / day));
}
