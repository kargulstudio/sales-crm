import type { MouseEvent, ReactNode } from "react";
import Avatar from "@/components/_ui/avatar";
import Button from "@/components/_ui/button";
import { TableCell, TableRow } from "@/components/_ui/table";
import Money from "@/components/_common/money";
import SegmentBar from "@/components/_common/segment-bar";
import { MEETINGS_TARGET } from "@/data/team";
import { formatDate } from "@/lib/companies";
import { formatAttainment, type TeamMember } from "@/lib/team";
import { cn } from "@/lib/utils";
import {
  TEAM_CELL_CLASS,
  TEAM_ROW_CLASS,
  type TeamColumn,
  type TeamColumnKey,
} from "./table-columns";
import CalendarIcon from "@/public/assets/images/_common/calendar.svg";

type MemberRowProps = {
  member: TeamMember;
  columns: TeamColumn[];
  onOpen: () => void;
};

function stop(event: MouseEvent) {
  event.stopPropagation();
}

function Meter({ percent, label }: { percent: number; label: string }) {
  return (
    <span className="flex items-center gap-2">
      <SegmentBar percent={Math.min(100, percent)} className="w-[74px]" />
      <span className="min-w-[4ch] text-right">{label}</span>
    </span>
  );
}

function Dash() {
  return <span className="text-muted-foreground">—</span>;
}

export default function MemberRow({ member, columns, onOpen }: MemberRowProps) {
  const { owner, rollup } = member;

  const cells: Record<TeamColumnKey, ReactNode> = {
    rep: (
      <Button
        variant="ghost"
        size="none"
        onClick={onOpen}
        aria-label={`Open ${owner.name} profile`}
        className="text-foreground -mx-1.5 gap-1.5 px-1.5 py-1 font-normal"
      >
        <Avatar src={owner.avatar} alt="" />
        <span className="flex flex-col items-start gap-1">
          {owner.name}
          <span className="caption-style text-muted-foreground">
            {owner.role}
          </span>
        </span>
      </Button>
    ),
    quota: rollup.quota > 0 ? <Money value={rollup.quota} /> : <Dash />,
    closed: <Money value={rollup.closed} />,
    attainment:
      member.attainment === null ? (
        <Dash />
      ) : (
        <Meter
          percent={member.attainment}
          label={formatAttainment(member.attainment)}
        />
      ),
    commit: <Money value={rollup.commit} />,
    pipeline: <Money value={member.openPipeline} />,
    openDeals: member.openDeals,
    avgWin: member.avgWin === null ? <Dash /> : `${member.avgWin}%`,
    stale: member.stale,
    lastActivity: member.lastActivity ? (
      <span className="flex items-center gap-1">
        <CalendarIcon
          aria-hidden
          className="text-foreground size-3.5 shrink-0"
        />
        <span className="tabular-nums">{formatDate(member.lastActivity)}</span>
      </span>
    ) : (
      <Dash />
    ),
    meetings: (
      <Meter
        percent={member.meetingAttainment}
        label={`${member.meetings} / ${MEETINGS_TARGET}`}
      />
    ),
  };

  return (
    <TableRow
      role="row"
      onClick={onOpen}
      className={cn(TEAM_ROW_CLASS, "hover:bg-card/60 cursor-pointer")}
    >
      {columns.map((column) => (
        <TableCell
          key={column.key}
          role="cell"
          className={cn(TEAM_CELL_CLASS, column.className)}
          onClick={column.key === "rep" ? stop : undefined}
        >
          {cells[column.key]}
        </TableCell>
      ))}
    </TableRow>
  );
}
