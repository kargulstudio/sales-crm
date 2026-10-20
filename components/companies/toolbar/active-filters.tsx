"use client";

import Avatar from "@/components/_ui/avatar";
import Button from "@/components/_ui/button";
import { ownerByName } from "@/data/companies";
import { ALL_OWNERS, ANY_STAGE, DEFAULT_FILTERS } from "@/lib/companies";
import { useCompaniesStore } from "@/stores/companies-store";
import XIcon from "@/public/assets/images/companies/detail/x.svg";

type Chip = {
  key: string;
  label: string;
  value: string;
  avatar?: string;
  clear: () => void;
};

export default function ActiveFilters() {
  const owner = useCompaniesStore((state) => state.owner);
  const stage = useCompaniesStore((state) => state.stage);
  const activityWindow = useCompaniesStore((state) => state.activityWindow);
  const setOwner = useCompaniesStore((state) => state.setOwner);
  const setStage = useCompaniesStore((state) => state.setStage);
  const setActivityWindow = useCompaniesStore(
    (state) => state.setActivityWindow,
  );

  const chips: Chip[] = [];
  if (owner !== ALL_OWNERS) {
    chips.push({
      key: "owner",
      label: "Owner",
      value: owner,
      avatar: ownerByName(owner).avatar,
      clear: () => setOwner(ALL_OWNERS),
    });
  }
  if (stage !== ANY_STAGE) {
    chips.push({
      key: "stage",
      label: "Stage",
      value: stage,
      clear: () => setStage(ANY_STAGE),
    });
  }
  if (activityWindow !== DEFAULT_FILTERS.activityWindow) {
    chips.push({
      key: "activity",
      label: "Last activity",
      value: `${activityWindow} days`,
      clear: () => setActivityWindow(DEFAULT_FILTERS.activityWindow),
    });
  }

  if (chips.length === 0) return null;

  function clearAll() {
    useCompaniesStore.setState({
      owner: ALL_OWNERS,
      stage: ANY_STAGE,
      activityWindow: DEFAULT_FILTERS.activityWindow,
    });
  }

  return (
    <div
      role="group"
      aria-label="Active filters"
      className="short:flex-nowrap short:overflow-x-auto short:pb-2 scrollbar-none -mt-1 flex shrink-0 flex-wrap items-center gap-1.5 px-4 pb-3"
    >
      {chips.map((chip) => (
        <span
          key={chip.key}
          className="caption-style bg-secondary h-control-sm shadow-raised inline-flex shrink-0 items-center gap-1 rounded-full pr-0.5 pl-2.5"
        >
          <span className="text-fg-tertiary">{chip.label}</span>
          {chip.avatar && (
            <Avatar src={chip.avatar} alt="" className="ml-0.5 size-3.5" />
          )}
          <span className="text-foreground whitespace-nowrap">
            {chip.value}
          </span>
          <Button
            variant="ghost"
            size="icon-xs"
            aria-label={`Remove ${chip.label.toLowerCase()} filter`}
            onClick={chip.clear}
            className="ml-0.5"
          >
            <XIcon aria-hidden className="size-3" />
          </Button>
        </span>
      ))}
      <Button variant="ghost" size="xs" className="shrink-0" onClick={clearAll}>
        Clear all
      </Button>
    </div>
  );
}
