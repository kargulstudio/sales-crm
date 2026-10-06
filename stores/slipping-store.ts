import { useMemo } from "react";
import { create } from "zustand";
import {
  ALL_SLIPPING,
  DEFAULT_SLIPPING_FILTERS,
  filterSlipping,
  slippingOwners,
  slippingRows,
  slippingSummary,
  type SlippingDeal,
  type SlippingFilters,
  type SlippingSummary,
} from "@/lib/slipping";
import { useDealsStore } from "@/stores/deals-store";

type SlippingState = SlippingFilters & {
  setReason: (reason: string) => void;
  setOwner: (owner: string) => void;
  setTeam: (team: string) => void;
  setSortBy: (sortBy: SlippingFilters["sortBy"]) => void;
  resetFilters: () => void;
};

export const useSlippingStore = create<SlippingState>((set) => ({
  ...DEFAULT_SLIPPING_FILTERS,
  setReason: (reason) => set({ reason }),
  setOwner: (owner) => set({ owner }),
  setTeam: (team) =>
    set((state) => ({
      team,
      owner: slippingOwners(
        slippingRows(useDealsStore.getState().deals),
        team,
      ).includes(state.owner)
        ? state.owner
        : ALL_SLIPPING,
    })),
  setSortBy: (sortBy) => set({ sortBy }),
  resetFilters: () => set({ ...DEFAULT_SLIPPING_FILTERS }),
}));

export type SlippingReport = {
  all: SlippingDeal[];
  rows: SlippingDeal[];
  summary: SlippingSummary;
};

export function useSlippingReport(): SlippingReport {
  const deals = useDealsStore((state) => state.deals);
  const reason = useSlippingStore((state) => state.reason);
  const owner = useSlippingStore((state) => state.owner);
  const team = useSlippingStore((state) => state.team);
  const sortBy = useSlippingStore((state) => state.sortBy);
  return useMemo(() => {
    const all = slippingRows(deals);
    const rows = filterSlipping(all, { reason, owner, team, sortBy });
    return { all, rows, summary: slippingSummary(rows) };
  }, [deals, reason, owner, team, sortBy]);
}
