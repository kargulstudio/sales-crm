import type { TagTone } from "@/data/companies";
import type { Deal, DealActivityType } from "@/data/deals";
import { TODAY, daysSince, formatCount, formatDate } from "@/lib/companies";
import {
  ACTIVITY_EFFECTS,
  dealWinBreakdown,
  isOpenStage,
  isStale,
} from "@/lib/deals";

export type ActivityEvent = {
  id: string;
  type: DealActivityType;
  date: string;
  note?: string;
  dealId: string;
  dealName: string;
  companyId: string;
  owner: string;
  delta: number;
  counted: boolean;
  capped: boolean;
};

export const ACTIVITY_TONES: Record<DealActivityType, TagTone> = {
  meeting: "green",
  reply: "green",
  proposalViewed: "green",
  decisionMaker: "green",
  closePushed: "amber",
  unanswered: "amber",
  championLeft: "red",
};

export const ACTIVITY_CHANNELS: Record<DealActivityType, string> = {
  reply: "Email",
  unanswered: "Email",
  meeting: "Meeting",
  proposalViewed: "Proposal",
  decisionMaker: "People",
  championLeft: "People",
  closePushed: "Timeline",
};

export const TIMELINE_PAGE_SIZE = 100;

export const ACTIVITY_WINDOW_OPTIONS = [
  { value: "1", label: "Today" },
  { value: "7", label: "Last 7 days" },
  { value: "30", label: "Last 30 days" },
  { value: "90", label: "Last 90 days" },
];

export type ActivityFilters = {
  type: string;
  owner: string;
  company: string;
  window: string;
};

export const ANY_ACTIVITY_TYPE = "any";
export const ALL_ACTIVITY_OWNERS = "all";
export const ALL_ACTIVITY_COMPANIES = "all";

export const DEFAULT_ACTIVITY_FILTERS: ActivityFilters = {
  type: ANY_ACTIVITY_TYPE,
  owner: ALL_ACTIVITY_OWNERS,
  company: ALL_ACTIVITY_COMPANIES,
  window: "30",
};

export function activityActiveFilterCount({
  type,
  owner,
  company,
  window,
}: ActivityFilters) {
  return [
    type !== DEFAULT_ACTIVITY_FILTERS.type,
    owner !== DEFAULT_ACTIVITY_FILTERS.owner,
    company !== DEFAULT_ACTIVITY_FILTERS.company,
    window !== DEFAULT_ACTIVITY_FILTERS.window,
  ].filter(Boolean).length;
}

export function formatDelta(delta: number) {
  if (delta > 0) return `+${delta}`;
  if (delta < 0) return `−${Math.abs(delta)}`;
  return "0";
}

export function flattenActivities(deals: Deal[]) {
  const rows: { event: ActivityEvent; seq: number }[] = [];
  let seq = 0;
  for (const deal of deals) {
    const adjustments = new Map(
      dealWinBreakdown(deal).adjustments.map((item) => [item.key, item.delta]),
    );
    for (const event of deal.activity) {
      const delta = adjustments.get(event.id) ?? 0;
      rows.push({
        seq: seq++,
        event: {
          id: event.id,
          type: event.type,
          date: event.date,
          note: event.note,
          dealId: deal.id,
          dealName: deal.name,
          companyId: deal.companyId,
          owner: deal.owner,
          delta,
          counted: adjustments.has(event.id) && delta !== 0,
          capped: adjustments.has(event.id) && delta === 0,
        },
      });
    }
  }
  return rows
    .sort((a, b) => b.event.date.localeCompare(a.event.date) || b.seq - a.seq)
    .map((row) => row.event);
}

export function filterActivities(
  events: ActivityEvent[],
  { type, owner, company, window }: ActivityFilters,
) {
  const days = Number(window);
  return events.filter(
    (event) =>
      (type === ANY_ACTIVITY_TYPE || event.type === type) &&
      (owner === ALL_ACTIVITY_OWNERS || event.owner === owner) &&
      (company === ALL_ACTIVITY_COMPANIES || event.companyId === company) &&
      daysSince(event.date) < days,
  );
}

