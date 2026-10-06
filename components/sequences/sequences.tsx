import Header from "@/components/_common/header";
import SequencesStatus from "./sequences-status";
import SequencesToolbar from "./toolbar/toolbar";
import SequencesTable from "./table/sequences-table";

export default function Sequences() {
  return (
    <section
      id="email-sequences"
      className="flex min-h-0 min-w-0 flex-1 flex-col"
    >
      <Header title="Email Sequences" status={<SequencesStatus />} />
      <SequencesToolbar />
      <SequencesTable />
    </section>
  );
}
