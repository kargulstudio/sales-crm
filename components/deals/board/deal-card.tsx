"use client";

import type { DragEvent, MouseEvent } from "react";
import Asset from "@/components/_ui/asset";
import Avatar from "@/components/_ui/avatar";
import Button from "@/components/_ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/_ui/dropdown-menu";
import Tag from "@/components/_ui/tag";
import SegmentBar from "@/components/_common/segment-bar";
import { TAG_TONES, ownerByName, type Company } from "@/data/companies";
import { DEAL_STAGES, type Deal, type DealStage } from "@/data/deals";
import { formatDate, formatMoney } from "@/lib/companies";
import { dealWin, isManualWin, isStale, lastActivityDays } from "@/lib/deals";
import { useDealsStore } from "@/stores/deals-store";
import CalendarIcon from "@/public/assets/images/_common/calendar.svg";
import ClockIcon from "@/public/assets/images/companies/detail/clock.svg";
import DotsIcon from "@/public/assets/images/companies/table/dots-horizontal.svg";

type DealCardProps = {
  deal: Deal;
  company: Company | undefined;
  dragging: boolean;
  onDragStart: (event: DragEvent<HTMLElement>) => void;
  onDragEnd: () => void;
};

function stop(event: MouseEvent) {
  event.stopPropagation();
}

export default function DealCard({
  deal,
  company,
  dragging,
  onDragStart,
  onDragEnd,
}: DealCardProps) {
  const openDetail = useDealsStore((state) => state.openDetail);
  const moveDeal = useDealsStore((state) => state.moveDeal);
  const owner = ownerByName(deal.owner);
  const companyName = company?.name ?? "Unknown company";
  const win = dealWin(deal);

  return (
    <article
      draggable
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onClick={() => openDetail(deal.id)}
      data-dragging={dragging}
      className="bg-card ease-power3-out flex cursor-pointer flex-col gap-3 rounded-lg p-3 shadow-[0px_4px_4px_0px_rgba(42,42,42,0.32),0px_0px_0px_1px_#0e0e0e,inset_0px_1px_0px_0px_rgba(255,255,255,0.08),inset_0px_0px_0px_1px_rgba(255,255,255,0.08)] transition-[background-color,opacity] duration-150 hover:bg-[#252525] data-[dragging=true]:opacity-40"
    >
      <div className="flex items-center justify-between gap-2">
        <span className="caption-style flex min-w-0 items-center gap-2">
          <span className="bg-muted flex size-6 shrink-0 items-center justify-center rounded-md">
            {company?.logo ? (
              <Asset
                type="image"
                src={company.logo}
                alt=""
                width={1}
                height={1}
                fit="contain"
                className="size-4"
              />
            ) : (
              <span className="caption-style text-soft">
                {companyName.slice(0, 1)}
              </span>
            )}
          </span>
          <span className="text-soft truncate">{companyName}</span>
        </span>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon-sm"
              className="text-foreground -mr-1 data-[state=open]:bg-white/6"
              aria-label={`Actions for ${deal.name}`}
              onClick={stop}
            >
              <DotsIcon aria-hidden className="size-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" onClick={stop}>
            <DropdownMenuItem onSelect={() => openDetail(deal.id)}>
              Open deal
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuLabel>Move to</DropdownMenuLabel>
            <DropdownMenuRadioGroup
              value={deal.stage}
              onValueChange={(value) => moveDeal(deal.id, value as DealStage)}
            >
              {DEAL_STAGES.map((stage) => (
                <DropdownMenuRadioItem key={stage} value={stage}>
                  {stage}
                </DropdownMenuRadioItem>
              ))}
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <h3 className="line-clamp-2">{deal.name}</h3>

      <div className="flex items-center justify-between gap-2">
        <span className="lead-style text-foreground font-medium tabular-nums">
          ${formatMoney(deal.value)}
        </span>
        <Tag tone={TAG_TONES[deal.motion]} size="sm">
          {deal.motion}
        </Tag>
      </div>

      <div className="caption-style flex items-center gap-2">
        <SegmentBar percent={win} className="flex-1" />
        {isManualWin(deal) && (
          <Tag tone="neutral" size="sm">
            Manual
          </Tag>
        )}
        <span className="w-[4ch] text-right tabular-nums">{win}%</span>
      </div>

      <div className="caption-style flex items-center justify-between gap-2">
        <span className="flex min-w-0 items-center gap-2">
          <Avatar src={owner.avatar} alt={owner.name} className="size-4" />
          <span className="text-soft flex items-center gap-1 tabular-nums">
            <CalendarIcon aria-hidden className="size-3 shrink-0" />
            {formatDate(deal.closeDate)}
          </span>
        </span>
        {isStale(deal) && (
          <span
            className="text-warning flex shrink-0 items-center gap-1"
            title={`No activity for ${lastActivityDays(deal)} days`}
          >
            <ClockIcon aria-hidden className="size-3" />
            Stale
          </span>
        )}
      </div>
    </article>
  );
}
