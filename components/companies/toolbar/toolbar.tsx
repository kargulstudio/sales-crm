"use client";

import Button from "@/components/_ui/button";
import FilterMenu from "@/components/_common/filter-menu";
import MobileFilters from "./mobile-filters";
import DensityMenu from "./density-menu";
import {
  ACTIVITY_OPTIONS,
  OWNER_OPTIONS,
  SORT_MENU_OPTIONS,
  STAGE_OPTIONS,
} from "./filter-options";
import type { SortKey } from "@/data/companies";
import {
  TODAY,
  companiesCsvRows,
  filterCompanies,
  pickFilters,
} from "@/lib/companies";
import { downloadCsv } from "@/lib/csv";
import { useCompaniesStore } from "@/stores/companies-store";
import { toast } from "@/stores/toast-store";
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
    const state = useCompaniesStore.getState();
    const visible = filterCompanies(state.companies, pickFilters(state));
    downloadCsv(`companies-${TODAY}.csv`, companiesCsvRows(visible));
    toast(
      `Exported ${visible.length} ${visible.length === 1 ? "company" : "companies"}`,
    );
  }

  return (
    <div className="short:py-2 @container flex shrink-0 items-center justify-between gap-2 px-4 py-4">
      <MobileFilters className="h-control-md py-0 @4xl:hidden" />

      <div className="hidden min-w-0 flex-wrap gap-2 @4xl:flex">
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
        <DensityMenu className="max-sm:hidden" />
        <Button
          variant="secondary"
          size="sm"
          className="h-control-md @max-[280px]:w-control-md py-0"
          onClick={exportCsv}
        >
          <ShareIcon aria-hidden className="size-3" />
          <span className="@max-[280px]:sr-only">Export</span>
        </Button>
        <Button
          variant="primary"
          size="sm"
          className="h-control-md py-0"
          onClick={() => setNewCompanyOpen(true)}
        >
          <PlusIcon aria-hidden className="size-3" />
          New Company
        </Button>
      </div>
    </div>
  );
}
