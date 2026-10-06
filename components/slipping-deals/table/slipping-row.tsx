"use client";

import Avatar from "@/components/_ui/avatar";
import Button from "@/components/_ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/_ui/dropdown-menu";
import Tag from "@/components/_ui/tag";
import { TableCell, TableRow } from "@/components/_ui/table";
import Money from "@/components/_common/money";
import { ownerByName } from "@/data/companies";
import { LOST_STAGE } from "@/data/deals";
import { formatDate } from "@/lib/companies";
import { STAGE_TONES } from "@/lib/forecast";
import type { SlippingDeal } from "@/lib/slipping";
import { useHandoff } from "@/lib/use-handoff";
import { cn } from "@/lib/utils";
import { useActivitiesStore } from "@/stores/activities-store";
import { useCompaniesStore } from "@/stores/companies-store";
import { useDealsStore } from "@/stores/deals-store";
import {
  SLIPPING_CELL_CLASS,
  SLIPPING_ROW_CLASS,
  slippingColumnClass,
  type SlippingColumnKey,
} from "./table-columns";
import CalendarIcon from "@/public/assets/images/_common/calendar.svg";
import DotsIcon from "@/public/assets/images/companies/table/dots-horizontal.svg";

type SlippingRowProps = {
  row: SlippingDeal;
  companyName: string;
  active: boolean;
};

const REASON_TONES = {
  Pushed: "amber",
  "Past due": "red",
  Both: "red",
} as const;

function cellClass(key: SlippingColumnKey) {
  return cn(SLIPPING_CELL_CLASS, slippingColumnClass(key));
}

export default function SlippingRow({
  row,
  companyName,
  active,
}: SlippingRowProps) {
  const { deal } = row;
  const owner = ownerByName(deal.owner);
  const openDetail = useDealsStore((state) => state.openDetail);
  const openPush = useDealsStore((state) => state.openPush);
  const moveDeal = useDealsStore((state) => state.moveDeal);
  const openLog = useActivitiesStore((state) => state.openLog);
  const openProfile = useCompaniesStore((state) => state.openProfile);
  const handoff = useHandoff();

  return (
    <TableRow
      role="row"
      data-active={active}
      className={cn(
        SLIPPING_ROW_CLASS,
        "hover:bg-card/60 data-[active=true]:border-card data-[active=true]:bg-card",
      )}
    >
      <TableCell role="cell" className={cellClass("deal")}>
        <Button
          variant="ghost"
          size="none"
          onClick={() => openDetail(deal.id)}
          aria-label={`Open ${deal.name}`}
          className="text-foreground -mx-1.5 px-1.5 py-1 font-normal"
        >
          <span className="flex flex-col items-start gap-1">
            {deal.name}
            <span className="caption-style text-muted-foreground">
              {companyName}
            </span>
          </span>
        </Button>
      </TableCell>
      <TableCell role="cell" className={cellClass("owner")}>
        <Button
          variant="ghost"
          size="none"
          onClick={() => openProfile(owner.name)}
          aria-label={`Open ${owner.name} profile`}
        >
          <Avatar src={owner.avatar} alt="" />
        </Button>
      </TableCell>
      <TableCell role="cell" className={cellClass("stage")}>
        <Tag tone={STAGE_TONES[deal.stage]} size="sm">
          {deal.stage}
        </Tag>
      </TableCell>
      <TableCell role="cell" className={cellClass("value")}>
        <Money value={row.value} />
      </TableCell>
      <TableCell role="cell" className={cellClass("win")}>
        {row.win}%
      </TableCell>
      <TableCell role="cell" className={cellClass("closeDate")}>
        <span className="flex flex-col items-start gap-1">
          <span className="flex items-center gap-1">
            <CalendarIcon
              aria-hidden
              className="text-foreground size-3.5 shrink-0"
            />
            <span className="tabular-nums">{formatDate(deal.closeDate)}</span>
          </span>
          {row.firstFrom && (
            <span className="caption-style text-muted-foreground tabular-nums">
              was {formatDate(row.firstFrom)}
            </span>
          )}
        </span>
      </TableCell>
      <TableCell role="cell" className={cellClass("slips")}>
        <Tag tone={row.slips > 0 ? "amber" : "neutral"} size="sm">
          {row.slips}
        </Tag>
      </TableCell>
      <TableCell role="cell" className={cellClass("daysSlipped")}>
        {row.daysSlipped > 0 ? (
          `${row.daysSlipped}d`
        ) : (
          <span className="text-muted-foreground">—</span>
        )}
      </TableCell>
      <TableCell role="cell" className={cellClass("reason")}>
        <span className="flex flex-col items-start gap-1">
          <Tag tone={REASON_TONES[row.reason]} size="sm">
            {row.reason}
          </Tag>
          {row.pastDueDays > 0 && (
            <span className="caption-style text-muted-foreground tabular-nums">
              {row.pastDueDays}d overdue
            </span>
          )}
        </span>
      </TableCell>
      <TableCell role="cell" className={cellClass("action")}>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon-sm"
              className="text-foreground data-[state=open]:bg-white/6"
              aria-label={`Actions for ${deal.name}`}
            >
              <DotsIcon aria-hidden className="size-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            onCloseAutoFocus={handoff.onCloseAutoFocus}
          >
            <DropdownMenuItem
              onSelect={() =>
                handoff.run(
                  () => {},
                  () => openPush(deal.id),
                )
              }
            >
              Push close date
            </DropdownMenuItem>
            <DropdownMenuItem
              onSelect={() =>
                handoff.run(
                  () => {},
                  () => openLog(deal.id),
                )
              }
            >
              Log activity
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => moveDeal(deal.id, LOST_STAGE)}>
              Mark lost
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onSelect={() =>
                handoff.run(
                  () => {},
                  () => openDetail(deal.id),
                )
              }
            >
              Open deal
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  );
}
