import {
  ALL_SLIPPING,
  SLIPPING_SORT_OPTIONS,
  SLIPPING_TEAMS,
  slippingOwners,
  type SlippingDeal,
} from "@/lib/slipping";

export const SLIPPING_TEAM_OPTIONS = [
  { value: ALL_SLIPPING, label: "All" },
  ...SLIPPING_TEAMS.map((team) => ({ value: team, label: team })),
];

export const SLIPPING_SORT_FILTER_OPTIONS = SLIPPING_SORT_OPTIONS.map(
  (option) => ({ value: option.value, label: option.label }),
);

export function slippingOwnerOptions(rows: SlippingDeal[], team: string) {
  return [
    { value: ALL_SLIPPING, label: "All Owners" },
    ...slippingOwners(rows, team).map((name) => ({
      value: name,
      label: name,
    })),
  ];
}
