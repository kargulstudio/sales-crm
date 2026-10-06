"use client";

import Button from "@/components/_ui/button";
import FilterMenu from "@/components/_common/filter-menu";
import MobileFilters from "./mobile-filters";
import {
  CLOSE_WINDOW_OPTIONS,
  DEAL_OWNER_OPTIONS,
  DEAL_SORT_MENU_OPTIONS,
  MOTION_OPTIONS,
  REGION_OPTIONS,
} from "./filter-options";
import {
  REGIONS,
  type CloseWindow,
  type DealSortKey,
  type Region,
} from "@/data/deals";
import { TODAY } from "@/lib/companies";
import { downloadCsv } from "@/lib/csv";
import { dealsCsvRows, visibleDeals, type DealScope } from "@/lib/deals";
import { useCompaniesStore } from "@/stores/companies-store";
import { useDealFilters, useDealsStore } from "@/stores/deals-store";
import ShareIcon from "@/public/assets/images/companies/toolbar/share.svg";
import PlusIcon from "@/public/assets/images/_common/plus.svg";

type DealsToolbarProps = {
  region?: Region;
};

export default function DealsToolbar({ region }: DealsToolbarProps) {
  const scope: DealScope = region ?? "all";
  const {
    sortBy,
    owner,
    motion,
    closeWindow,
    region: regionFilter,
  } = useDealFilters(scope);
  const setFilters = useDealsStore((state) => state.setFilters);
  const openNewDeal = useDealsStore((state) => state.openNewDeal);

  function exportCsv() {
    const { deals } = useDealsStore.getState();
    const { companies } = useCompaniesStore.getState();
    const visible = visibleDeals(deals, {
      sortBy,
      owner,
      motion,
      closeWindow,
      region: region ?? regionFilter,
    });
    downloadCsv(
      `deals-${TODAY}.csv`,
      dealsCsvRows(
        visible,
        (companyId) =>
          companies.find((company) => company.id === companyId)?.name ??
          companyId,
      ),
    );
  }

  return (
    <div className="flex shrink-0 flex-wrap items-center justify-between gap-2 px-4 py-4">
      <MobileFilters className="sm:hidden" region={region} />

      <div className="hidden min-w-0 flex-wrap gap-2 sm:flex">
        <FilterMenu
          label="Sort by"
          value={sortBy}
          options={DEAL_SORT_MENU_OPTIONS}
          onChange={(value) =>
            setFilters(scope, { sortBy: value as DealSortKey })
          }
        />
        <FilterMenu
          label="Filter"
          value={owner}
          options={DEAL_OWNER_OPTIONS}
          onChange={(value) => setFilters(scope, { owner: value })}
        />
        <FilterMenu
          label="Motion"
          value={motion}
          options={MOTION_OPTIONS}
          onChange={(value) => setFilters(scope, { motion: value })}
        />
        {!region && (
          <FilterMenu
            label="Region"
            value={regionFilter}
            options={REGION_OPTIONS}
            onChange={(value) => setFilters(scope, { region: value })}
          />
        )}
        <FilterMenu
          label="Close Date"
          value={closeWindow}
          options={CLOSE_WINDOW_OPTIONS}
          onChange={(value) =>
            setFilters(scope, { closeWindow: value as CloseWindow })
          }
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
          onClick={() => openNewDeal(region ?? REGIONS[0])}
        >
          <PlusIcon aria-hidden className="size-3" />
          New Deal
        </Button>
      </div>
    </div>
  );
}
