import SegmentBar from "@/components/_common/segment-bar";
import type { CompanySummary } from "@/lib/companies";

type PipelineHealthProps = {
  summary: CompanySummary;
};

const STAGES = [
  { label: "Discovery", stage: "Discovery", tone: "danger" },
  { label: "Evaluation", stage: "Evaluation", tone: "warning" },
  { label: "Proposal", stage: "Proposal", tone: "warning" },
  { label: "Procurement", stage: "Procurement", tone: "success" },
] as const;

export default function PipelineHealth({ summary }: PipelineHealthProps) {
  const { win, pipelineValue, stageValue } = summary;

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-1.5">
        <span className="block text-[28px] leading-none font-semibold">
          {win === null ? "—" : `${win}%`}
        </span>
        <span className="caption-style text-soft block">
          {win === null
            ? "No open deals yet"
            : "Win probability across all open deals"}
        </span>
      </div>
      <div className="flex flex-col gap-3">
        {STAGES.map((item) => {
          const share =
            pipelineValue > 0
              ? Math.round(
                  ((stageValue[item.stage] ?? 0) / pipelineValue) * 100,
                )
              : 0;
          return (
            <div key={item.label} className="flex flex-col gap-2">
              <div className="caption-style flex items-center justify-between">
                <span>{item.label}</span>
                <span>{pipelineValue > 0 ? `${share}%` : "—"}</span>
              </div>
              <SegmentBar
                percent={share}
                segments={63}
                tone={item.tone}
                className="h-3 w-full border border-white/4 px-px"
                segmentClassName="h-2"
                trackClassName="bg-white/8"
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
