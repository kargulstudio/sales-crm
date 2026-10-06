import { QUARTERS } from "@/data/forecast";
import { TEAM_SORT_OPTIONS, type Team } from "@/data/team";

export const QUARTER_OPTIONS = QUARTERS.map((quarter) => ({
  value: quarter.id,
  label: quarter.label,
}));

export function sortOptions(team: Team) {
  return TEAM_SORT_OPTIONS[team].map((option) => ({
    value: option.value,
    label: option.label,
  }));
}
