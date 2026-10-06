import { useMemo } from "react";
import { create } from "zustand";
import {
  DEFAULT_ACTIVITY_FILTERS,
  TIMELINE_PAGE_SIZE,
  filterActivities,
  flattenActivities,
  type ActivityFilters,
} from "@/lib/activities";
import { useDealsStore } from "@/stores/deals-store";

type ActivitiesState = ActivityFilters & {
  shown: number;
  logOpen: boolean;
  logDealId: string | null;
  logContactId: string | null;
  setType: (type: string) => void;
  setOwner: (owner: string) => void;
  setCompany: (company: string) => void;
  setWindow: (window: string) => void;
  resetFilters: () => void;
  showMore: () => void;
  openLog: (dealId?: string, contactId?: string) => void;
  setLogOpen: (open: boolean) => void;
};

export const useActivitiesStore = create<ActivitiesState>((set) => ({
  ...DEFAULT_ACTIVITY_FILTERS,
  shown: TIMELINE_PAGE_SIZE,
  logOpen: false,
  logDealId: null,
  logContactId: null,
  setType: (type) => set({ type, shown: TIMELINE_PAGE_SIZE }),
  setOwner: (owner) => set({ owner, shown: TIMELINE_PAGE_SIZE }),
  setCompany: (company) => set({ company, shown: TIMELINE_PAGE_SIZE }),
  setWindow: (window) => set({ window, shown: TIMELINE_PAGE_SIZE }),
  resetFilters: () =>
    set({ ...DEFAULT_ACTIVITY_FILTERS, shown: TIMELINE_PAGE_SIZE }),
  showMore: () => set((state) => ({ shown: state.shown + TIMELINE_PAGE_SIZE })),
  openLog: (dealId, contactId) =>
    set({
      logOpen: true,
      logDealId: dealId ?? null,
      logContactId: contactId ?? null,
    }),
  setLogOpen: (logOpen) => set({ logOpen }),
}));

export function useAllActivities() {
  const deals = useDealsStore((state) => state.deals);
  return useMemo(() => flattenActivities(deals), [deals]);
}

export function useVisibleActivities() {
  const all = useAllActivities();
  const type = useActivitiesStore((state) => state.type);
  const owner = useActivitiesStore((state) => state.owner);
  const company = useActivitiesStore((state) => state.company);
  const window = useActivitiesStore((state) => state.window);
  return useMemo(
    () => filterActivities(all, { type, owner, company, window }),
    [all, type, owner, company, window],
  );
}
