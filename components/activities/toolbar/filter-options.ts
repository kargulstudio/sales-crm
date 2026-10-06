import { useMemo } from "react";
import { OWNERS } from "@/data/companies";
import { DEAL_ACTIVITY_TYPES } from "@/data/deals";
import {
  ACTIVITY_WINDOW_OPTIONS,
  ALL_ACTIVITY_COMPANIES,
  ALL_ACTIVITY_OWNERS,
  ANY_ACTIVITY_TYPE,
} from "@/lib/activities";
import { ACTIVITY_EFFECTS } from "@/lib/deals";
import { useCompaniesStore } from "@/stores/companies-store";
import { useDealsStore } from "@/stores/deals-store";

export const TYPE_OPTIONS = [
  { value: ANY_ACTIVITY_TYPE, label: "Any" },
  ...DEAL_ACTIVITY_TYPES.map((type) => ({
    value: type,
    label: ACTIVITY_EFFECTS[type].label,
  })),
];

export const ACTIVITY_OWNER_OPTIONS = [
  { value: ALL_ACTIVITY_OWNERS, label: "All Owners" },
  ...OWNERS.map((owner) => ({ value: owner.name, label: owner.name })),
];

export const WINDOW_OPTIONS = ACTIVITY_WINDOW_OPTIONS;

export function useCompanyOptions() {
  const companies = useCompaniesStore((state) => state.companies);
  const deals = useDealsStore((state) => state.deals);
  return useMemo(() => {
    const withDeals = new Set(deals.map((deal) => deal.companyId));
    return [
      { value: ALL_ACTIVITY_COMPANIES, label: "All Companies" },
      ...companies
        .filter((company) => withDeals.has(company.id))
        .map((company) => ({ value: company.id, label: company.name }))
        .sort((a, b) => a.label.localeCompare(b.label)),
    ];
  }, [companies, deals]);
}
