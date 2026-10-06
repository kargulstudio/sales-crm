import type { TagTone } from "@/data/companies";
import type { Contact } from "@/data/contacts";
import type { Deal } from "@/data/deals";
import type {
  Enrollment,
  EnrollmentStatus,
  Sequence,
  SequenceChannel,
  SequenceStatus,
} from "@/data/sequences";
import { formatCount } from "@/lib/companies";
import { contactSummaryFor, type ContactSummaries } from "@/lib/contacts";
import { slugify } from "@/lib/utils";

export const SEQUENCE_STATUS_TONES: Record<SequenceStatus, TagTone> = {
  Active: "green",
  Paused: "amber",
  Draft: "neutral",
};

export const ENROLLMENT_STATUS_TONES: Record<EnrollmentStatus, TagTone> = {
  Active: "blue",
  Replied: "green",
  "Meeting booked": "purple",
  Finished: "neutral",
  Bounced: "red",
  Unsubscribed: "orange",
};

export const SEQUENCE_SORT_OPTIONS = [
  { value: "replyRate", label: "Reply rate" },
  { value: "enrolled", label: "Enrolled" },
  { value: "name", label: "Name" },
  { value: "lastSent", label: "Last sent" },
] as const;

export type SequenceSortKey = (typeof SEQUENCE_SORT_OPTIONS)[number]["value"];

export type SequenceFilters = {
  sortBy: SequenceSortKey;
  status: string;
  owner: string;
};

export const ANY_SEQUENCE_STATUS = "any";
export const ALL_SEQUENCE_OWNERS = "all";

export const DEFAULT_SEQUENCE_FILTERS: SequenceFilters = {
  sortBy: "replyRate",
  status: ANY_SEQUENCE_STATUS,
  owner: ALL_SEQUENCE_OWNERS,
};

export function sequenceActiveFilterCount({ status, owner }: SequenceFilters) {
  return [
    status !== DEFAULT_SEQUENCE_FILTERS.status,
    owner !== DEFAULT_SEQUENCE_FILTERS.owner,
  ].filter(Boolean).length;
}

export const CHANNEL_NOUNS: Record<
  SequenceChannel,
  { sent: string; opened: string; replied: string }
> = {
  Email: { sent: "Sent", opened: "Opened", replied: "Replied" },
  "Call task": { sent: "Done", opened: "Connected", replied: "Replied" },
  "LinkedIn task": { sent: "Done", opened: "Accepted", replied: "Replied" },
};

export type SequenceStats = {
  enrolled: number;
  active: number;
  openRate: number | null;
  replyRate: number | null;
  emailSent: number;
  meetings: number;
  lastSent: string | null;
};

export type SequenceStatsMap = ReadonlyMap<string, SequenceStats>;

export const EMPTY_SEQUENCE_STATS: SequenceStats = {
  enrolled: 0,
  active: 0,
  openRate: null,
  replyRate: null,
  emailSent: 0,
  meetings: 0,
  lastSent: null,
};

export function statsFor(stats: SequenceStatsMap, sequenceId: string) {
  return stats.get(sequenceId) ?? EMPTY_SEQUENCE_STATS;
}

function hasReplied(enrollment: Enrollment) {
  return (
    enrollment.status === "Replied" || enrollment.status === "Meeting booked"
  );
}

export function displayStatus(
  sequence: Sequence,
  enrollment: Enrollment,
): { label: EnrollmentStatus | "Paused"; tone: TagTone } {
  if (sequence.status === "Paused" && enrollment.status === "Active") {
    return { label: "Paused", tone: "amber" };
  }
  return {
    label: enrollment.status,
    tone: ENROLLMENT_STATUS_TONES[enrollment.status],
  };
}

function sequenceStats(sequence: Sequence): SequenceStats {
  const enrolled = sequence.enrollments.length;
  const emailSteps = sequence.steps.filter((step) => step.channel === "Email");
  const sent = emailSteps.reduce((sum, step) => sum + step.sent, 0);
  const opened = emailSteps.reduce((sum, step) => sum + step.opened, 0);
  const replied = sequence.enrollments.filter(hasReplied).length;
  const lastSent = sequence.enrollments.reduce<string | null>(
    (newest, enrollment) =>
      enrollment.lastStepAt &&
      (newest === null || enrollment.lastStepAt > newest)
        ? enrollment.lastStepAt
        : newest,
    null,
  );

  return {
    enrolled,
    active:
      sequence.status === "Active"
        ? sequence.enrollments.filter(
            (enrollment) => enrollment.status === "Active",
          ).length
        : 0,
    openRate: sent > 0 ? Math.round((opened / sent) * 100) : null,
    replyRate: enrolled > 0 ? Math.round((replied / enrolled) * 100) : null,
    emailSent: sent,
    meetings: sequence.enrollments.filter(
      (enrollment) => enrollment.status === "Meeting booked",
    ).length,
    lastSent,
  };
}

export function sequenceStatsMap(sequences: Sequence[]) {
  return new Map(
    sequences.map((sequence) => [sequence.id, sequenceStats(sequence)]),
  );
}

export function activeSequenceCount(sequences: Sequence[]) {
  return sequences.filter((sequence) => sequence.status === "Active").length;
}

