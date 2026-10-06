import Avatar from "@/components/_ui/avatar";
import Button from "@/components/_ui/button";
import Tag from "@/components/_ui/tag";
import { TableCell, TableRow } from "@/components/_ui/table";
import { ownerByName } from "@/data/companies";
import type { Deal } from "@/data/deals";
import { formatDate, formatMoney } from "@/lib/companies";
import { dealWin } from "@/lib/deals";
import { CATEGORY_TONES, STAGE_TONES, dealCategory } from "@/lib/forecast";
import { cn } from "@/lib/utils";
import {
  DEAL_CELL_CLASS,
  DEAL_ROW_CLASS,
  dealColumnClass,
  type DealColumnKey,
} from "./deal-columns";
import CalendarIcon from "@/public/assets/images/_common/calendar.svg";

type DealRowProps = {
  deal: Deal;
  companyName: string;
  active: boolean;
  onOpen: () => void;
};

function cellClass(key: DealColumnKey) {
  return cn(DEAL_CELL_CLASS, dealColumnClass(key));
}

export default function DealRow({
  deal,
  companyName,
  active,
  onOpen,
}: DealRowProps) {
  const owner = ownerByName(deal.owner);
  const category = dealCategory(deal);

  return (
    <TableRow
      role="row"
      data-active={active}
      className={cn(
        DEAL_ROW_CLASS,
        "hover:bg-card/60 data-[active=true]:border-card data-[active=true]:bg-card",
      )}
    >
      <TableCell role="cell" className={cellClass("name")}>
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
      <TableCell role="cell" className={cellClass("owner")}>
        <Avatar src={owner.avatar} alt={owner.name} />
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
      <TableCell role="cell" className={cellClass("win")}>
        {dealWin(deal)}%
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
      <TableCell role="cell" className={cellClass("category")}>
        <Tag tone={CATEGORY_TONES[category]} size="sm">
          {category}
        </Tag>
      </TableCell>
    </TableRow>
  );
}
