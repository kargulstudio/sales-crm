import Header from "@/components/_common/header";
import { ScrollArea } from "@/components/_ui/scroll-area";
import ActivitiesStatus from "./activities-status";
import ActivitiesToolbar from "./toolbar/toolbar";
import NeedsAttention from "./attention/needs-attention";
import Timeline from "./timeline/timeline";
import ActivitiesFooter from "./timeline/activities-footer";

export default function Activities() {
  return (
    <section id="activities" className="flex min-h-0 min-w-0 flex-1 flex-col">
      <Header title="Activities" status={<ActivitiesStatus />} />
      <ActivitiesToolbar />
      <ScrollArea className="min-h-0 flex-1">
        <div className="flex flex-col gap-4 px-4 pb-4 xl:flex-row xl:items-start">
          <NeedsAttention className="xl:sticky xl:top-0 xl:order-2 xl:w-[340px] xl:shrink-0" />
          <Timeline className="min-w-0 flex-1 xl:order-1" />
        </div>
      </ScrollArea>
      <ActivitiesFooter />
    </section>
  );
}
