import type { Company } from "@/data/companies";

export type Note = {
  id: string;
  companyId: string;
  body: string;
  author: string;
  at: string;
};

export type Change = {
  id: string;
  companyId: string;
  text: string;
  author: string;
  at: string;
};

export type TimelineKind = "email" | "meeting" | "call" | "change" | "note";

export type TimelineEntry = {
  id: string;
  kind: TimelineKind;
  title: string;
  detail?: string;
  author: string;
  at: string;
};

const SEEDED: { kind: TimelineKind; title: string; detail: string }[] = [
  {
    kind: "email",
    title: "Sent follow-up email",
    detail: "Shared the recap and proposed next steps.",
  },
  {
    kind: "call",
    title: "Discovery call",
    detail: "Walked through current tooling and pain points.",
  },
  {
    kind: "meeting",
    title: "Stakeholder meeting",
    detail: "Aligned on success criteria with the buying committee.",
  },
  {
    kind: "email",
    title: "Sent pricing overview",
    detail: "Included volume tiers and annual billing options.",
  },
  {
    kind: "call",
    title: "Check-in call",
    detail: "Confirmed timeline and open questions from legal.",
  },
];

const DAY = 24 * 60 * 60 * 1000;

function hash(value: string) {
  let result = 0;
  for (const char of value) result = (result * 31 + char.charCodeAt(0)) >>> 0;
  return result;
}

export function seededTimeline(company: Company): TimelineEntry[] {
  const start = hash(company.id);
  const count = Math.min(SEEDED.length, 2 + (company.openDeals % 4));
  const last = Date.parse(`${company.lastInteraction.date}T15:00:00Z`);

  const entries: TimelineEntry[] = [
    {
      id: `${company.id}-last`,
      kind: "meeting",
      title: company.lastInteraction.label,
      detail: "Most recent touchpoint with the account.",
      author: company.owner,
      at: new Date(last).toISOString(),
    },
  ];

  for (let i = 0; i < count; i++) {
    const item = SEEDED[(start + i) % SEEDED.length];
    const gap = 2 + ((start >> (i + 1)) % 6);
    entries.push({
      id: `${company.id}-seed-${i}`,
      ...item,
      author: company.owner,
      at: new Date(last - (i + 1) * gap * DAY).toISOString(),
    });
  }

  return entries;
}

export function buildTimeline(
  company: Company,
  notes: Note[],
  changes: Change[],
): TimelineEntry[] {
  return [
    ...seededTimeline(company),
    ...changes
      .filter((change) => change.companyId === company.id)
      .map((change) => ({
        id: change.id,
        kind: "change" as const,
        title: change.text,
        author: change.author,
        at: change.at,
      })),
    ...notes
      .filter((note) => note.companyId === company.id)
      .map((note) => ({
        id: note.id,
        kind: "note" as const,
        title: "Added a note",
        detail: note.body,
        author: note.author,
        at: note.at,
      })),
  ].sort((a, b) => b.at.localeCompare(a.at));
}

const DATE_FORMAT = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
});

const TIME_FORMAT = new Intl.DateTimeFormat("en-US", {
  hour: "numeric",
  minute: "2-digit",
});

export function formatTimestamp(iso: string) {
  const date = new Date(iso);
  return `${DATE_FORMAT.format(date)}, ${TIME_FORMAT.format(date)}`;
}

export function newId(prefix: string) {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}
