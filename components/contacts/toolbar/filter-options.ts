import { useMemo } from "react";
import { OWNERS } from "@/data/companies";
import { CONTACT_ROLES } from "@/data/contacts";
import {
  ALL_CONTACT_COMPANIES,
  ALL_CONTACT_OWNERS,
  ANY_CONTACT_ROLE,
  CONTACT_SORT_OPTIONS,
} from "@/lib/contacts";
import { useCompaniesStore } from "@/stores/companies-store";

export const CONTACT_SORT_MENU_OPTIONS = CONTACT_SORT_OPTIONS.map((option) => ({
  value: option.value,
  label: option.label,
}));

export const CONTACT_OWNER_OPTIONS = [
  { value: ALL_CONTACT_OWNERS, label: "All Owners" },
  ...OWNERS.map((owner) => ({ value: owner.name, label: owner.name })),
];

export const CONTACT_ROLE_OPTIONS = [
  { value: ANY_CONTACT_ROLE, label: "Any" },
  ...CONTACT_ROLES.map((role) => ({ value: role, label: role })),
];

export function useContactCompanyOptions() {
  const companies = useCompaniesStore((state) => state.companies);
  return useMemo(
    () => [
      { value: ALL_CONTACT_COMPANIES, label: "All Companies" },
      ...companies
        .map((company) => ({ value: company.id, label: company.name }))
        .sort((a, b) => a.label.localeCompare(b.label)),
    ],
    [companies],
  );
}
