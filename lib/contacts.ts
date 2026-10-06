import type { Company, TagTone } from "@/data/companies";
import type { Contact, ContactRole } from "@/data/contacts";
import type { Deal } from "@/data/deals";
import { daysSince, formatCount } from "@/lib/companies";
import { INTERACTION_LABELS, isOpenStage } from "@/lib/deals";

export const CONTACT_ROLE_TONES: Record<ContactRole, TagTone> = {
  Champion: "green",
  "Decision maker": "blue",
  Influencer: "purple",
  User: "neutral",
  Blocker: "red",
};

export const ENGAGEMENT_WINDOW_DAYS = 30;
export const ENGAGEMENT_FULL = 4;

export const CONTACT_SORT_OPTIONS = [
  { value: "name", label: "Name" },
  { value: "company", label: "Company" },
  { value: "lastTouch", label: "Last touch" },
  { value: "engagement", label: "Engagement" },
] as const;

export type ContactSortKey = (typeof CONTACT_SORT_OPTIONS)[number]["value"];

export type ContactFilters = {
  sortBy: ContactSortKey;
  owner: string;
  role: string;
  company: string;
};

export const ALL_CONTACT_OWNERS = "all";
export const ANY_CONTACT_ROLE = "any";
export const ALL_CONTACT_COMPANIES = "all";

export const DEFAULT_CONTACT_FILTERS: ContactFilters = {
  sortBy: "name",
  owner: ALL_CONTACT_OWNERS,
  role: ANY_CONTACT_ROLE,
  company: ALL_CONTACT_COMPANIES,
};

export function contactActiveFilterCount({
  owner,
  role,
  company,
}: ContactFilters) {
  return [
    owner !== DEFAULT_CONTACT_FILTERS.owner,
    role !== DEFAULT_CONTACT_FILTERS.role,
    company !== DEFAULT_CONTACT_FILTERS.company,
  ].filter(Boolean).length;
}

export type ContactSummary = {
  left: boolean;
  lastTouch: { date: string; label: string } | null;
  engagement: number;
  openDeals: number;
  openValue: number;
};

export type ContactSummaries = ReadonlyMap<string, ContactSummary>;

export const EMPTY_CONTACT_SUMMARY: ContactSummary = {
  left: false,
  lastTouch: null,
  engagement: 0,
  openDeals: 0,
  openValue: 0,
};

export function contactSummaryFor(
  summaries: ContactSummaries,
  contactId: string,
) {
  return summaries.get(contactId) ?? EMPTY_CONTACT_SUMMARY;
}

export function contactInitials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.slice(0, 1).toUpperCase())
    .join("");
}

export const CONTACT_LEFT_NOTE =
  "Left the company — details may be out of date";

export function contactLinkedIn(contact: Contact) {
  const slug = contact.name
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return slug ? `https://www.linkedin.com/in/${slug}` : "";
}

export function contactPhoneHref(phone: string) {
  const digits = phone.replace(/[^+\d]/g, "");
  return digits ? `tel:${digits}` : "";
}

export function contactSummaryMap(contacts: Contact[], deals: Deal[]) {
  const dealById = new Map(deals.map((deal) => [deal.id, deal]));
  const summaries = new Map<string, ContactSummary>();
  for (const contact of contacts) {
    summaries.set(contact.id, { ...EMPTY_CONTACT_SUMMARY });
  }
  const leftAt = new Map<string, string>();
  for (const deal of deals) {
    for (const event of deal.activity) {
      if (!event.contactId) continue;
      const summary = summaries.get(event.contactId);
      if (!summary) continue;
      if (event.type === "championLeft") {
        const previous = leftAt.get(event.contactId);
        if (previous === undefined || event.date > previous) {
          leftAt.set(event.contactId, event.date);
        }
        continue;
      }
      if (daysSince(event.date) < ENGAGEMENT_WINDOW_DAYS) {
        summary.engagement += 1;
      }
      if (summary.lastTouch === null || event.date >= summary.lastTouch.date) {
        summary.lastTouch = {
          date: event.date,
          label: INTERACTION_LABELS[event.type],
        };
      }
    }
  }
  for (const [contactId, date] of leftAt) {
    const summary = summaries.get(contactId);
    if (!summary) continue;
    summary.left = summary.lastTouch === null || summary.lastTouch.date <= date;
  }
  for (const contact of contacts) {
    const summary = summaries.get(contact.id);
    if (!summary) continue;
    for (const dealId of contact.dealIds) {
      const deal = dealById.get(dealId);
      if (!deal || !isOpenStage(deal.stage)) continue;
      summary.openDeals += 1;
      summary.openValue += deal.value;
    }
  }
  return summaries;
}

