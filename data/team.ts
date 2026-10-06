export const TEAMS = ["Strategic AEs", "Mid Market", "SDR Team"] as const;

export type Team = (typeof TEAMS)[number];

export const TEAM_BY_NAME: Record<string, Team | undefined> = {
  "Sarah Nguyen": "Strategic AEs",
  "Mark Darnalds": "Strategic AEs",
  "James Taylor": "Strategic AEs",
  "Noah Lee": "Strategic AEs",
  "Ricky Brown": "Strategic AEs",
  "Ava Brooks": "Strategic AEs",
  "Maria Keller": "Mid Market",
  "Alex Santos": "Mid Market",
  "Nia Jameson": "Mid Market",
  "Kate Chen": "Mid Market",
  "Emma Green": "Mid Market",
  "Grace Miller": "Mid Market",
  "Drew Nash": "Mid Market",
  "Hannah Mills": "Mid Market",
  "Jamie Fox": "SDR Team",
  "Chloe Park": "SDR Team",
  "Lina Wong": "SDR Team",
  "Oliver Chan": "SDR Team",
};

export const TEAM_ROLE: Record<Team, string> = {
  "Strategic AEs": "Strategic Account Executive",
  "Mid Market": "Account Executive",
  "SDR Team": "Sales Development Rep",
};

export const DEFAULT_ROLE = "Account Executive";

export const MEETINGS_TARGET = 12;

export type TeamSortKey =
  | "attainment"
  | "closed"
  | "pipeline"
  | "meetings"
  | "name";

const AE_SORTS: { value: TeamSortKey; label: string }[] = [
  { value: "attainment", label: "Attainment" },
  { value: "closed", label: "Closed" },
  { value: "pipeline", label: "Pipeline" },
  { value: "name", label: "Name" },
];

export const TEAM_SORT_OPTIONS: Record<
  Team,
  { value: TeamSortKey; label: string }[]
> = {
  "Strategic AEs": AE_SORTS,
  "Mid Market": AE_SORTS,
  "SDR Team": [
    { value: "meetings", label: "Meetings" },
    { value: "name", label: "Name" },
    { value: "pipeline", label: "Pipeline" },
  ],
};
