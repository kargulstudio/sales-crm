"use client";

import Button from "@/components/_ui/button";
import FilterMenu from "@/components/_common/filter-menu";
import MobileFilters from "./mobile-filters";
import {
  ACTIVITY_OPTIONS,
  OWNER_OPTIONS,
  SORT_MENU_OPTIONS,
  STAGE_OPTIONS,
} from "./filter-options";
import type { SortKey } from "@/data/companies";
import { TODAY, companiesCsvRows, filterCompanies } from "@/lib/companies";
import { downloadCsv } from "@/lib/csv";
import { companySummaryMap } from "@/lib/deals";
import { useCompaniesStore } from "@/stores/companies-store";
import { useDealsStore } from "@/stores/deals-store";
import ShareIcon from "@/public/assets/images/companies/toolbar/share.svg";
import PlusIcon from "@/public/assets/images/_common/plus.svg";

export default function CompaniesToolbar() {
  const sortBy = useCompaniesStore((state) => state.sortBy);
  const owner = useCompaniesStore((state) => state.owner);
  const stage = useCompaniesStore((state) => state.stage);
  const activityWindow = useCompaniesStore((state) => state.activityWindow);
  const setSortBy = useCompaniesStore((state) => state.setSortBy);
  const setOwner = useCompaniesStore((state) => state.setOwner);
  const setStage = useCompaniesStore((state) => state.setStage);
  const setActivityWindow = useCompaniesStore(
    (state) => state.setActivityWindow,
  );
  const setNewCompanyOpen = useCompaniesStore(
    (state) => state.setNewCompanyOpen,
  );

  function exportCsv() {
    const { companies } = useCompaniesStore.getState();
    const summaries = companySummaryMap(useDealsStore.getState().deals);
    const visible = filterCompanies(
      companies,
      { sortBy, owner, stage, activityWindow },
      summaries,
    );
    downloadCsv(`companies-${TODAY}.csv`, companiesCsvRows(visible, summaries));
  }

  return (
    <div className="flex shrink-0 flex-wrap items-center justify-between gap-2 px-4 py-4">
      <MobileFilters className="sm:hidden" />

      <div className="hidden min-w-0 flex-wrap gap-2 sm:flex">
        <FilterMenu
          label="Sort by"
          value={sortBy}
          options={SORT_MENU_OPTIONS}
          onChange={(value) => setSortBy(value as SortKey)}
        />
        <FilterMenu
          label="Filter"
          value={owner}
          options={OWNER_OPTIONS}
          onChange={setOwner}
        />
        <FilterMenu
          label="Stage"
          value={stage}
          options={STAGE_OPTIONS}
          onChange={setStage}
        />
        <FilterMenu
          label="Last Activity"
          value={String(activityWindow)}
          options={ACTIVITY_OPTIONS}
          onChange={(value) => setActivityWindow(Number(value))}
        />
      </div>

      <div className="flex shrink-0 items-center gap-1">
        <Button variant="secondary" size="sm" onClick={exportCsv}>
          <ShareIcon aria-hidden className="size-3" />
          Export
        </Button>
        <Button
          variant="primary"
          size="sm"
          onClick={() => setNewCompanyOpen(true)}
        >
          <PlusIcon aria-hidden className="size-3" />
          New Company
        </Button>
      </div>
    </div>
  );
}
