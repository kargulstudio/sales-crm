import { useMemo } from "react";
import { create } from "zustand";
import { COMPANIES, type Company, type SortKey } from "@/data/companies";
import { NOTIFICATIONS } from "@/data/notifications";
import { DEFAULT_FILTERS } from "@/lib/companies";

export type AppDialog = "invite" | "help" | "billing";

type CompaniesState = {
  companies: Company[];
  sortBy: SortKey;
  owner: string;
  stage: string;
  activityWindow: number;
  selectedIds: string[];
  detailId: string | null;
  detailOpen: boolean;
  profileName: string | null;
  profileOpen: boolean;
  newCompanyOpen: boolean;
  sidebarOpen: boolean;
  searchOpen: boolean;
  unreadNotificationIds: string[];
  appDialog: AppDialog | null;
  planId: string | null;
  setSortBy: (sortBy: SortKey) => void;
  setOwner: (owner: string) => void;
  setStage: (stage: string) => void;
  setActivityWindow: (days: number) => void;
  resetFilters: () => void;
  toggleSelected: (id: string) => void;
  setSelected: (ids: string[]) => void;
  openDetail: (id: string) => void;
  closeDetail: () => void;
  openProfile: (name: string) => void;
  closeProfile: () => void;
  setNewCompanyOpen: (open: boolean) => void;
  setSidebarOpen: (open: boolean) => void;
  setSearchOpen: (open: boolean) => void;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  setAppDialog: (dialog: AppDialog | null) => void;
  setPlanId: (planId: string) => void;
  addCompany: (company: Company) => void;
};

export const useCompaniesStore = create<CompaniesState>((set) => ({
  companies: COMPANIES,
  ...DEFAULT_FILTERS,
  selectedIds: ["microsoft"],
  detailId: null,
  detailOpen: false,
  profileName: null,
  profileOpen: false,
  newCompanyOpen: false,
  sidebarOpen: false,
  searchOpen: false,
  unreadNotificationIds: NOTIFICATIONS.filter((item) => item.unread).map(
    (item) => item.id,
  ),
  appDialog: null,
  planId: null,
  setSortBy: (sortBy) => set({ sortBy }),
  setOwner: (owner) => set({ owner }),
  setStage: (stage) => set({ stage }),
  setActivityWindow: (activityWindow) => set({ activityWindow }),
  resetFilters: () => set({ ...DEFAULT_FILTERS }),
  toggleSelected: (id) =>
    set((state) => ({
      selectedIds: state.selectedIds.includes(id)
        ? state.selectedIds.filter((selected) => selected !== id)
        : [...state.selectedIds, id],
    })),
  setSelected: (selectedIds) => set({ selectedIds }),
  openDetail: (detailId) =>
    set({ detailId, detailOpen: true, profileOpen: false }),
  closeDetail: () => set({ detailOpen: false }),
  openProfile: (profileName) =>
    set({ profileName, profileOpen: true, detailOpen: false }),
  closeProfile: () => set({ profileOpen: false }),
  setNewCompanyOpen: (newCompanyOpen) => set({ newCompanyOpen }),
  setSidebarOpen: (sidebarOpen) => set({ sidebarOpen }),
  setSearchOpen: (searchOpen) => set({ searchOpen }),
  markNotificationRead: (id) =>
    set((state) => ({
      unreadNotificationIds: state.unreadNotificationIds.filter(
        (unread) => unread !== id,
      ),
    })),
  markAllNotificationsRead: () => set({ unreadNotificationIds: [] }),
  setAppDialog: (appDialog) => set({ appDialog, sidebarOpen: false }),
  setPlanId: (planId) => set({ planId }),
  addCompany: (company) =>
    set((state) => ({
      companies: [company, ...state.companies],
      newCompanyOpen: false,
    })),
}));

export function useCompanyMap() {
  const companies = useCompaniesStore((state) => state.companies);
  return useMemo(
    () => new Map(companies.map((company) => [company.id, company])),
    [companies],
  );
}