export function engagementPercent(engagement: number) {
  return Math.min(100, Math.round((engagement / ENGAGEMENT_FULL) * 100));
}

export function contactDeals(contact: Contact, deals: Deal[]) {
  return deals
    .filter((deal) => contact.dealIds.includes(deal.id))
    .sort(
      (a, b) =>
        Number(isOpenStage(b.stage)) - Number(isOpenStage(a.stage)) ||
        b.value - a.value,
    );
}

export function firstOpenDeal(contact: Contact, deals: Deal[]) {
  return contactDeals(contact, deals).find((deal) => isOpenStage(deal.stage));
}

export function decisionMakerTarget(contact: Contact, deals: Deal[]) {
  const deal = firstOpenDeal(contact, deals);
  if (!deal) return undefined;
  const alreadyLogged = deal.activity.some(
    (event) =>
      event.type === "decisionMaker" &&
      event.contactId === contact.id &&
      event.date >= deal.stageChangedAt,
  );
  return alreadyLogged ? undefined : deal;
}

export function contactEvents(contact: Contact, deals: Deal[]) {
  return deals
    .flatMap((deal) =>
      deal.activity
        .filter((event) => event.contactId === contact.id)
        .map((event) => ({ event, deal })),
    )
    .sort((a, b) => b.event.date.localeCompare(a.event.date));
}

export function dealContacts(dealId: string, contacts: Contact[]) {
  return contacts.filter((contact) => contact.dealIds.includes(dealId));
}

export function filterContacts(
  contacts: Contact[],
  { sortBy, owner, role, company }: ContactFilters,
  summaries: ContactSummaries,
  companyById: ReadonlyMap<string, Company>,
) {
  const filtered = contacts.filter(
    (contact) =>
      (owner === ALL_CONTACT_OWNERS ||
        companyById.get(contact.companyId)?.owner === owner) &&
      (role === ANY_CONTACT_ROLE || contact.role === role) &&
      (company === ALL_CONTACT_COMPANIES || contact.companyId === company),
  );

  return filtered.sort((a, b) => {
    const left = contactSummaryFor(summaries, a.id);
    const right = contactSummaryFor(summaries, b.id);
    switch (sortBy) {
      case "company":
        return (
          (companyById.get(a.companyId)?.name ?? "").localeCompare(
            companyById.get(b.companyId)?.name ?? "",
          ) || a.name.localeCompare(b.name)
        );
      case "lastTouch":
        return (
          (right.lastTouch?.date ?? "").localeCompare(
            left.lastTouch?.date ?? "",
          ) || a.name.localeCompare(b.name)
        );
      case "engagement":
        return (
          right.engagement - left.engagement || a.name.localeCompare(b.name)
        );
      default:
        return a.name.localeCompare(b.name);
    }
  });
}

export function contactsCsvRows(
  contacts: Contact[],
  summaries: ContactSummaries,
  companyName: (companyId: string) => string,
) {
  return [
    [
      "Name",
      "Title",
      "Company",
      "Role",
      "Status",
      "Email",
      "Phone",
      "Open Deals",
      "Open Value",
      "Engagement (30 days)",
      "Last Touch Date",
      "Last Touch",
    ],
    ...contacts.map((contact) => {
      const summary = contactSummaryFor(summaries, contact.id);
      return [
        contact.name,
        contact.title,
        companyName(contact.companyId),
        contact.role,
        summary.left ? "Left company" : "Active",
        contact.email,
        contact.phone,
        summary.openDeals,
        summary.openValue,
        summary.engagement,
        summary.lastTouch?.date ?? "",
        summary.lastTouch?.label ?? "",
      ];
    }),
  ];
}

export const CONTACT_CALCULATIONS = [
  { value: "decisionMakers", label: "Decision makers" },
  { value: "champions", label: "Champions" },
  { value: "left", label: "Left company" },
  { value: "engaged", label: "Engaged this month" },
];

export function calculateContacts(
  kind: string,
  contacts: Contact[],
  summaries: ContactSummaries,
) {
  const summaryOf = (contact: Contact) =>
    contactSummaryFor(summaries, contact.id);

  switch (kind) {
    case "decisionMakers":
      return formatCount(
        contacts.filter((contact) => contact.role === "Decision maker").length,
      );
    case "champions":
      return formatCount(
        contacts.filter((contact) => contact.role === "Champion").length,
      );
    case "left":
      return formatCount(
        contacts.filter((contact) => summaryOf(contact).left).length,
      );
    case "engaged":
      return formatCount(
        contacts.filter((contact) => summaryOf(contact).engagement > 0).length,
      );
    default:
      return "";
  }
}
