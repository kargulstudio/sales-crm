import Header from "@/components/_common/header";
import ContactsStatus from "./contacts-status";
import ContactsToolbar from "./toolbar/toolbar";
import ContactsTable from "./table/contacts-table";

export default function Contacts() {
  return (
    <section id="contacts" className="flex min-h-0 min-w-0 flex-1 flex-col">
      <Header title="Contacts" status={<ContactsStatus />} />
      <ContactsToolbar />
      <ContactsTable />
    </section>
  );
}
