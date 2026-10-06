import { useMemo } from "react";
import { create } from "zustand";
import { CONTACTS, type Contact, type ContactRole } from "@/data/contacts";
import {
  DEFAULT_CONTACT_FILTERS,
  contactSummaryMap,
  decisionMakerTarget,
  filterContacts,
  type ContactFilters,
} from "@/lib/contacts";
import { useCompanyMap } from "@/stores/companies-store";
import { useDealsStore } from "@/stores/deals-store";

type ContactsState = ContactFilters & {
  contacts: Contact[];
  selectedIds: string[];
  detailId: string | null;
  detailOpen: boolean;
  newContactOpen: boolean;
  setSortBy: (sortBy: ContactFilters["sortBy"]) => void;
  setOwner: (owner: string) => void;
  setRoleFilter: (role: string) => void;
  setCompany: (company: string) => void;
  resetFilters: () => void;
  toggleSelected: (id: string) => void;
  setSelected: (ids: string[]) => void;
  openDetail: (id: string) => void;
  closeDetail: () => void;
  setNewContactOpen: (open: boolean) => void;
  addContact: (contact: Contact) => void;
  setRole: (id: string, role: ContactRole) => void;
  linkToDeal: (id: string, dealId: string) => void;
};

export const useContactsStore = create<ContactsState>((set, get) => ({
  contacts: CONTACTS,
  ...DEFAULT_CONTACT_FILTERS,
  selectedIds: [],
  detailId: null,
  detailOpen: false,
  newContactOpen: false,
  setSortBy: (sortBy) => set({ sortBy }),
  setOwner: (owner) => set({ owner }),
  setRoleFilter: (role) => set({ role }),
  setCompany: (company) => set({ company }),
  resetFilters: () => set({ ...DEFAULT_CONTACT_FILTERS }),
  toggleSelected: (id) =>
    set((state) => ({
      selectedIds: state.selectedIds.includes(id)
        ? state.selectedIds.filter((selected) => selected !== id)
        : [...state.selectedIds, id],
    })),
  setSelected: (selectedIds) => set({ selectedIds }),
  openDetail: (detailId) => set({ detailId, detailOpen: true }),
  closeDetail: () => set({ detailOpen: false }),
  setNewContactOpen: (newContactOpen) => set({ newContactOpen }),
  addContact: (contact) =>
    set((state) => ({
      contacts: [contact, ...state.contacts],
      newContactOpen: false,
    })),
  setRole: (id, role) => {
    const contact = get().contacts.find((item) => item.id === id);
    if (!contact || contact.role === role) return;
    set((state) => ({
      contacts: state.contacts.map((item) =>
        item.id === id ? { ...item, role } : item,
      ),
    }));
    if (role !== "Decision maker") return;
    const { deals, logActivity } = useDealsStore.getState();
    const target = decisionMakerTarget(contact, deals);
    if (target) logActivity(target.id, "decisionMaker", { contactId: id });
  },
  linkToDeal: (id, dealId) =>
    set((state) => ({
      contacts: state.contacts.map((contact) =>
        contact.id === id && !contact.dealIds.includes(dealId)
          ? { ...contact, dealIds: [...contact.dealIds, dealId] }
          : contact,
      ),
    })),
}));

export function useContactSummaries() {
  const contacts = useContactsStore((state) => state.contacts);
  const deals = useDealsStore((state) => state.deals);
  return useMemo(() => contactSummaryMap(contacts, deals), [contacts, deals]);
}

export function useVisibleContacts() {
  const contacts = useContactsStore((state) => state.contacts);
  const sortBy = useContactsStore((state) => state.sortBy);
  const owner = useContactsStore((state) => state.owner);
  const role = useContactsStore((state) => state.role);
  const company = useContactsStore((state) => state.company);
  const summaries = useContactSummaries();
  const companyById = useCompanyMap();
  return useMemo(
    () =>
      filterContacts(
        contacts,
        { sortBy, owner, role, company },
        summaries,
        companyById,
      ),
    [contacts, sortBy, owner, role, company, summaries, companyById],
  );
}
