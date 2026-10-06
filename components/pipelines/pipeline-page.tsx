import Header from "@/components/_common/header";
import DealsToolbar from "@/components/deals/toolbar/toolbar";
import DealsBoard from "@/components/deals/board/deals-board";
import PipelineStatus from "./pipeline-status";
import PipelineSummary from "./pipeline-summary";
import type { Region } from "@/data/deals";
import { pipelineByRegion } from "@/data/pipelines";
import { PIPELINE_REGION_TABS } from "@/lib/routes";

type PipelinePageProps = {
  region: Region;
};

export default function PipelinePage({ region }: PipelinePageProps) {
  const pipeline = pipelineByRegion(region);

  return (
    <section id={pipeline.id} className="flex min-h-0 min-w-0 flex-1 flex-col">
      <Header
        title={pipeline.title}
        tabs={PIPELINE_REGION_TABS}
        status={<PipelineStatus region={region} />}
      />
      <DealsToolbar region={region} />
      <PipelineSummary region={region} />
      <DealsBoard region={region} />
    </section>
  );
}
