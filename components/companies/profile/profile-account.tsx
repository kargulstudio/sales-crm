import Asset from "@/components/_ui/asset";
import Button from "@/components/_ui/button";
import SegmentBar from "@/components/_common/segment-bar";
import type { Company } from "@/data/companies";
import { formatMoney, type CompanySummary } from "@/lib/companies";

type ProfileAccountProps = {
  company: Company;
  summary: CompanySummary;
  onOpen: () => void;
};

export default function ProfileAccount({
  company,
  summary,
  onOpen,
}: ProfileAccountProps) {
  return (
    <li>
      <Button
        variant="item"
        size="md"
        onClick={onOpen}
        aria-label={`Open ${company.name} details`}
        className="items-center px-2 py-2"
      >
        <span className="bg-muted flex size-8 shrink-0 items-center justify-center rounded-lg shadow-[0px_0px_0px_1px_#232323]">
          {company.logo ? (
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
              {company.name.slice(0, 1)}
            </span>
          )}
        </span>
        <span className="flex min-w-0 flex-1 flex-col gap-1">
          <span className="truncate">{company.name}</span>
          <span className="caption-style text-subtle truncate">
            {summary.openDeals} open{" "}
            {summary.openDeals === 1 ? "deal" : "deals"} ·{" "}
            {company.tags.join(", ")}
          </span>
        </span>
        <span className="flex shrink-0 flex-col items-end gap-1.5 tabular-nums">
          <span className="flex items-center gap-1">
            <span className="text-muted-foreground">$</span>
            {formatMoney(summary.pipelineValue)}
          </span>
          <SegmentBar percent={summary.win ?? 0} className="w-[60px]" />
        </span>
      </Button>
    </li>
  );
}
