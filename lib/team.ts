import { OWNERS, type Owner } from "@/data/companies";
import type { Deal } from "@/data/deals";
import { QUOTAS } from "@/data/forecast";
import {
  MEETINGS_TARGET,
  TEAM_SORT_OPTIONS,
  type Team,
  type TeamSortKey,
} from "@/data/team";
import { formatMoney } from "@/lib/companies";
import { dealWin, isOpenStage, isStale, lastActivityDate } from "@/lib/deals";
import {
  buildRollup,
  dealsInQuarter,
  formatCoverage,
  quarterById,
  teamTotals,
  type Rollup,
} from "@/lib/forecast";

export function isSdrTeam(team: Team) {
  return team === "SDR Team";
}

export function defaultTeamSort(team: Team): TeamSortKey {
  return TEAM_SORT_OPTIONS[team][0].value;
}

export function resolveTeamSort(team: Team, sortBy: TeamSortKey): TeamSortKey {
  return TEAM_SORT_OPTIONS[team].some((option) => option.value === sortBy)
    ? sortBy
    : defaultTeamSort(team);
}

export function teamRoster(team: Team): Owner[] {
  return OWNERS.filter((owner) => owner.team === team);
}

export type TeamMember = {
  owner: Owner;
  rollup: Rollup;
  attainment: number | null;
  open: Deal[];
  openDeals: number;
  openPipeline: number;
  avgWin: number | null;
  stale: number;
  lastActivity: string | null;
  meetings: number;
  meetingAttainment: number;
};

export function averageOpenWin(open: Deal[]) {
  if (open.length === 0) return null;
  const value = open.reduce((sum, deal) => sum + deal.value, 0);
  if (value > 0) {
    return Math.round(
      open.reduce((sum, deal) => sum + deal.value * dealWin(deal), 0) / value,
    );
  }
  return Math.round(
    open.reduce((sum, deal) => sum + dealWin(deal), 0) / open.length,
  );
}

function percentOf(part: number, whole: number) {
  return whole > 0 ? Math.round((part / whole) * 100) : 0;
}

export function teamMembers(
  deals: Deal[],
  team: Team,
  period: string,
): TeamMember[] {
  const { start, end } = quarterById(period);
  const inQuarter = dealsInQuarter(deals, period);
  return teamRoster(team).map((owner) => {
    const owned = deals.filter((deal) => deal.owner === owner.name);
    const open = owned.filter((deal) => isOpenStage(deal.stage));
    const quota = QUOTAS[period]?.[owner.name] ?? 0;
    const rollup = buildRollup(
      owner.name,
      quota,
      inQuarter.filter((deal) => deal.owner === owner.name),
    );
    const events = owned.flatMap((deal) => deal.activity);
    const meetings = events.filter(
      (event) =>
        event.type === "meeting" && event.date >= start && event.date <= end,
    ).length;
    const dates = owned.map(lastActivityDate);
    return {
      owner,
      rollup,
      attainment: quota > 0 ? rollup.attainment : null,
      open,
      openDeals: open.length,
      openPipeline: open.reduce((sum, deal) => sum + deal.value, 0),
      avgWin: averageOpenWin(open),
      stale: open.filter(isStale).length,
      lastActivity: dates.length
        ? dates.reduce((a, b) => (b > a ? b : a))
        : null,
      meetings,
      meetingAttainment: percentOf(meetings, MEETINGS_TARGET),
    };
  });
}

export type TeamSummary = {
  rollup: Rollup;
  attainment: number | null;
  openDeals: number;
  openPipeline: number;
  avgWin: number | null;
  stale: number;
  meetings: number;
  target: number;
  meetingAttainment: number;
};

export function teamSummary(members: TeamMember[]): TeamSummary {
  const rollup = teamTotals(
    members
      .filter((member) => member.rollup.quota > 0)
      .map((member) => member.rollup),
  );
  const meetings = members.reduce((sum, member) => sum + member.meetings, 0);
  const target = members.length * MEETINGS_TARGET;
  return {
    rollup,
    attainment: rollup.quota > 0 ? rollup.attainment : null,
    openDeals: members.reduce((sum, member) => sum + member.openDeals, 0),
    openPipeline: members.reduce((sum, member) => sum + member.openPipeline, 0),
    avgWin: averageOpenWin(members.flatMap((member) => member.open)),
    stale: members.reduce((sum, member) => sum + member.stale, 0),
    meetings,
    target,
    meetingAttainment: percentOf(meetings, target),
  };
}

