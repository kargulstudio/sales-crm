import type { MouseEvent } from "react";
import Button from "@/components/_ui/button";
import { Checkbox } from "@/components/_ui/checkbox";
import Tag from "@/components/_ui/tag";
import { TableCell, TableRow } from "@/components/_ui/table";
import SegmentBar from "@/components/_common/segment-bar";
import CompanyMark from "@/components/activities/company-mark";
import ContactInitials from "../contact-initials";
import ContactReach from "../contact-reach";
import type { Company } from "@/data/companies";
import type { Contact } from "@/data/contacts";
import { formatDate, formatMoney } from "@/lib/companies";
import {
  CONTACT_ROLE_TONES,
  engagementPercent,
  type ContactSummary,
} from "@/lib/contacts";
import { cn } from "@/lib/utils";
import {
  TABLE_CELL_CLASS,
  TABLE_ROW_CLASS,
  columnClass,
  type TableColumnKey,
} from "./table-columns";
import CalendarIcon from "@/public/assets/images/_common/calendar.svg";
import DotsIcon from "@/public/assets/images/companies/table/dots-horizontal.svg";

type ContactRowProps = {
  contact: Contact;
  company: Company | undefined;
  summary: ContactSummary;
  selected: boolean;
  active: boolean;
  onToggle: () => void;
  onOpen: () => void;
};

function cellClass(key: TableColumnKey) {
  return cn(TABLE_CELL_CLASS, columnClass(key));
}

function stop(event: MouseEvent) {
  event.stopPropagation();
}

export default function ContactRow({
  contact,
  company,
  summary,
  selected,
  active,
  onToggle,
  onOpen,
}: ContactRowProps) {
  return (
    <TableRow
      role="row"
      onClick={onOpen}
      data-active={active || selected}
      className={cn(
        TABLE_ROW_CLASS,
        "hover:bg-card/60 data-[active=true]:border-card data-[active=true]:bg-card cursor-pointer",
      )}
    >
      <TableCell role="cell" className={cellClass("name")}>
        <span className="flex items-center gap-5">
          <Checkbox
            checked={selected}
            onCheckedChange={onToggle}
            onClick={stop}
            aria-label={`Select ${contact.name}`}
          />
          <span className="flex items-center gap-2.5">
            <ContactInitials name={contact.name} />
            <span className="flex min-w-0 flex-col gap-1.5">
              <span>{contact.name}</span>
              <span className="caption-style text-subtle">{contact.title}</span>
            </span>
          </span>
        </span>
      </TableCell>
      <TableCell role="cell" className={cellClass("company")}>
        <span className="flex items-center gap-2">
          <CompanyMark company={company} className="size-6 rounded-md" />
          {company?.name ?? "Unknown"}
        </span>
      </TableCell>
      <TableCell role="cell" className={cellClass("role")}>
        <Tag tone={CONTACT_ROLE_TONES[contact.role]}>{contact.role}</Tag>
      </TableCell>
      <TableCell role="cell" className={cellClass("status")}>
        {summary.left ? (
          <Tag tone="neutral" size="sm">
            Left
          </Tag>
        ) : (
          <span className="text-muted-foreground">Active</span>
        )}
      </TableCell>
      <TableCell role="cell" className={cellClass("deals")}>
        {summary.openDeals > 0 ? (
          <span className="flex items-center gap-1">
            <span className="tabular-nums">{summary.openDeals}</span>
            <span aria-hidden className="mx-[3px] h-2 w-px bg-white/15" />
            <span className="text-muted-foreground">$</span>
            <span className="tabular-nums">
              {formatMoney(summary.openValue)}
            </span>
          </span>
        ) : (
          <span className="text-muted-foreground">—</span>
        )}
      </TableCell>
      <TableCell role="cell" className={cellClass("engagement")}>
        <span className="flex items-center gap-2">
          <SegmentBar
            percent={engagementPercent(summary.engagement)}
            className="w-[74px]"
          />
          <span className="w-[2ch] text-right">{summary.engagement}</span>
        </span>
      </TableCell>
      <TableCell role="cell" className={cellClass("lastTouch")}>
        {summary.lastTouch ? (
          <span className="flex items-center gap-1">
            <CalendarIcon
              aria-hidden
              className="text-foreground size-3.5 shrink-0"
            />
            <span className="tabular-nums">
              {formatDate(summary.lastTouch.date)}
            </span>
            <span aria-hidden className="mx-[3px] h-2 w-px bg-white/15" />
            {summary.lastTouch.label}
          </span>
        ) : (
          <span className="text-muted-foreground">—</span>
        )}
      </TableCell>
      <TableCell role="cell" className={cellClass("reach")} onClick={stop}>
        <ContactReach contact={contact} left={summary.left} />
      </TableCell>
      <TableCell role="cell" className={cellClass("action")} onClick={stop}>
        <Button
          variant="ghost"
          size="icon-sm"
          className={cn("text-foreground", active && "bg-white/6")}
          aria-label={`Open ${contact.name} details`}
          onClick={onOpen}
        >
          <DotsIcon aria-hidden className="size-3" />
        </Button>
      </TableCell>
    </TableRow>
  );
}
