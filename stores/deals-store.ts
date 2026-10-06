import { useMemo } from "react";
import { create } from "zustand";
import {
  DEALS,
  REGIONS,
  type Deal,
  type DealActivityType,
  type DealStage,
  type Region,
} from "@/data/deals";
import type { ForecastCategory } from "@/data/forecast";
import { TODAY } from "@/lib/companies";
import {
  DEFAULT_DEAL_FILTERS,
  companySummaryMap,
  isOpenStage,
  type DealFilters,
  type DealScope,
} from "@/lib/deals";

type DealsState = {
  deals: Deal[];
  filtersByScope: Partial<Record<DealScope, DealFilters>>;
  detailId: string | null;
  detailOpen: boolean;
  newDealOpen: boolean;
  newDealRegion: Region;
  pushId: string | null;
  pushOpen: boolean;
  setFilters: (scope: DealScope, patch: Partial<DealFilters>) => void;
  resetFilters: (scope: DealScope) => void;
  openDetail: (id: string) => void;
  closeDetail: () => void;
  setNewDealOpen: (open: boolean) => void;
  openNewDeal: (region: Region) => void;
  openPush: (id: string) => void;
  setPushOpen: (open: boolean) => void;
  pushCloseDate: (id: string, newDate: string) => void;
  moveDeal: (id: string, stage: DealStage) => void;
  addDeal: (deal: Deal) => void;
  setCategory: (id: string, category: ForecastCategory) => void;
  setRegion: (id: string, region: Region) => void;
  logActivity: (
    id: string,
    type: Exclude<DealActivityType, "closePushed">,
    options?: { date?: string; note?: string; contactId?: string },
  ) => void;
  setWinOverride: (id: string, win: number | null) => void;
};

export const useDealsStore = create<DealsState>((set) => ({
  deals: DEALS,
  filtersByScope: {},
  detailId: null,
  detailOpen: false,
  newDealOpen: false,
  newDealRegion: REGIONS[0],
  pushId: null,
  pushOpen: false,
  setFilters: (scope, patch) =>
    set((state) => ({
      filtersByScope: {
        ...state.filtersByScope,
        [scope]: {
          ...(state.filtersByScope[scope] ?? DEFAULT_DEAL_FILTERS),
          ...patch,
        },
      },
    })),
  resetFilters: (scope) =>
    set((state) => ({
      filtersByScope: { ...state.filtersByScope, [scope]: undefined },
    })),
  openDetail: (detailId) => set({ detailId, detailOpen: true }),
  closeDetail: () => set({ detailOpen: false }),
  setNewDealOpen: (newDealOpen) => set({ newDealOpen }),
  openNewDeal: (newDealRegion) => set({ newDealRegion, newDealOpen: true }),
  openPush: (pushId) => set({ pushId, pushOpen: true }),
  setPushOpen: (pushOpen) => set({ pushOpen }),
  pushCloseDate: (id, newDate) =>
    set((state) => ({
      deals: state.deals.map((deal) =>
        deal.id === id &&
        isOpenStage(deal.stage) &&
        newDate > deal.closeDate &&
        newDate >= TODAY
          ? {
              ...deal,
              closeDate: newDate,
              activity: [
                ...deal.activity,
                {
                  id: `${deal.id}-a${deal.activity.length + 1}-${Date.now()}`,
                  type: "closePushed",
                  date: TODAY,
                  from: deal.closeDate,
                },
              ],
            }
          : deal,
      ),
    })),
  moveDeal: (id, stage) =>
    set((state) => ({
      deals: state.deals.map((deal) =>
        deal.id === id && deal.stage !== stage
          ? {
              ...deal,
              stage,
              stageChangedAt: TODAY,
              winOverride: undefined,
            }
          : deal,
      ),
    })),
  addDeal: (deal) =>
    set((state) => ({
      deals: [deal, ...state.deals],
      newDealOpen: false,
    })),
  setCategory: (id, category) =>
    set((state) => ({
      deals: state.deals.map((deal) =>
        deal.id === id ? { ...deal, category } : deal,
      ),
    })),
  setRegion: (id, region) =>
    set((state) => ({
      deals: state.deals.map((deal) =>
        deal.id === id ? { ...deal, region } : deal,
      ),
    })),
  logActivity: (id, type, options) =>
    set((state) => ({
      deals: state.deals.map((deal) =>
        deal.id === id
          ? {
              ...deal,
              activity: [
                ...deal.activity,
                {
                  id: `${deal.id}-a${deal.activity.length + 1}-${Date.now()}`,
                  type,
                  date: options?.date ?? TODAY,
                  ...(options?.note ? { note: options.note } : {}),
                  ...(options?.contactId
                    ? { contactId: options.contactId }
                    : {}),
                },
              ],
            }
          : deal,
      ),
    })),
  setWinOverride: (id, win) =>
    set((state) => ({
      deals: state.deals.map((deal) =>
        deal.id === id ? { ...deal, winOverride: win ?? undefined } : deal,
      ),
    })),
}));

export function useDealFilters(scope: DealScope) {
  return useDealsStore(
    (state) => state.filtersByScope[scope] ?? DEFAULT_DEAL_FILTERS,
  );
}

export function useCompanySummaries() {
  const deals = useDealsStore((state) => state.deals);
  return useMemo(() => companySummaryMap(deals), [deals]);
}