const WEEKDAYS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

function dayLabel(date: string) {
  const age = daysSince(date);
  if (age === 0) return "Today";
  if (age === 1) return "Yesterday";
  if (age < 7) return WEEKDAYS[new Date(`${date}T00:00:00Z`).getUTCDay()];
  return formatDate(date);
}

export function groupByDay(events: ActivityEvent[]) {
  const groups: { date: string; label: string; events: ActivityEvent[] }[] = [];
  for (const event of events) {
    const last = groups[groups.length - 1];
    if (last && last.date === event.date) {
      last.events.push(event);
    } else {
      groups.push({
        date: event.date,
        label: dayLabel(event.date),
        events: [event],
      });
    }
  }
  return groups;
}

export function loggedToday(events: ActivityEvent[]) {
  return events.filter((event) => event.date === TODAY).length;
}

export function activitiesCsvRows(
  events: ActivityEvent[],
  companyName: (companyId: string) => string,
) {
  return [
    ["Date", "Type", "Effect", "Deal", "Company", "Owner", "Note"],
    ...events.map((event) => [
      event.date,
      ACTIVITY_EFFECTS[event.type].label,
      event.delta,
      event.dealName,
      companyName(event.companyId),
      event.owner,
      event.note ?? "",
    ]),
  ];
}

export const ACTIVITY_CALCULATIONS = [
  { value: "positive", label: "Positive signals" },
  { value: "negative", label: "Negative signals" },
  { value: "touched", label: "Deals touched" },
  { value: "counted", label: "Counting toward win" },
  { value: "net", label: "Net win effect" },
  { value: "meetings", label: "Meetings booked" },
];

export function calculateActivities(kind: string, events: ActivityEvent[]) {
  switch (kind) {
    case "positive":
      return formatCount(
        events.filter((event) => ACTIVITY_EFFECTS[event.type].delta > 0).length,
      );
    case "negative":
      return formatCount(
        events.filter((event) => ACTIVITY_EFFECTS[event.type].delta < 0).length,
      );
    case "touched":
      return formatCount(new Set(events.map((event) => event.dealId)).size);
    case "counted":
      return formatCount(events.filter((event) => event.delta !== 0).length);
    case "net":
      return formatDelta(events.reduce((sum, event) => sum + event.delta, 0));
    case "meetings":
      return formatCount(
        events.filter((event) => event.type === "meeting").length,
      );
    default:
      return "";
  }
}

export const CLOSING_SOON_DAYS = 7;
export const QUIET_DAYS = 7;

export type AttentionReason = "pastClose" | "stale" | "closingSoon";

export const ATTENTION_REASONS: Record<
  AttentionReason,
  { label: string; tone: TagTone; rank: number }
> = {
  pastClose: { label: "Past close date", tone: "red", rank: 0 },
  stale: { label: "Stale", tone: "amber", rank: 1 },
  closingSoon: { label: "Closing soon", tone: "orange", rank: 2 },
};

function daysUntil(iso: string) {
  const day = 24 * 60 * 60 * 1000;
  return Math.round((Date.parse(iso) - Date.parse(TODAY)) / day);
}

function attentionReason(deal: Deal): AttentionReason | null {
  if (!isOpenStage(deal.stage)) return null;
  if (deal.closeDate < TODAY) return "pastClose";
  if (isStale(deal)) return "stale";
  const quiet = deal.activity.every(
    (event) => daysSince(event.date) >= QUIET_DAYS,
  );
  if (daysUntil(deal.closeDate) <= CLOSING_SOON_DAYS && quiet) {
    return "closingSoon";
  }
  return null;
}

export function needsAttention(deals: Deal[]) {
  const items: { deal: Deal; reason: AttentionReason }[] = [];
  for (const deal of deals) {
    const reason = attentionReason(deal);
    if (reason) items.push({ deal, reason });
  }
  return items.sort(
    (a, b) =>
      ATTENTION_REASONS[a.reason].rank - ATTENTION_REASONS[b.reason].rank ||
      a.deal.closeDate.localeCompare(b.deal.closeDate),
  );
}
