import { DEFAULT_ROLE, TEAM_BY_NAME, TEAM_ROLE, type Team } from "@/data/team";

export const SEGMENTS = [
  "Enterprise",
  "Mid-Market",
  "SMB",
  "Strategic",
] as const;

export const STAGES = [
  "New Logo",
  "Upsell",
  "Expansion",
  "Renewal",
  "Pilot",
  "Co-Sell",
  "Land & Expand",
] as const;

export type Segment = (typeof SEGMENTS)[number];
export type Stage = (typeof STAGES)[number];
export type Tag = Segment | Stage;

export type TagTone =
  | "blue"
  | "purple"
  | "green"
  | "moss"
  | "red"
  | "orange"
  | "amber"
  | "teal"
  | "yellow"
  | "neutral";

export const TAG_TONES: Record<Tag, TagTone> = {
  Enterprise: "blue",
  "Mid-Market": "moss",
  SMB: "yellow",
  Strategic: "red",
  "New Logo": "green",
  Upsell: "purple",
  Expansion: "green",
  Renewal: "green",
  Pilot: "orange",
  "Co-Sell": "amber",
  "Land & Expand": "teal",
};

export type Owner = {
  name: string;
  avatar: string;
  email: string;
  phone: string;
  role: string;
  team?: Team;
};

const AVATARS = Array.from(
  { length: 10 },
  (_, i) => `/assets/images/_common/avatars/avatar-${i + 1}.png`,
);

const OWNER_NAMES = [
  "Sarah Nguyen",
  "James Taylor",
  "Maria Keller",
  "Nia Jameson",
  "Alex Santos",
  "Mark Darnalds",
  "Drew Nash",
  "Lina Wong",
  "Jamie Fox",
  "Kate Chen",
  "Ricky Brown",
  "Hannah Mills",
  "Emma Green",
  "Oliver Chan",
  "Ava Brooks",
  "Noah Lee",
  "Grace Miller",
  "Chloe Park",
];

export const OWNERS: Owner[] = OWNER_NAMES.map((name, i) => ({
  name,
  avatar: AVATARS[i % AVATARS.length],
  email: `${name.toLowerCase().replace(" ", ".")}@crm.com`,
  phone: `+1 (202) ${String(199 + i).padStart(3, "0")}-${String(5520 + i * 37).slice(-4)}`,
  role: TEAM_BY_NAME[name] ? TEAM_ROLE[TEAM_BY_NAME[name]] : DEFAULT_ROLE,
  team: TEAM_BY_NAME[name],
}));

export const CURRENT_USER: Owner = {
  name: "Jensen Ackles",
  avatar: "/assets/images/_common/avatars/jensen.png",
  email: "jensen.ackles@crm.com",
  phone: "+1 (202) 184-5501",
  role: "Head of Sales",
};

export function ownerByName(name: string): Owner {
  return OWNERS.find((owner) => owner.name === name) ?? OWNERS[0];
}

export function profileByName(name: string): Owner {
  return name === CURRENT_USER.name ? CURRENT_USER : ownerByName(name);
}

export type Company = {
  id: string;
  name: string;
  tags: Tag[];
  owner: string;
  logo?: string;
};

export const TREND_PATTERN = [
  false,
  true,
  true,
  false,
  true,
  true,
  false,
  true,
  false,
  true,
  false,
  true,
  true,
  false,
];

