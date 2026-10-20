import {
  SCORE_CARDS,
  type Company,
  type SortKey,
  type TREND_WINDOWS,
} from "@/data/companies";

export type SortDir = "asc" | "desc";

export const VIEWS = [
  { value: "all", label: "All", test: () => true },
  { value: "hot", label: "Hot", test: (c: Company) => c.winProbability >= 70 },
  {
    value: "at-risk",
    label: "At risk",
    test: (c: Company) => c.winProbability < 30,
  },
  { value: "stale", label: "Stale", test: (c: Company) => c.activityDays > 30 },
] as const;

export type View = (typeof VIEWS)[number]["value"];

export type CompanyFilters = {
  sortBy: SortKey;
  sortDir: SortDir;
  owner: string;
  stage: string;
  activityWindow: number;
  view: View;
};

export function defaultSortDir(key: SortKey): SortDir {
  return key === "name" ? "asc" : "desc";
}

export function pickFilters(state: CompanyFilters): CompanyFilters {
  const { sortBy, sortDir, owner, stage, activityWindow, view } = state;
  return { sortBy, sortDir, owner, stage, activityWindow, view };
}

export const TODAY = "2026-09-14";

export const ALL_OWNERS = "all";
export const ANY_STAGE = "any";

export const DEFAULT_FILTERS: CompanyFilters = {
  sortBy: "pipelineValue",
  sortDir: "desc",
  owner: ALL_OWNERS,
  stage: ANY_STAGE,
  activityWindow: 90,
  view: "all",
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
  { sortBy, sortDir, owner, stage, activityWindow, view }: CompanyFilters,
): Company[] {
  const inView =
    VIEWS.find((item) => item.value === view)?.test ?? (() => true);
  const filtered = companies.filter((company) => {
    if (!inView(company)) return false;
    if (owner !== ALL_OWNERS && company.owner !== owner) return false;
    if (stage !== ANY_STAGE && !company.tags.some((tag) => tag === stage)) {
      return false;
    }
    return company.activityDays <= activityWindow;
  });

  const direction = sortDir === "asc" ? 1 : -1;
  return filtered.sort((a, b) => {
    switch (sortBy) {
      case "name":
        return a.name.localeCompare(b.name) * direction;
      case "lastInteraction":
        return (
          a.lastInteraction.date.localeCompare(b.lastInteraction.date) *
          direction
        );
      case "openDeals":
        return (a.openDeals - b.openDeals) * direction;
      case "winProbability":
        return (a.winProbability - b.winProbability) * direction;
      default:
        return (a.pipelineValue - b.pipelineValue) * direction;
    }
  });
}

export function companiesCsvRows(companies: Company[]) {
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
      "Website",
    ],
    ...companies.map((company) => [
      company.name,
      company.tags.join("; "),
      company.owner,
      company.openDeals,
      company.pipelineValue,
      company.winProbability,
      company.lastInteraction.date,
      company.lastInteraction.label,
      company.domain ?? "",
    ]),
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

export function companyHealth(company: Company) {
  return {
    discovery: Math.round(company.winProbability * 0.372),
    evaluation: Math.round(company.winProbability * 0.651),
    procurement: Math.round(company.winProbability * 0.372),
  };
}

export type TrendWindow = (typeof TREND_WINDOWS)[number];

const WINDOW_SCALE: Record<TrendWindow, number> = {
  "Last 7 Days": 0.25,
  "Last 30 Days": 1,
  "Last 90 Days": 3,
};

export function companyActivity(
  company: Company,
  window: TrendWindow = "Last 30 Days",
) {
  const deals = company.openDeals;
  const scale = WINDOW_SCALE[window];
  const scaled = (value: number) => Math.round(value * scale);
  return {
    total: scaled(deals * 15),
    touches: scaled(deals * 4),
    emails: scaled(deals + 4),
    meetings: scaled(Math.ceil(deals / 2)),
    calls: scaled(deals + 1),
  };
}

export function trendForWindow(trend: number[], window: TrendWindow) {
  if (window === "Last 7 Days") return trend.slice(-7);
  if (window === "Last 30 Days") return trend;
  // Three rotated copies averaged per point stand in for a longer, smoother history.
  return trend.map((_, index) => {
    const at = (offset: number) => trend[(index + offset) % trend.length];
    return (at(0) + at(5) + at(9)) / 3;
  });
}

function verdictFor(stars: number) {
  if (stars >= 4) return "High potential";
  if (stars === 3) return "Needs work";
  return "At risk";
}

const WINDOW_STAR_SHIFT: Record<TrendWindow, number[]> = {
  "Last 7 Days": [0, 1, -1],
  "Last 30 Days": [0, 0, 0],
  "Last 90 Days": [-1, 0, 0],
};

const WINDOW_UPDATED: Record<TrendWindow, string> = {
  "Last 7 Days": "Updated 2h ago",
  "Last 30 Days": "Updated 3d ago",
  "Last 90 Days": "Updated 6w ago",
};

export function scoreCardsFor(company: Company, window: TrendWindow) {
  const momentum =
    company.winProbability >= 70 ? 1 : company.winProbability < 30 ? -1 : 0;
  return SCORE_CARDS.map((card, index) => {
    const stars = Math.min(
      5,
      Math.max(1, card.stars + momentum + WINDOW_STAR_SHIFT[window][index]),
    );
    return {
      ...card,
      stars,
      verdict: verdictFor(stars),
      updated: WINDOW_UPDATED[window],
    };
  });
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
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  return `${names[month - 1]} ${day}`;
}

const DOMAIN_PATTERN = /^[a-z0-9-]+(\.[a-z0-9-]+)+$/;

export function normalizeDomain(input: string): string | null {
  const host = input
    .trim()
    .toLowerCase()
    .replace(/^[a-z]+:\/\//, "")
    .replace(/^www\./, "")
    .split(/[/?#:]/)[0];
  return DOMAIN_PATTERN.test(host) ? host : null;
}

export function faviconUrl(domain: string, size = 64) {
  return `/api/logo?domain=${encodeURIComponent(domain)}&sz=${size}`;
}

export function companyLogoSrc(company: Pick<Company, "logo" | "domain">) {
  if (company.logo) return company.logo;
  return company.domain ? faviconUrl(company.domain) : undefined;
}

export function formatMoney(value: number) {
  return value.toLocaleString("en-US");
}

export function daysSince(iso: string) {
  const day = 24 * 60 * 60 * 1000;
  return Math.max(0, Math.round((Date.parse(TODAY) - Date.parse(iso)) / day));
}
