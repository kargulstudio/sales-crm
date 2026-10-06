"use client";

import { useCommandState } from "cmdk";
import Asset from "@/components/_ui/asset";
import Avatar from "@/components/_ui/avatar";
import { CommandItem } from "@/components/_ui/command";
import Tag from "@/components/_ui/tag";
import SegmentBar from "@/components/_common/segment-bar";
import { TAG_TONES, ownerByName, type Company } from "@/data/companies";
import {
  formatDate,
  formatMoney,
  splitTags,
  type CompanySummary,
} from "@/lib/companies";
import { cn } from "@/lib/utils";
import CalendarIcon from "@/public/assets/images/_common/calendar.svg";

export const COMMAND_TABLE_GRID =
  "grid grid-cols-[minmax(0,1fr)_96px] gap-x-4 md:grid-cols-[minmax(0,1.1fr)_minmax(0,1.4fr)_minmax(0,1fr)_96px] lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1.5fr)_minmax(0,1.1fr)_96px_120px_minmax(0,1fr)]";

const HEADERS = [
  { label: "Company", className: "" },
  { label: "Segment & Stage", className: "hidden md:block" },
  { label: "Account owner", className: "hidden md:block" },
  { label: "Pipeline", className: "text-right" },
  { label: "Win probability", className: "hidden text-right lg:block" },
  { label: "Last interaction", className: "hidden lg:block" },
];

export function CommandTableHeader() {
  const count = useCommandState((state) => state.filtered.count);

  if (count === 0) return null;

  return (
    <div
      aria-hidden
      className={cn(
        COMMAND_TABLE_GRID,
        "caption-style border-line-strong text-subtle h-9 items-center border-b px-4",
      )}
    >
      {HEADERS.map((header) => (
        <span key={header.label} className={cn("truncate", header.className)}>
          {header.label}
        </span>
      ))}
    </div>
  );
}

type CommandCompanyRowProps = {
  company: Company;
  summary: CompanySummary;
  onSelect: () => void;
};

export function CommandCompanyRow({
  company,
  summary,
  onSelect,
}: CommandCompanyRowProps) {
  const owner = ownerByName(company.owner);
  const { visible, hidden } = splitTags(company.tags);

  return (
    <CommandItem
      value={company.id}
      keywords={[company.name, company.owner, ...company.tags]}
      onSelect={onSelect}
      className={cn(COMMAND_TABLE_GRID, "text-foreground h-11 gap-x-4")}
    >
      <span className="flex min-w-0 items-center gap-2.5">
        <span className="bg-muted flex size-6 shrink-0 items-center justify-center rounded-md shadow-[0px_0px_0px_1px_#232323]">
          {company.logo ? (
            <Asset
              type="image"
              src={company.logo}
              alt=""
              width={1}
              height={1}
              fit="contain"
              className="size-3.5"
            />
          ) : (
            <span className="caption-style text-soft">
              {company.name.slice(0, 1)}
            </span>
          )}
        </span>
        <span className="truncate">{company.name}</span>
      </span>

      <span className="hidden min-w-0 items-center gap-[3px] overflow-hidden md:flex">
        {visible.map((tag) => (
          <Tag key={tag} tone={TAG_TONES[tag]} size="sm">
            {tag}
          </Tag>
        ))}
        {hidden > 0 && (
          <Tag tone="neutral" size="sm">
            +{hidden}
          </Tag>
        )}
      </span>

      <span className="text-soft hidden min-w-0 items-center gap-1.5 md:flex">
        <Avatar src={owner.avatar} alt="" />
        <span className="truncate">{owner.name}</span>
      </span>

      <span className="flex items-center justify-end gap-1 tabular-nums">
        <span className="text-muted-foreground">$</span>
        {formatMoney(summary.pipelineValue)}
      </span>

      <span className="hidden items-center justify-end gap-2 tabular-nums lg:flex">
        <SegmentBar percent={summary.win ?? 0} className="w-[60px]" />
        <span className="w-[4ch] text-right">
          {summary.win === null ? "—" : `${summary.win}%`}
        </span>
      </span>

      <span className="text-soft hidden min-w-0 items-center gap-1 lg:flex">
        {summary.lastActivity ? (
          <>
            <CalendarIcon aria-hidden className="size-3.5 shrink-0" />
            <span className="shrink-0 tabular-nums">
              {formatDate(summary.lastActivity.date)}
            </span>
            <span
              aria-hidden
              className="mx-[3px] h-2 w-px shrink-0 bg-white/15"
            />
            <span className="truncate">{summary.lastActivity.label}</span>
          </>
        ) : (
          "—"
        )}
      </span>
    </CommandItem>
  );
}
