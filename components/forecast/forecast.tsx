import Header from "@/components/_common/header";
import { ScrollArea } from "@/components/_ui/scroll-area";
import ForecastStatus from "./forecast-status";
import ForecastToolbar from "./toolbar/toolbar";
import Summary from "./summary/summary";
import RepsTable from "./reps/reps-table";
import ForecastDealsTable from "./deals/forecast-deals-table";
import SubmitDialog from "./submit/submit-dialog";
import { PIPELINE_TABS } from "@/lib/routes";

export default function Forecast() {
  return (
    <section id="forecast" className="flex min-h-0 min-w-0 flex-1 flex-col">
      <Header
        title="Forecast"
        tabs={PIPELINE_TABS}
        status={<ForecastStatus />}
      />
      <ForecastToolbar />
      <ScrollArea className="min-h-0 flex-1">
        <Summary />
        <RepsTable />
        <ForecastDealsTable />
      </ScrollArea>
      <SubmitDialog />
    </section>
  );
}
