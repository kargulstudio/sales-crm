import Header from "@/components/_common/header";
import { ScrollArea } from "@/components/_ui/scroll-area";
import Q1Status from "./q1-status";
import Q1Toolbar from "./toolbar/toolbar";
import Summary from "./summary/summary";
import Months from "./months/months";
import StagesTable from "./stages/stages-table";
import RepsTable from "./reps/reps-table";
import DealsTable from "./deals/deals-table";
import { REPORT_TABS } from "@/lib/routes";

export default function Q1Forecast() {
  return (
    <section id="q1-forecast" className="flex min-h-0 min-w-0 flex-1 flex-col">
      <Header title="Q1 Forecast" tabs={REPORT_TABS} status={<Q1Status />} />
      <Q1Toolbar />
      <ScrollArea className="min-h-0 flex-1">
        <Summary />
        <Months />
        <StagesTable />
        <RepsTable />
        <DealsTable />
      </ScrollArea>
    </section>
  );
}
