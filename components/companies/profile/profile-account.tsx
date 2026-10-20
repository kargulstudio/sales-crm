import Button from "@/components/_ui/button";
import CompanyLogo from "@/components/companies/company-logo";
import SegmentBar from "@/components/_common/segment-bar";
import type { Company } from "@/data/companies";
import { formatMoney } from "@/lib/companies";

type ProfileAccountProps = {
  company: Company;
  onOpen: () => void;
};

export default function ProfileAccount({
  company,
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
        <CompanyLogo company={company} size="md" />
        <span className="flex min-w-0 flex-1 flex-col gap-1">
          <span className="truncate">{company.name}</span>
          <span className="caption-style text-fg-tertiary truncate leading-3.5 tabular-nums">
            {company.openDeals} open deals · {company.tags.join(", ")}
          </span>
        </span>
        <span className="flex shrink-0 flex-col items-end gap-1 tabular-nums">
          <span className="flex items-center gap-1">
            <span className="text-fg-tertiary">$</span>
            {formatMoney(company.pipelineValue)}
          </span>
          <SegmentBar percent={company.winProbability} className="w-15" />
        </span>
      </Button>
    </li>
  );
}