export function sortTeamMembers(
  members: TeamMember[],
  team: Team,
  sortBy: TeamSortKey,
) {
  const key = resolveTeamSort(team, sortBy);
  return [...members].sort((a, b) => {
    switch (key) {
      case "attainment":
        return (
          (b.attainment ?? -1) - (a.attainment ?? -1) ||
          b.rollup.closed - a.rollup.closed ||
          a.owner.name.localeCompare(b.owner.name)
        );
      case "closed":
        return (
          b.rollup.closed - a.rollup.closed ||
          a.owner.name.localeCompare(b.owner.name)
        );
      case "pipeline":
        return (
          b.openPipeline - a.openPipeline ||
          a.owner.name.localeCompare(b.owner.name)
        );
      case "meetings":
        return (
          b.meetings - a.meetings || a.owner.name.localeCompare(b.owner.name)
        );
      default:
        return a.owner.name.localeCompare(b.owner.name);
    }
  });
}

export function formatTeamCoverage(summary: TeamSummary) {
  return summary.rollup.quota > 0 ? formatCoverage(summary.rollup) : "—";
}

export function formatAttainment(attainment: number | null) {
  return attainment === null ? "—" : `${attainment}%`;
}

export function teamCsvRows(members: TeamMember[], team: Team, period: string) {
  if (isSdrTeam(team)) {
    return [
      [
        "Rep",
        "Role",
        "Quarter",
        "Meetings",
        "Target",
        "Meetings Attainment (%)",
        "Open Deals",
        "Open Pipeline",
        "Avg Win (%)",
        "Last Activity",
      ],
      ...members.map((member) => [
        member.owner.name,
        member.owner.role,
        quarterById(period).label,
        member.meetings,
        MEETINGS_TARGET,
        member.meetingAttainment,
        member.openDeals,
        member.openPipeline,
        member.avgWin ?? "",
        member.lastActivity ?? "",
      ]),
    ];
  }
  return [
    [
      "Rep",
      "Role",
      "Quarter",
      "Quota",
      "Closed",
      "Attainment (%)",
      "Commit",
      "Open Pipeline",
      "Open Deals",
      "Avg Win (%)",
      "Stale Deals",
      "Last Activity",
    ],
    ...members.map((member) => [
      member.owner.name,
      member.owner.role,
      quarterById(period).label,
      member.rollup.quota,
      member.rollup.closed,
      member.attainment ?? "",
      member.rollup.commit,
      member.openPipeline,
      member.openDeals,
      member.avgWin ?? "",
      member.stale,
      member.lastActivity ?? "",
    ]),
  ];
}

export const TEAM_CALCULATIONS: Record<
  "ae" | "sdr",
  { value: string; label: string }[]
> = {
  ae: [
    { value: "quota", label: "Team quota" },
    { value: "closed", label: "Closed won" },
    { value: "attainment", label: "Attainment" },
    { value: "commit", label: "Commit" },
    { value: "coverage", label: "Coverage" },
    { value: "pipeline", label: "Open pipeline" },
    { value: "openDeals", label: "Open deals" },
    { value: "avgWin", label: "Avg win probability" },
    { value: "stale", label: "Stale deals" },
  ],
  sdr: [
    { value: "meetings", label: "Meetings booked" },
    { value: "target", label: "Meetings target" },
    { value: "attainment", label: "Attainment" },
    { value: "pipeline", label: "Open pipeline" },
    { value: "openDeals", label: "Open deals" },
    { value: "avgWin", label: "Avg win probability" },
  ],
};

export function calculateTeam(
  kind: string,
  summary: TeamSummary,
  sdr: boolean,
) {
  switch (kind) {
    case "quota":
      return `$${formatMoney(summary.rollup.quota)}`;
    case "closed":
      return `$${formatMoney(summary.rollup.closed)}`;
    case "commit":
      return `$${formatMoney(summary.rollup.commit)}`;
    case "pipeline":
      return `$${formatMoney(summary.openPipeline)}`;
    case "coverage":
      return formatTeamCoverage(summary);
    case "attainment":
      return formatAttainment(
        sdr ? summary.meetingAttainment : summary.attainment,
      );
    case "openDeals":
      return String(summary.openDeals);
    case "avgWin":
      return summary.avgWin === null ? "—" : `${summary.avgWin}%`;
    case "stale":
      return String(summary.stale);
    case "meetings":
      return String(summary.meetings);
    case "target":
      return String(summary.target);
    default:
      return "";
  }
}
