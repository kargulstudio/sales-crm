import type { Deal } from "@/data/deals";
import { ALL_Q1, Q1_TEAMS, q1Owners } from "@/lib/q1-forecast";

export const Q1_TEAM_OPTIONS = [
  { value: ALL_Q1, label: "All" },
  ...Q1_TEAMS.map((team) => ({ value: team, label: team })),
];

export function q1OwnerOptions(deals: Deal[], team: string) {
  return [
    { value: ALL_Q1, label: "All Owners" },
    ...q1Owners(deals, team).map((name) => ({ value: name, label: name })),
  ];
}
