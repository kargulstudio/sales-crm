import { create } from "zustand";
import { type Company, type SortKey, type Owner } from "@/data/companies";
import type { Notification } from "@/data/notifications";
import type { Bootstrap, User } from "@/lib/crm-types";
import { api } from "@/lib/api";
import { DEFAULT_FILTERS } from "@/lib/companies";

type CompaniesState = {
  companies: Company[];
  owners: (Owner & { id: string })[];
  user: User | null;
  notifications: Notification[];
  loading: boolean;
  error: string | null;
  revision: number;
  refresh: () => Promise<void>;
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
  activeTab: string;
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
  setActiveTab: (tab: string) => void;
  addCompany: (company: Company) => Promise<void>;
};

export const useCompaniesStore = create<CompaniesState>((set, get) => ({
  companies: [],
  owners: [],
  user: null,
  notifications: [],
  loading: true,
  error: null,
  revision: 0,
  refresh: async () => {
    try {
      const bootstrap = await api<Bootstrap>("bootstrap");
      let page = 1;
      const companies: Company[] = [];
      while (true) {
        const result = await api<{ items: Company[]; total: number }>(
          `companies?limit=100&page=${page++}`,
        );
        companies.push(...result.items);
        if (companies.length >= result.total || result.items.length === 0)
          break;
      }
      set({
        ...bootstrap,
        companies,
        unreadNotificationIds: bootstrap.notifications
          .filter((n) => n.unread)
          .map((n) => n.id),
        loading: false,
        error: null,
        revision: get().revision + 1,
      });
    } catch (error) {
      set({
        loading: false,
        error: error instanceof Error ? error.message : "Unable to load CRM",
      });
    }
  },
  ...DEFAULT_FILTERS,
  selectedIds: [],
  detailId: null,
  detailOpen: false,
  profileName: null,
  profileOpen: false,
  newCompanyOpen: false,
  sidebarOpen: false,
  searchOpen: false,
  unreadNotificationIds: [],
  activeTab: "companies",
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
  markNotificationRead: (id) => {
    void api("notifications/read", "POST", { ids: [id] })
      .then(() =>
        set((state) => ({
          unreadNotificationIds: state.unreadNotificationIds.filter(
            (v) => v !== id,
          ),
        })),
      )
      .catch((error) => set({ error: error.message }));
  },
  markAllNotificationsRead: () => {
    void api("notifications/read", "POST", { ids: get().unreadNotificationIds })
      .then(() => set({ unreadNotificationIds: [] }))
      .catch((error) => set({ error: error.message }));
  },
  setActiveTab: (activeTab) => set({ activeTab, sidebarOpen: false }),
  addCompany: async (company) => {
    const owner = get().owners.find((o) => o.name === company.owner);
    await api("companies", "POST", {
      name: company.name,
      logo_url: company.logo ?? null,
      segment: company.tags[0],
      stage: company.tags[1],
      owner_id: owner?.id,
      open_deals: company.openDeals,
      pipeline_value: company.pipelineValue,
      win_probability: company.winProbability,
      interaction_date: company.lastInteraction.date,
      interaction_subject: company.lastInteraction.label,
    });
    set({ newCompanyOpen: false });
    await get().refresh();
  },
}));

export function useOwner(name: string | null) {
  return (
    useCompaniesStore((state) =>
      state.owners.find((owner) => owner.name === name),
    ) ?? {
      id: "",
      name: name || "Account owner",
      email: "",
      avatar: "/assets/images/_common/avatar-placeholder.svg",
      phone: "",
      role: "Account owner",
    }
  );
}
