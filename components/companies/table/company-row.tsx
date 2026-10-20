"use client";

import type { MouseEvent } from "react";
import Avatar from "@/components/_ui/avatar";
import Button from "@/components/_ui/button";
import Tooltip from "@/components/_ui/tooltip";
import { Checkbox } from "@/components/_ui/checkbox";
import Tag from "@/components/_ui/tag";
import CompanyLogo from "@/components/companies/company-logo";
import { TableCell, TableRow } from "@/components/_ui/table";
import SegmentBar from "@/components/_common/segment-bar";
import Sparkline from "@/components/_common/sparkline";
import { TAG_TONES, ownerByName, type Company } from "@/data/companies";
import { formatDate, formatMoney, splitTags } from "@/lib/companies";
import { cn } from "@/lib/utils";
import {
  STICKY_CELL_CLASS,
  TABLE_CELL_CLASS,
  TABLE_ROW_CLASS,
  columnClass,
  type TableColumnKey,
} from "./table-columns";
import CalendarIcon from "@/public/assets/images/_common/calendar.svg";
import DotsIcon from "@/public/assets/images/companies/table/dots-horizontal.svg";

type CompanyRowProps = {
  company: Company;
  index: number;
  cursor: boolean;
  selected: boolean;
  active: boolean;
  onToggle: () => void;
  onOpen: () => void;
  onOpenOwner: () => void;
  sizer?: boolean;
};

function cellClass(key: TableColumnKey) {
  return cn(TABLE_CELL_CLASS, columnClass(key));
}

function stop(event: MouseEvent) {
  event.stopPropagation();
}

export default function CompanyRow({
  company,
  index,
  cursor,
  selected,
  active,
  onToggle,
  onOpen,
  onOpenOwner,
  sizer = false,
}: CompanyRowProps) {
  const owner = ownerByName(company.owner);
  const { visible, hidden } = splitTags(company.tags);

  return (
    <TableRow
      role="row"
      onClick={onOpen}
      tabIndex={-1}
      aria-hidden={sizer || undefined}
      inert={sizer || undefined}
      data-row-index={sizer ? undefined : index}
      data-cursor={cursor}
      data-active={active || selected}
      className={cn(
        TABLE_ROW_CLASS,
        sizer && "invisible h-0 overflow-hidden",
        "group/row bg-background cursor-pointer scroll-mt-9.5 scroll-mb-16 outline-none hover:bg-[color-mix(in_srgb,var(--foreground)_4%,var(--background))] data-[active=true]:bg-[color-mix(in_srgb,var(--primary)_12%,var(--background))] data-[cursor=true]:not-data-[active=true]:bg-[color-mix(in_srgb,var(--foreground)_4%,var(--background))]",
      )}
    >
      <TableCell
        role="cell"
        className={cn(
          cellClass("name"),
          STICKY_CELL_CLASS,
          "before:bg-selected before:absolute before:inset-y-0 before:left-0 before:w-0.5 before:opacity-0 group-data-[cursor=true]/row:before:opacity-100",
        )}
      >
        <span className="flex items-center gap-5">
          <Checkbox
            checked={selected}
            onCheckedChange={onToggle}
            onClick={stop}
            aria-label={`Select ${company.name}`}
          />
          <span className="flex items-center gap-2.5">
            <CompanyLogo company={company} size="xs" />
            {company.name}
          </span>
        </span>
      </TableCell>
      <TableCell role="cell" className={cellClass("segment")}>
        <span className="flex items-center gap-0.75">
          {visible.map((tag) => (
            <Tag key={tag} tone={TAG_TONES[tag]}>
              {tag}
            </Tag>
          ))}
          {hidden > 0 && (
            <Tag tone="neutral" size="sm">
              +{hidden}
            </Tag>
          )}
        </span>
      </TableCell>
      <TableCell role="cell" className={cellClass("owner")} onClick={stop}>
        <Button
          variant="ghost"
          size="inline"
          onClick={onOpenOwner}
          aria-label={`Open ${owner.name} profile`}
          className="text-foreground"
        >
          <Avatar src={owner.avatar} alt="" />
          {owner.name}
        </Button>
      </TableCell>
      <TableCell role="cell" className={cellClass("openDeals")}>
        {company.openDeals}
      </TableCell>
      <TableCell role="cell" className={cellClass("pipelineValue")}>
        <span className="flex items-center gap-1">
          <span className="text-fg-tertiary">$</span>
          {formatMoney(company.pipelineValue)}
        </span>
      </TableCell>
      <TableCell role="cell" className={cellClass("winProbability")}>
        <span className="flex items-center gap-2">
          <SegmentBar percent={company.winProbability} className="w-18.5" />
          <span className="w-[4ch] text-right">{company.winProbability}%</span>
        </span>
      </TableCell>
      <TableCell role="cell" className={cellClass("trend")}>
        <Sparkline values={company.trend} />
      </TableCell>
      <TableCell role="cell" className={cellClass("lastInteraction")}>
        <span className="flex items-center gap-1">
          <CalendarIcon
            aria-hidden
            className="text-foreground size-3.5 shrink-0"
          />
          <span className="w-12.5 shrink-0 tabular-nums">
            {formatDate(company.lastInteraction.date)}
          </span>
          <span aria-hidden className="bg-overlay-4 mx-0.75 h-2 w-px" />
          {company.lastInteraction.label}
        </span>
      </TableCell>
      <TableCell role="cell" className={cellClass("action")} onClick={stop}>
        <Tooltip content="Open details" side="left">
          <Button
            variant="ghost"
            size="icon-sm"
            className={cn("text-foreground -mr-1.5", active && "bg-overlay-2")}
            aria-label={`Open ${company.name} details`}
            onClick={onOpen}
          >
            <DotsIcon aria-hidden className="size-3" />
          </Button>
        </Tooltip>
      </TableCell>
    </TableRow>
  );
}
