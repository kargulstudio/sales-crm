"use client";

import Button from "@/components/_ui/button";
import FilterMenu from "@/components/_common/filter-menu";
import MobileFilters from "./mobile-filters";
import { Q1_TEAM_OPTIONS, q1OwnerOptions } from "./filter-options";
import { TODAY } from "@/lib/companies";
import { downloadCsv } from "@/lib/csv";
import { q1CsvRows } from "@/lib/q1-forecast";
import { useCompaniesStore } from "@/stores/companies-store";
import { useDealsStore } from "@/stores/deals-store";
import { useQ1ForecastStore, useQ1Report } from "@/stores/q1-forecast-store";
import ShareIcon from "@/public/assets/images/companies/toolbar/share.svg";

export default function Q1Toolbar() {
  const owner = useQ1ForecastStore((state) => state.owner);
  const team = useQ1ForecastStore((state) => state.team);
  const setOwner = useQ1ForecastStore((state) => state.setOwner);
  const setTeam = useQ1ForecastStore((state) => state.setTeam);
  const { deals } = useQ1Report();
  const allDeals = useDealsStore((state) => state.deals);

  function exportCsv() {
    const { companies } = useCompaniesStore.getState();
    downloadCsv(
      `q1-forecast-${TODAY}.csv`,
      q1CsvRows(
        deals,
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
          label="Owner"
          value={owner}
          options={q1OwnerOptions(allDeals, team)}
          onChange={setOwner}
        />
        <FilterMenu
          label="Team"
          value={team}
          options={Q1_TEAM_OPTIONS}
          onChange={setTeam}
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
