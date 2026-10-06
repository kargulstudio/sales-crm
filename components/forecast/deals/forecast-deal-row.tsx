import type { MouseEvent } from "react";
import Avatar from "@/components/_ui/avatar";
import Button from "@/components/_ui/button";
import Tag from "@/components/_ui/tag";
import { TableCell, TableRow } from "@/components/_ui/table";
import FilterMenu from "@/components/_common/filter-menu";
import { ownerByName } from "@/data/companies";
import type { Deal } from "@/data/deals";
import { OPEN_CATEGORIES, type ForecastCategory } from "@/data/forecast";
import { formatDate, formatMoney } from "@/lib/companies";
import {
  CATEGORY_TONES,
  STAGE_TONES,
  canEditCategory,
  dealCategory,
} from "@/lib/forecast";
import { cn } from "@/lib/utils";
import {
  DEAL_CELL_CLASS,
  DEAL_ROW_CLASS,
  dealColumnClass,
  type DealColumnKey,
} from "./deal-columns";
import CalendarIcon from "@/public/assets/images/_common/calendar.svg";

const CATEGORY_MENU_OPTIONS = OPEN_CATEGORIES.map((category) => ({
  value: category,
  label: category,
}));

type ForecastDealRowProps = {
  deal: Deal;
  companyName: string;
  active: boolean;
  onOpen: () => void;
  onSetCategory: (category: ForecastCategory) => void;
};

function cellClass(key: DealColumnKey) {
  return cn(DEAL_CELL_CLASS, dealColumnClass(key));
}

function stop(event: MouseEvent) {
  event.stopPropagation();
}

export default function ForecastDealRow({
  deal,
  companyName,
  active,
  onOpen,
  onSetCategory,
}: ForecastDealRowProps) {
  const owner = ownerByName(deal.owner);
  const category = dealCategory(deal);

  return (
    <TableRow
      role="row"
      onClick={onOpen}
      data-active={active}
      className={cn(
        DEAL_ROW_CLASS,
        "hover:bg-card/60 data-[active=true]:border-card data-[active=true]:bg-card cursor-pointer",
      )}
    >
      <TableCell role="cell" className={cellClass("name")} onClick={stop}>
        <Button
          variant="ghost"
          size="none"
          onClick={onOpen}
          aria-label={`Open ${deal.name}`}
          className="text-foreground -mx-1.5 px-1.5 py-1 font-normal"
        >
          {deal.name}
        </Button>
      </TableCell>
      <TableCell role="cell" className={cellClass("company")}>
        {companyName}
      </TableCell>
      <TableCell role="cell" className={cellClass("stage")}>
        <Tag tone={STAGE_TONES[deal.stage]} size="sm">
          {deal.stage}
        </Tag>
      </TableCell>
      <TableCell role="cell" className={cellClass("value")}>
        <span className="flex items-center gap-1">
          <span className="text-muted-foreground">$</span>
          {formatMoney(deal.value)}
        </span>
      </TableCell>
      <TableCell role="cell" className={cellClass("closeDate")}>
        <span className="flex items-center gap-1">
          <CalendarIcon
            aria-hidden
            className="text-foreground size-3.5 shrink-0"
          />
          <span className="tabular-nums">{formatDate(deal.closeDate)}</span>
        </span>
      </TableCell>
      <TableCell role="cell" className={cellClass("owner")}>
        <Avatar src={owner.avatar} alt={owner.name} />
      </TableCell>
      <TableCell role="cell" className={cellClass("category")} onClick={stop}>
        {canEditCategory(deal) ? (
          <FilterMenu
            value={category}
            options={CATEGORY_MENU_OPTIONS}
            onChange={(value) => onSetCategory(value as ForecastCategory)}
          />
        ) : (
          <Tag tone={CATEGORY_TONES[category]} size="sm">
            {category}
          </Tag>
        )}
      </TableCell>
    </TableRow>
  );
}
