import type { MouseEvent } from "react";
import Avatar from "@/components/_ui/avatar";
import Button from "@/components/_ui/button";
import Tag from "@/components/_ui/tag";
import { TableCell, TableRow } from "@/components/_ui/table";
import SegmentBar from "@/components/_common/segment-bar";
import { ownerByName } from "@/data/companies";
import type { Sequence } from "@/data/sequences";
import { formatDate } from "@/lib/companies";
import {
  SEQUENCE_STATUS_TONES,
  formatRate,
  stepCountLabel,
  type SequenceStats,
} from "@/lib/sequences";
import { cn } from "@/lib/utils";
import {
  TABLE_CELL_CLASS,
  TABLE_ROW_CLASS,
  columnClass,
  type TableColumnKey,
} from "./table-columns";
import CalendarIcon from "@/public/assets/images/_common/calendar.svg";
import DotsIcon from "@/public/assets/images/companies/table/dots-horizontal.svg";

type SequenceRowProps = {
  sequence: Sequence;
  stats: SequenceStats;
  active: boolean;
  onOpen: () => void;
  onOpenOwner: () => void;
};

function cellClass(key: TableColumnKey) {
  return cn(TABLE_CELL_CLASS, columnClass(key));
}

function stop(event: MouseEvent) {
  event.stopPropagation();
}

export default function SequenceRow({
  sequence,
  stats,
  active,
  onOpen,
  onOpenOwner,
}: SequenceRowProps) {
  const owner = ownerByName(sequence.owner);

  return (
    <TableRow
      role="row"
      onClick={onOpen}
      data-active={active}
      className={cn(
        TABLE_ROW_CLASS,
        "hover:bg-card/60 data-[active=true]:border-card data-[active=true]:bg-card cursor-pointer",
      )}
    >
      <TableCell role="cell" className={cellClass("name")}>
        <span className="flex min-w-0 flex-col gap-1.5">
          <span>{sequence.name}</span>
          <span className="caption-style text-subtle">
            {stepCountLabel(sequence.steps.length)}
          </span>
        </span>
      </TableCell>
      <TableCell role="cell" className={cellClass("owner")} onClick={stop}>
        <Button
          variant="ghost"
          size="none"
          onClick={onOpenOwner}
          aria-label={`Open ${owner.name} profile`}
          className="text-foreground -mx-1.5 gap-1.5 px-1.5 py-1 font-normal"
        >
          <Avatar src={owner.avatar} alt="" />
          {owner.name}
        </Button>
      </TableCell>
      <TableCell role="cell" className={cellClass("status")}>
        <Tag tone={SEQUENCE_STATUS_TONES[sequence.status]}>
          {sequence.status}
        </Tag>
      </TableCell>
      <TableCell role="cell" className={cellClass("enrolled")}>
        {stats.enrolled}
      </TableCell>
      <TableCell role="cell" className={cellClass("active")}>
        {stats.active}
      </TableCell>
      <TableCell role="cell" className={cellClass("openRate")}>
        <span className="flex items-center gap-2">
          <SegmentBar percent={stats.openRate ?? 0} className="w-[74px]" />
          <span className="w-[4ch] text-right">
            {formatRate(stats.openRate)}
          </span>
        </span>
      </TableCell>
      <TableCell role="cell" className={cellClass("replyRate")}>
        <span className="flex items-center gap-2">
          <SegmentBar percent={stats.replyRate ?? 0} className="w-[74px]" />
          <span className="w-[4ch] text-right">
            {formatRate(stats.replyRate)}
          </span>
        </span>
      </TableCell>
      <TableCell role="cell" className={cellClass("meetings")}>
        {stats.meetings}
      </TableCell>
      <TableCell role="cell" className={cellClass("lastSent")}>
        {stats.lastSent ? (
          <span className="flex items-center gap-1">
            <CalendarIcon
              aria-hidden
              className="text-foreground size-3.5 shrink-0"
            />
            <span className="tabular-nums">{formatDate(stats.lastSent)}</span>
          </span>
        ) : (
          <span className="text-muted-foreground">—</span>
        )}
      </TableCell>
      <TableCell role="cell" className={cellClass("action")} onClick={stop}>
        <Button
          variant="ghost"
          size="icon-sm"
          className={cn("text-foreground", active && "bg-white/6")}
          aria-label={`Open ${sequence.name} details`}
          onClick={onOpen}
        >
          <DotsIcon aria-hidden className="size-3" />
        </Button>
      </TableCell>
    </TableRow>
  );
}
