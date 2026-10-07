import CompaniesHeader from "./header/header";
import CompaniesToolbar from "./toolbar/toolbar";
import CompaniesTable from "./table/companies-table";
import CompanyDetail from "./detail/company-detail";
import Profile from "./profile/profile";
import NewCompanyDialog from "./new-company/new-company-dialog";
import CommandMenu from "./command-menu/command-menu";
import CrmSync from "./crm-sync";

export default function Companies() {
  return (
    <section id="companies" className="flex min-h-0 min-w-0 flex-1 flex-col">
      <CompaniesHeader />
      <CompaniesToolbar />
      <CompaniesTable />
      <CompanyDetail />
      <Profile />
      <NewCompanyDialog />
      <CommandMenu />
      <CrmSync />
    </section>
  );
}
