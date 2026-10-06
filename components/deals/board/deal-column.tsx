import type { DragEvent } from "react";
import CountBadge from "@/components/_ui/count-badge";
import { ScrollArea } from "@/components/_ui/scroll-area";
import DealCard from "./deal-card";
import type { Company } from "@/data/companies";
import type { Deal, DealStage } from "@/data/deals";
import { formatMoney } from "@/lib/companies";

type DealColumnProps = {
  stage: DealStage;
  deals: Deal[];
  companies: Company[];
  draggingId: string | null;
  isOver: boolean;
  onDragStartCard: (event: DragEvent<HTMLElement>, id: string) => void;
  onDragEndCard: () => void;
  onDragOverColumn: (event: DragEvent<HTMLElement>, stage: DealStage) => void;
  onDragLeaveColumn: (event: DragEvent<HTMLElement>) => void;
  onDropColumn: (event: DragEvent<HTMLElement>, stage: DealStage) => void;
};

export default function DealColumn({
  stage,
  deals,
  companies,
  draggingId,
  isOver,
  onDragStartCard,
  onDragEndCard,
  onDragOverColumn,
  onDragLeaveColumn,
  onDropColumn,
}: DealColumnProps) {
  const total = deals.reduce((sum, deal) => sum + deal.value, 0);

  return (
    <section
      aria-label={stage}
      data-over={isOver}
      onDragOver={(event) => onDragOverColumn(event, stage)}
      onDragLeave={onDragLeaveColumn}
      onDrop={(event) => onDropColumn(event, stage)}
      className="bg-secondary/60 ease-power3-out data-[over=true]:bg-muted/70 flex h-full w-72 shrink-0 flex-col rounded-xl shadow-[inset_0px_0px_0px_1px_rgba(255,255,255,0.04)] transition-colors duration-150 data-[over=true]:shadow-[inset_0px_0px_0px_1px_rgba(255,255,255,0.2)]"
    >
      <header className="flex shrink-0 items-center justify-between gap-2 px-3 pt-3 pb-2">
        <div className="flex min-w-0 items-center gap-2">
          <h4 className="eyebrow-style truncate font-normal">{stage}</h4>
          <CountBadge>{deals.length}</CountBadge>
        </div>
        <span className="caption-style text-soft tabular-nums">
          ${formatMoney(total)}
        </span>
      </header>

      <ScrollArea fade className="min-h-0 flex-1">
        <div className="flex flex-col gap-2 p-2 pt-1">
          {deals.map((deal) => (
            <DealCard
              key={deal.id}
              deal={deal}
              company={companies.find((item) => item.id === deal.companyId)}
              dragging={draggingId === deal.id}
              onDragStart={(event) => onDragStartCard(event, deal.id)}
              onDragEnd={onDragEndCard}
            />
          ))}
          {deals.length === 0 && (
            <span className="caption-style text-subtle flex h-[120px] items-center justify-center text-center">
              No deals in this stage.
            </span>
          )}
        </div>
      </ScrollArea>
    </section>
  );
}