const COMPANY_RECORDS: Omit<Company, "logo">[] = [
  {
    id: "lvmh",
    name: "LVMH",
    tags: ["Enterprise", "Upsell", "Expansion", "Renewal"],
    owner: "Sarah Nguyen",
  },
  {
    id: "disney",
    name: "Disney",
    tags: ["Enterprise", "New Logo"],
    owner: "James Taylor",
  },
  {
    id: "paypal",
    name: "Paypal",
    tags: ["Enterprise"],
    owner: "Maria Keller",
  },
  {
    id: "united-airlines",
    name: "United Airlines",
    tags: ["Renewal"],
    owner: "Nia Jameson",
  },
  {
    id: "apple",
    name: "Apple",
    tags: ["Pilot"],
    owner: "Alex Santos",
  },
  {
    id: "microsoft",
    name: "Microsoft",
    tags: ["Strategic", "Expansion"],
    owner: "Mark Darnalds",
  },
  {
    id: "airbnb",
    name: "Airbnb",
    tags: ["Upsell", "Expansion", "SMB", "Pilot"],
    owner: "Drew Nash",
  },
  {
    id: "intercom",
    name: "Intercom",
    tags: ["Enterprise", "Mid-Market"],
    owner: "Lina Wong",
  },
  {
    id: "attio",
    name: "Attio",
    tags: ["Mid-Market", "Upsell", "Renewal", "Co-Sell"],
    owner: "Jamie Fox",
  },
  {
    id: "google",
    name: "Google",
    tags: ["SMB", "Enterprise", "Expansion", "Pilot"],
    owner: "Kate Chen",
  },
  {
    id: "netflix",
    name: "Netflix",
    tags: ["Mid-Market"],
    owner: "Ricky Brown",
  },
  {
    id: "spotify",
    name: "Spotify",
    tags: ["Land & Expand", "Expansion", "Strategic"],
    owner: "Hannah Mills",
  },
  {
    id: "shopify",
    name: "Shopify",
    tags: ["Co-Sell", "Expansion"],
    owner: "Emma Green",
  },
  {
    id: "zoom",
    name: "Zoom",
    tags: ["Expansion", "Land & Expand", "Renewal"],
    owner: "Oliver Chan",
  },
  {
    id: "slack",
    name: "Slack",
    tags: ["Mid-Market", "Co-Sell"],
    owner: "Ava Brooks",
  },
  {
    id: "stripe",
    name: "Stripe",
    tags: ["Expansion", "SMB", "Upsell", "Pilot"],
    owner: "Noah Lee",
  },
  {
    id: "snowflake",
    name: "Snowflake",
    tags: ["Enterprise", "Mid-Market"],
    owner: "Grace Miller",
  },
  {
    id: "hubspot",
    name: "Hubspot",
    tags: ["Expansion", "Co-Sell", "Renewal", "Pilot"],
    owner: "Chloe Park",
  },
];

export const COMPANIES: Company[] = COMPANY_RECORDS.map((company) => ({
  ...company,
  logo: `/assets/images/companies/logos/${company.id}.svg`,
}));

export const SORT_OPTIONS = [
  { value: "pipelineValue", label: "Pipeline Value" },
  { value: "winProbability", label: "Win Probability" },
  { value: "openDeals", label: "Open Deals" },
  { value: "lastInteraction", label: "Last Interaction" },
  { value: "name", label: "Company Name" },
] as const;

export type SortKey = (typeof SORT_OPTIONS)[number]["value"];

export const ACTIVITY_WINDOWS = [7, 30, 60, 90] as const;

export type ActivityWindow = (typeof ACTIVITY_WINDOWS)[number];

export const TREND_WINDOWS = ["Last 7 Days", "Last 30 Days", "Last 90 Days"];

export type ScoreCard = {
  title: string;
  description: string;
  reviewer: string;
  reviewerAvatar: string;
  updated: string;
  ageDays: number;
  verdict: string;
  stars: number;
};

export const SCORE_CARDS: ScoreCard[] = [
  {
    title: "Business fit",
    description:
      "Evaluates how well the company aligns with our ideal customer profile.",
    reviewer: "Emma Green",
    reviewerAvatar: "/assets/images/_common/avatars/detail-2.png",
    updated: "Updated 2h ago",
    ageDays: 0,
    verdict: "High potential SN",
    stars: 4,
  },
  {
    title: "Technical fit",
    description:
      "Evaluates technical compatibility, security requirements, and integration readiness.",
    reviewer: "Ricky Brown",
    reviewerAvatar: "/assets/images/_common/avatars/detail-3.png",
    updated: "Updated 12d ago",
    ageDays: 12,
    verdict: "High potential SN",
    stars: 4,
  },
  {
    title: "Technical fit",
    description:
      "Evaluates technical compatibility, security requirements, and integration readiness.",
    reviewer: "Taylor Leroy",
    reviewerAvatar: "/assets/images/_common/avatars/detail-1.png",
    updated: "Updated 41d ago",
    ageDays: 41,
    verdict: "High potential SN",
    stars: 4,
  },
];
