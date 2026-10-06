"use client";

import Button from "@/components/_ui/button";
import FilterMenu from "@/components/_common/filter-menu";
import MobileFilters from "./mobile-filters";
import {
  ACTIVITY_OWNER_OPTIONS,
  TYPE_OPTIONS,
  WINDOW_OPTIONS,
  useCompanyOptions,
} from "./filter-options";
import { TODAY } from "@/lib/companies";
import { downloadCsv } from "@/lib/csv";
import { activitiesCsvRows } from "@/lib/activities";
import {
  useActivitiesStore,
  useVisibleActivities,
} from "@/stores/activities-store";
import { useCompanyMap } from "@/stores/companies-store";
import PlusIcon from "@/public/assets/images/_common/plus.svg";
import ShareIcon from "@/public/assets/images/companies/toolbar/share.svg";

export default function ActivitiesToolbar() {
  const type = useActivitiesStore((state) => state.type);
  const owner = useActivitiesStore((state) => state.owner);
  const company = useActivitiesStore((state) => state.company);
  const window = useActivitiesStore((state) => state.window);
  const setType = useActivitiesStore((state) => state.setType);
  const setOwner = useActivitiesStore((state) => state.setOwner);
  const setCompany = useActivitiesStore((state) => state.setCompany);
  const setWindow = useActivitiesStore((state) => state.setWindow);
  const openLog = useActivitiesStore((state) => state.openLog);
  const companyOptions = useCompanyOptions();
  const events = useVisibleActivities();
  const companyById = useCompanyMap();

  function exportCsv() {
    downloadCsv(
      `activities-${TODAY}.csv`,
      activitiesCsvRows(
        events,
        (companyId) => companyById.get(companyId)?.name ?? companyId,
      ),
    );
  }

  return (
    <div className="flex shrink-0 flex-wrap items-center justify-between gap-2 px-4 py-4">
      <MobileFilters className="sm:hidden" />

      <div className="hidden min-w-0 flex-wrap gap-2 sm:flex">
        <FilterMenu
          label="Type"
          value={type}
          options={TYPE_OPTIONS}
          onChange={setType}
        />
        <FilterMenu
          label="Owner"
          value={owner}
          options={ACTIVITY_OWNER_OPTIONS}
          onChange={setOwner}
        />
        <FilterMenu
          label="Company"
          value={company}
          options={companyOptions}
          onChange={setCompany}
        />
        <FilterMenu
          label="Window"
          value={window}
          options={WINDOW_OPTIONS}
          onChange={setWindow}
        />
      </div>

      <div className="flex shrink-0 items-center gap-1">
        <Button variant="secondary" size="sm" onClick={exportCsv}>
          <ShareIcon aria-hidden className="size-3" />
          Export
        </Button>
        <Button variant="primary" size="sm" onClick={() => openLog()}>
          <PlusIcon aria-hidden className="size-3" />
          Log activity
        </Button>
      </div>
    </div>
  );
}
