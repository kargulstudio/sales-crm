"use client";

import Button from "@/components/_ui/button";
import FilterMenu from "@/components/_common/filter-menu";
import MobileFilters from "./mobile-filters";
import { QUARTER_OPTIONS, sortOptions } from "./filter-options";
import type { Team, TeamSortKey } from "@/data/team";
import { TODAY } from "@/lib/companies";
import { downloadCsv } from "@/lib/csv";
import { resolveTeamSort, teamCsvRows } from "@/lib/team";
import { useTeamMembers, useTeamStore } from "@/stores/team-store";
import ShareIcon from "@/public/assets/images/companies/toolbar/share.svg";

type TeamToolbarProps = {
  team: Team;
};

export default function TeamToolbar({ team }: TeamToolbarProps) {
  const period = useTeamStore((state) => state.period);
  const sortBy = useTeamStore((state) => state.sortBy);
  const setPeriod = useTeamStore((state) => state.setPeriod);
  const setSortBy = useTeamStore((state) => state.setSortBy);
  const members = useTeamMembers(team);

  function exportCsv() {
    const slug = team.toLowerCase().replace(/\s+/g, "-");
    downloadCsv(
      `${slug}-${period}-${TODAY}.csv`,
      teamCsvRows(members, team, period),
    );
  }

  return (
    <div className="flex shrink-0 flex-wrap items-center justify-between gap-2 px-4 py-4">
      <MobileFilters team={team} className="sm:hidden" />

      <div className="hidden min-w-0 flex-wrap gap-2 sm:flex">
        <FilterMenu
          label="Quarter"
          value={period}
          options={QUARTER_OPTIONS}
          onChange={setPeriod}
        />
        <FilterMenu
          label="Sort by"
          value={resolveTeamSort(team, sortBy)}
          options={sortOptions(team)}
          onChange={(value) => setSortBy(value as TeamSortKey)}
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
