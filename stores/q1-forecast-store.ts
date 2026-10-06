import { useMemo } from "react";
import { create } from "zustand";
import {
  ALL_Q1,
  DEFAULT_Q1_FILTERS,
  buildQ1Report,
  q1Owners,
  type Q1Filters,
  type Q1Report,
} from "@/lib/q1-forecast";
import { useDealsStore } from "@/stores/deals-store";

type Q1ForecastState = Q1Filters & {
  setOwner: (owner: string) => void;
  setTeam: (team: string) => void;
  resetFilters: () => void;
};

export const useQ1ForecastStore = create<Q1ForecastState>((set) => ({
  ...DEFAULT_Q1_FILTERS,
  setOwner: (owner) => set({ owner }),
  setTeam: (team) =>
    set((state) => ({
      team,
      owner: q1Owners(useDealsStore.getState().deals, team).includes(
        state.owner,
      )
        ? state.owner
        : ALL_Q1,
    })),
  resetFilters: () => set({ ...DEFAULT_Q1_FILTERS }),
}));

export function useQ1Report(): Q1Report {
  const deals = useDealsStore((state) => state.deals);
  const owner = useQ1ForecastStore((state) => state.owner);
  const team = useQ1ForecastStore((state) => state.team);
  return useMemo(
    () => buildQ1Report(deals, { owner, team }),
    [deals, owner, team],
  );
}