export function filterSequences(
  sequences: Sequence[],
  { sortBy, status, owner }: SequenceFilters,
  stats: SequenceStatsMap,
) {
  const filtered = sequences.filter(
    (sequence) =>
      (status === ANY_SEQUENCE_STATUS || sequence.status === status) &&
      (owner === ALL_SEQUENCE_OWNERS || sequence.owner === owner),
  );

  return filtered.sort((a, b) => {
    const left = statsFor(stats, a.id);
    const right = statsFor(stats, b.id);
    switch (sortBy) {
      case "enrolled":
        return right.enrolled - left.enrolled || a.name.localeCompare(b.name);
      case "name":
        return a.name.localeCompare(b.name);
      case "lastSent":
        return (
          (right.lastSent ?? "").localeCompare(left.lastSent ?? "") ||
          a.name.localeCompare(b.name)
        );
      default:
        return (
          (right.replyRate ?? -1) - (left.replyRate ?? -1) ||
          a.name.localeCompare(b.name)
        );
    }
  });
}

export function formatRate(rate: number | null) {
  return rate === null ? "—" : `${rate}%`;
}

export function stepCountLabel(count: number) {
  return `${count} ${count === 1 ? "step" : "steps"}`;
}

export function enrollmentProgress(sequence: Sequence, enrollment: Enrollment) {
  return `${enrollment.currentStep} of ${sequence.steps.length}`;
}

export function canActivate(sequence: Sequence) {
  return sequence.steps.length > 0;
}

export function sequencesCsvRows(
  sequences: Sequence[],
  stats: SequenceStatsMap,
) {
  return [
    [
      "Sequence",
      "Owner",
      "Status",
      "Steps",
      "Enrolled",
      "Active",
      "Open Rate (%)",
      "Reply Rate (%)",
      "Meetings Booked",
      "Last Sent",
    ],
    ...sequences.map((sequence) => {
      const item = statsFor(stats, sequence.id);
      return [
        sequence.name,
        sequence.owner,
        sequence.status,
        sequence.steps.length,
        item.enrolled,
        item.active,
        item.openRate ?? "",
        item.replyRate ?? "",
        item.meetings,
        item.lastSent ?? "",
      ];
    }),
  ];
}

export const SEQUENCE_CALCULATIONS = [
  { value: "totalEnrolled", label: "Total enrolled" },
  { value: "avgReply", label: "Avg reply rate" },
  { value: "meetings", label: "Meetings booked" },
  { value: "avgOpen", label: "Avg open rate" },
  { value: "activeNow", label: "Active enrollments" },
];

function weightedRate(items: { rate: number | null; weight: number }[]) {
  const rated = items.filter(
    (item): item is { rate: number; weight: number } =>
      item.rate !== null && item.weight > 0,
  );
  const total = rated.reduce((sum, item) => sum + item.weight, 0);
  return total > 0
    ? Math.round(
        rated.reduce((sum, item) => sum + item.rate * item.weight, 0) / total,
      )
    : null;
}

export function calculateSequences(
  kind: string,
  sequences: Sequence[],
  stats: SequenceStatsMap,
) {
  const rows = sequences.map((sequence) => statsFor(stats, sequence.id));

  switch (kind) {
    case "totalEnrolled":
      return formatCount(rows.reduce((sum, row) => sum + row.enrolled, 0));
    case "avgReply":
      return formatRate(
        weightedRate(
          rows.map((row) => ({ rate: row.replyRate, weight: row.enrolled })),
        ),
      );
    case "meetings":
      return formatCount(rows.reduce((sum, row) => sum + row.meetings, 0));
    case "avgOpen":
      return formatRate(
        weightedRate(
          rows.map((row) => ({ rate: row.openRate, weight: row.emailSent })),
        ),
      );
    case "activeNow":
      return formatCount(rows.reduce((sum, row) => sum + row.active, 0));
    default:
      return "";
  }
}

export function enrollableContacts(
  sequence: Sequence,
  contacts: Contact[],
  summaries: ContactSummaries,
) {
  const enrolled = new Set(
    sequence.enrollments.map((enrollment) => enrollment.contactId),
  );
  return contacts.filter(
    (contact) =>
      !enrolled.has(contact.id) &&
      !contactSummaryFor(summaries, contact.id).left,
  );
}

export function contactEnrollments(contactId: string, sequences: Sequence[]) {
  return sequences.flatMap((sequence) =>
    sequence.enrollments
      .filter((enrollment) => enrollment.contactId === contactId)
      .map((enrollment) => ({ sequence, enrollment })),
  );
}

export function sequenceDeal(enrollment: Enrollment, deals: Deal[]) {
  return enrollment.dealId
    ? deals.find((deal) => deal.id === enrollment.dealId)
    : undefined;
}

export function hasLoggedEvent(
  deal: Deal,
  type: "reply" | "meeting",
  enrollment: Enrollment,
) {
  return deal.activity.some(
    (event) =>
      event.type === type &&
      event.contactId === enrollment.contactId &&
      event.date >= enrollment.enrolledAt,
  );
}

export function uniqueId(base: string, existing: Set<string>) {
  const root = slugify(base) || "sequence";
  let id = root;
  for (let n = 2; existing.has(id); n += 1) id = `${root}-${n}`;
  return id;
}
