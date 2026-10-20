import SegmentBar from "@/components/_common/segment-bar";
import type { Company } from "@/data/companies";
import { companyHealth } from "@/lib/companies";

type PipelineHealthProps = {
  company: Company;
};

export default function PipelineHealth({ company }: PipelineHealthProps) {
  const health = companyHealth(company);
  const stages = [
    { label: "Discovery", value: health.discovery, tone: "danger" as const },
    { label: "Evaluation", value: health.evaluation, tone: "warning" as const },
    {
      label: "Procurement",
      value: health.procurement,
      tone: "success" as const,
    },
  ];

  return (
    <div className="flex flex-col gap-3 tabular-nums">
      <div className="flex flex-col gap-1">
        <span className="block text-2xl leading-none font-semibold">
          {company.winProbability}%
        </span>
        <span className="caption-style text-fg-secondary block">
          Win probability across all open deals
        </span>
      </div>
      <div className="flex flex-col gap-3">
        {stages.map((stage) => (
          <div key={stage.label} className="flex flex-col gap-2">
            <div className="caption-style flex items-center justify-between">
              <span>{stage.label}</span>
              <span>{stage.value}%</span>
            </div>
            <SegmentBar
              percent={stage.value}
              segments={63}
              tone={stage.tone}
              className="border-overlay-1 h-3 w-full border px-px"
              segmentClassName="h-2"
              trackClassName="bg-overlay-3"
            />
          </div>
        ))}
      </div>
    </div>
  );
}
