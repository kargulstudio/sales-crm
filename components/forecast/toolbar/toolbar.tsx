"use client";

import Button from "@/components/_ui/button";
import FilterMenu from "@/components/_common/filter-menu";
import MobileFilters from "./mobile-filters";
import {
  CATEGORY_OPTIONS,
  FORECAST_OWNER_OPTIONS,
  PERIOD_OPTIONS,
} from "./filter-options";
import { TODAY } from "@/lib/companies";
import { downloadCsv } from "@/lib/csv";
import { filterForecastDeals, forecastCsvRows } from "@/lib/forecast";
import { useCompaniesStore } from "@/stores/companies-store";
import { useDealsStore } from "@/stores/deals-store";
import { useForecastStore } from "@/stores/forecast-store";
import ShareIcon from "@/public/assets/images/companies/toolbar/share.svg";
import TargetIcon from "@/public/assets/images/companies/sidebar/target-05.svg";

export default function ForecastToolbar() {
  const period = useForecastStore((state) => state.period);
  const owner = useForecastStore((state) => state.owner);
  const category = useForecastStore((state) => state.category);
  const setPeriod = useForecastStore((state) => state.setPeriod);
  const setOwner = useForecastStore((state) => state.setOwner);
  const setCategory = useForecastStore((state) => state.setCategory);
  const setSubmitOpen = useForecastStore((state) => state.setSubmitOpen);

  function exportCsv() {
    const { deals } = useDealsStore.getState();
    const { companies } = useCompaniesStore.getState();
    const visible = filterForecastDeals(deals, { period, owner, category });
    downloadCsv(
      `forecast-${period}-${TODAY}.csv`,
      forecastCsvRows(
        visible,
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
          label="Period"
          value={period}
          options={PERIOD_OPTIONS}
          onChange={setPeriod}
        />
        <FilterMenu
          label="Owner"
          value={owner}
          options={FORECAST_OWNER_OPTIONS}
          onChange={setOwner}
        />
        <FilterMenu
          label="Category"
          value={category}
          options={CATEGORY_OPTIONS}
          onChange={setCategory}
        />
      </div>

      <div className="flex shrink-0 items-center gap-1">
        <Button variant="secondary" size="sm" onClick={exportCsv}>
          <ShareIcon aria-hidden className="size-3" />
          Export
        </Button>
        <Button variant="primary" size="sm" onClick={() => setSubmitOpen(true)}>
          <TargetIcon aria-hidden className="size-3" />
          Submit forecast
        </Button>
      </div>
    </div>
  );
}
