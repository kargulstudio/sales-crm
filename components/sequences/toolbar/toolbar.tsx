"use client";

import Button from "@/components/_ui/button";
import FilterMenu from "@/components/_common/filter-menu";
import MobileFilters from "./mobile-filters";
import {
  SEQUENCE_OWNER_OPTIONS,
  SEQUENCE_SORT_MENU_OPTIONS,
  SEQUENCE_STATUS_OPTIONS,
} from "./filter-options";
import { TODAY } from "@/lib/companies";
import { downloadCsv } from "@/lib/csv";
import { sequencesCsvRows, type SequenceSortKey } from "@/lib/sequences";
import {
  useSequenceStats,
  useSequencesStore,
  useVisibleSequences,
} from "@/stores/sequences-store";
import PlusIcon from "@/public/assets/images/_common/plus.svg";
import ShareIcon from "@/public/assets/images/companies/toolbar/share.svg";

export default function SequencesToolbar() {
  const sortBy = useSequencesStore((state) => state.sortBy);
  const status = useSequencesStore((state) => state.status);
  const owner = useSequencesStore((state) => state.owner);
  const setSortBy = useSequencesStore((state) => state.setSortBy);
  const setStatusFilter = useSequencesStore((state) => state.setStatusFilter);
  const setOwner = useSequencesStore((state) => state.setOwner);
  const setNewSequenceOpen = useSequencesStore(
    (state) => state.setNewSequenceOpen,
  );
  const stats = useSequenceStats();
  const visible = useVisibleSequences();

  function exportCsv() {
    downloadCsv(
      `email-sequences-${TODAY}.csv`,
      sequencesCsvRows(visible, stats),
    );
  }

  return (
    <div className="flex shrink-0 flex-wrap items-center justify-between gap-2 px-4 py-4">
      <MobileFilters className="sm:hidden" />

      <div className="hidden min-w-0 flex-wrap gap-2 sm:flex">
        <FilterMenu
          label="Sort by"
          value={sortBy}
          options={SEQUENCE_SORT_MENU_OPTIONS}
          onChange={(value) => setSortBy(value as SequenceSortKey)}
        />
        <FilterMenu
          label="Status"
          value={status}
          options={SEQUENCE_STATUS_OPTIONS}
          onChange={setStatusFilter}
        />
        <FilterMenu
          label="Owner"
          value={owner}
          options={SEQUENCE_OWNER_OPTIONS}
          onChange={setOwner}
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
          onClick={() => setNewSequenceOpen(true)}
        >
          <PlusIcon aria-hidden className="size-3" />
          New Sequence
        </Button>
      </div>
    </div>
  );
}
