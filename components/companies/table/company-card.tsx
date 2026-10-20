"use client";

import Avatar from "@/components/_ui/avatar";
import { Checkbox } from "@/components/_ui/checkbox";
import Tag from "@/components/_ui/tag";
import SegmentBar from "@/components/_common/segment-bar";
import CompanyLogo from "@/components/companies/company-logo";
import { TAG_TONES, ownerByName, type Company } from "@/data/companies";
import { formatDate, formatMoney, splitTags } from "@/lib/companies";
import { cn } from "@/lib/utils";

type CompanyCardProps = {
  company: Company;
  index: number;
  cursor: boolean;
  selected: boolean;
  active: boolean;
  onToggle: () => void;
  onOpen: () => void;
};

export default function CompanyCard({
  company,
  index,
  cursor,
  selected,
  active,
  onToggle,
  onOpen,
}: CompanyCardProps) {
  const owner = ownerByName(company.owner);
  const { visible, hidden } = splitTags(company.tags);
  const [first, second] = visible;

  return (
    <li
      tabIndex={-1}
      data-row-index={index}
      data-cursor={cursor}
      data-active={active || selected}
      className="border-border short:py-2.5 before:bg-selected relative flex scroll-mb-16 gap-3 border-b px-4 py-3.5 outline-none before:absolute before:inset-y-0 before:left-0 before:w-0.5 before:opacity-0 data-[active=true]:bg-[color-mix(in_srgb,var(--primary)_12%,var(--background))] data-[cursor=true]:not-data-[active=true]:bg-[color-mix(in_srgb,var(--foreground)_4%,var(--background))] data-[cursor=true]:before:opacity-100"
    >
      <Checkbox
        checked={selected}
        onCheckedChange={onToggle}
        aria-label={`Select ${company.name}`}
        className="z-sticky relative mt-2"
      />
      <CompanyLogo company={company} size="md" />
      <div className="short:gap-1.5 flex min-w-0 flex-1 flex-col gap-2">
        <div className="flex items-baseline justify-between gap-3">
          <button
            type="button"
            onClick={onOpen}
            className="lead-style focus-visible:after:ring-ring truncate text-left font-medium outline-none after:absolute after:inset-0 focus-visible:after:ring-2 focus-visible:after:ring-inset"
          >
            {company.name}
          </button>
          <span className="lead-style shrink-0 tabular-nums">
            <span className="text-fg-tertiary">$</span>
            {formatMoney(company.pipelineValue)}
          </span>
        </div>
        <div className="flex items-center justify-between gap-3">
          <span className="@container flex min-w-0 flex-1 items-center gap-0.75">
            {first && (
              <Tag tone={TAG_TONES[first]} size="sm" className="min-w-0 shrink">
                <span className="truncate leading-normal">{first}</span>
              </Tag>
            )}
            {second && (
              <Tag
                tone={TAG_TONES[second]}
                size="sm"
                className="min-w-0 shrink @max-[12rem]:hidden"
              >
                <span className="truncate leading-normal">{second}</span>
              </Tag>
            )}
            {hidden > 0 && (
              <Tag
                tone="neutral"
                size="sm"
                className={cn(second && "@max-[12rem]:hidden")}
              >
                +{hidden}
              </Tag>
            )}
            {second && (
              <Tag tone="neutral" size="sm" className="@min-[12rem]:hidden">
                +{hidden + 1}
              </Tag>
            )}
          </span>
          <span className="caption-style flex shrink-0 items-center gap-1.5 tabular-nums">
            <SegmentBar percent={company.winProbability} className="w-12" />
            <span>
              <span className="inline-block min-w-[2ch] text-right">
                {company.winProbability}
              </span>
              %
            </span>
          </span>
        </div>
        <div className="caption-style text-fg-tertiary flex items-center gap-1.5">
          <Avatar src={owner.avatar} alt="" className="size-4" />
          <span className="max-w-1/2 shrink-0 truncate">{owner.name}</span>
          <span aria-hidden>·</span>
          <span className="shrink-0 tabular-nums">
            {formatDate(company.lastInteraction.date)}
          </span>
          <span aria-hidden>·</span>
          <span className="truncate">{company.lastInteraction.label}</span>
        </div>
      </div>
    </li>
  );
}
