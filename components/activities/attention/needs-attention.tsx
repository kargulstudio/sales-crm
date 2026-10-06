"use client";

import { useMemo, useState } from "react";
import Button from "@/components/_ui/button";
import CountBadge from "@/components/_ui/count-badge";
import { ScrollArea } from "@/components/_ui/scroll-area";
import Tag from "@/components/_ui/tag";
import CompanyMark from "../company-mark";
import { ATTENTION_REASONS, needsAttention } from "@/lib/activities";
import { formatDate } from "@/lib/companies";
import { cn } from "@/lib/utils";
import { useActivitiesStore } from "@/stores/activities-store";
import { useCompanyMap } from "@/stores/companies-store";
import { useDealsStore } from "@/stores/deals-store";
import ChevronDownIcon from "@/public/assets/images/_common/chevron-down.svg";
import PlusIcon from "@/public/assets/images/_common/plus.svg";

type NeedsAttentionProps = {
  className?: string;
};

export default function NeedsAttention({ className }: NeedsAttentionProps) {
  const [open, setOpen] = useState(false);
  const deals = useDealsStore((state) => state.deals);
  const openDetail = useDealsStore((state) => state.openDetail);
  const companyById = useCompanyMap();
  const openLog = useActivitiesStore((state) => state.openLog);
  const items = useMemo(() => needsAttention(deals), [deals]);

  return (
    <aside
      aria-labelledby="needs-attention-title"
      className={cn(
        "border-line-strong bg-card flex flex-col rounded-xl border",
        className,
      )}
    >
      <div className="flex items-center justify-between gap-2 p-4">
        <div className="flex items-center gap-2">
          <h3 id="needs-attention-title">Needs attention</h3>
          <CountBadge>{items.length}</CountBadge>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="-mr-1.5 xl:hidden"
          aria-expanded={open}
          aria-controls="needs-attention-list"
          onClick={() => setOpen((current) => !current)}
        >
          {open ? "Hide" : "Show"}
          <ChevronDownIcon
            aria-hidden
            className={cn(
              "ease-power3-out size-3 transition-transform duration-200",
              open && "rotate-180",
            )}
          />
        </Button>
      </div>

      <div
        id="needs-attention-list"
        data-open={open}
        className="border-line-strong hidden border-t data-[open=true]:block xl:block"
      >
        {items.length === 0 ? (
          <span className="caption-style text-subtle block p-4">
            Every open deal is on track.
          </span>
        ) : (
          <ScrollArea fade viewportClassName="max-h-[520px]">
            <ul className="divide-line-strong divide-y">
              {items.map(({ deal, reason }) => (
                <li key={deal.id} className="flex flex-col gap-3 p-4">
                  <div className="flex items-start gap-3">
                    <CompanyMark company={companyById.get(deal.companyId)} />
                    <div className="flex min-w-0 flex-1 flex-col gap-1.5">
                      <Button
                        variant="ghost"
                        size="none"
                        onClick={() => openDetail(deal.id)}
                        className="text-foreground h-auto justify-start font-normal whitespace-normal hover:bg-transparent"
                      >
                        <span className="line-clamp-2 text-left">
                          {deal.name}
                        </span>
                      </Button>
                      <span className="caption-style text-subtle truncate">
                        {companyById.get(deal.companyId)?.name ?? "Unknown"} ·
                        closes {formatDate(deal.closeDate)}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <Tag tone={ATTENTION_REASONS[reason].tone} size="sm">
                      {ATTENTION_REASONS[reason].label}
                    </Tag>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => openLog(deal.id)}
                    >
                      <PlusIcon aria-hidden className="size-3" />
                      Log activity
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          </ScrollArea>
        )}
      </div>
    </aside>
  );
}
