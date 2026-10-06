import Header from "@/components/_common/header";
import StatusPill from "@/components/_common/status-pill";
import CompaniesToolbar from "./toolbar/toolbar";
import CompaniesTable from "./table/companies-table";
import { PIPELINE_TABS } from "@/lib/routes";

export default function Companies() {
  return (
    <section id="companies" className="flex min-h-0 min-w-0 flex-1 flex-col">
      <Header
        title="Companies"
        tabs={PIPELINE_TABS}
        status={<StatusPill>Active</StatusPill>}
      />
      <CompaniesToolbar />
      <CompaniesTable />
    </section>
  );
}
