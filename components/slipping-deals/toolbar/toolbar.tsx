"use client";

import Button from "@/components/_ui/button";
import FilterMenu from "@/components/_common/filter-menu";
import MobileFilters from "./mobile-filters";
import {
  SLIPPING_SORT_FILTER_OPTIONS,
  SLIPPING_TEAM_OPTIONS,
  slippingOwnerOptions,
} from "./filter-options";
import { TODAY } from "@/lib/companies";
import { downloadCsv } from "@/lib/csv";
import {
  REASON_FILTER_OPTIONS,
  slippingCsvRows,
  type SlippingSortKey,
} from "@/lib/slipping";
import { useCompaniesStore } from "@/stores/companies-store";
import { useSlippingReport, useSlippingStore } from "@/stores/slipping-store";
import ShareIcon from "@/public/assets/images/companies/toolbar/share.svg";

export default function SlippingToolbar() {
  const reason = useSlippingStore((state) => state.reason);
  const owner = useSlippingStore((state) => state.owner);
  const team = useSlippingStore((state) => state.team);
  const sortBy = useSlippingStore((state) => state.sortBy);
  const setReason = useSlippingStore((state) => state.setReason);
  const setOwner = useSlippingStore((state) => state.setOwner);
  const setTeam = useSlippingStore((state) => state.setTeam);
  const setSortBy = useSlippingStore((state) => state.setSortBy);
  const { all, rows } = useSlippingReport();

  function exportCsv() {
    const { companies } = useCompaniesStore.getState();
    downloadCsv(
      `slipping-deals-${TODAY}.csv`,
      slippingCsvRows(
        rows,
        (companyId) =>
          companies.find((company) => company.id === companyId)?.name ??
          companyId,
      ),
    );
  }

  return (
    <div className="flex shrink-0 flex-wrap items-center justify-between gap-2 px-4 py-4">
      <MobileFilters className="sm:hidden" />

      <div className="hidden min-w-0 flex-wrap gap-2 sm:flex">
        <FilterMenu
          label="Reason"
          value={reason}
          options={REASON_FILTER_OPTIONS}
          onChange={setReason}
        />
        <FilterMenu
          label="Owner"
          value={owner}
          options={slippingOwnerOptions(all, team)}
          onChange={setOwner}
        />
        <FilterMenu
          label="Team"
          value={team}
          options={SLIPPING_TEAM_OPTIONS}
          onChange={setTeam}
        />
        <FilterMenu
          label="Sort by"
          value={sortBy}
          options={SLIPPING_SORT_FILTER_OPTIONS}
          onChange={(value) => setSortBy(value as SlippingSortKey)}
        />
      </div>

      <div className="flex shrink-0 items-center gap-1">
        <Button variant="secondary" size="sm" onClick={exportCsv}>
          <ShareIcon aria-hidden className="size-3" />
          Export
        </Button>
      </div>
    </div>
  );
}
