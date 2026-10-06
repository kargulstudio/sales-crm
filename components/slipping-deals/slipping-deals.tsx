import Header from "@/components/_common/header";
import SlippingStatus from "./slipping-status";
import SlippingToolbar from "./toolbar/toolbar";
import SlippingTable from "./table/slipping-table";
import { REPORT_TABS } from "@/lib/routes";

export default function SlippingDeals() {
  return (
    <section
      id="slipping-deals"
      className="flex min-h-0 min-w-0 flex-1 flex-col"
    >
      <Header
        title="Slipping Deals"
        tabs={REPORT_TABS}
        status={<SlippingStatus />}
      />
      <SlippingToolbar />
      <SlippingTable />
    </section>
  );
}
