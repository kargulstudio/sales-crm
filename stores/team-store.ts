import { useMemo } from "react";
import { create } from "zustand";
import { CURRENT_QUARTER_ID } from "@/data/forecast";
import type { Team, TeamSortKey } from "@/data/team";
import {
  resolveTeamSort,
  sortTeamMembers,
  teamMembers,
  type TeamMember,
} from "@/lib/team";
import { useDealsStore } from "@/stores/deals-store";

type TeamState = {
  period: string;
  sortBy: TeamSortKey;
  setPeriod: (period: string) => void;
  setSortBy: (sortBy: TeamSortKey) => void;
  resetFilters: () => void;
};

export const useTeamStore = create<TeamState>((set) => ({
  period: CURRENT_QUARTER_ID,
  sortBy: "attainment",
  setPeriod: (period) => set({ period }),
  setSortBy: (sortBy) => set({ sortBy }),
  resetFilters: () => set({ period: CURRENT_QUARTER_ID, sortBy: "attainment" }),
}));

export function useTeamMembers(team: Team): TeamMember[] {
  const deals = useDealsStore((state) => state.deals);
  const period = useTeamStore((state) => state.period);
  const sortBy = useTeamStore((state) => state.sortBy);
  return useMemo(
    () =>
      sortTeamMembers(
        teamMembers(deals, team, period),
        team,
        resolveTeamSort(team, sortBy),
      ),
    [deals, team, period, sortBy],
  );
}
