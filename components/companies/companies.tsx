import { Suspense } from "react";
import CompaniesHeader from "./header/header";
import CompaniesToolbar from "./toolbar/toolbar";
import ActiveFilters from "./toolbar/active-filters";
import CompaniesTable from "./table/companies-table";
import CompanyDetail from "./detail/company-detail";
import Profile from "./profile/profile";
import NewCompanyDialog from "./new-company/new-company-dialog";
import CommandMenu from "./command-menu/command-menu";
import CompaniesSync from "./companies-sync";
import ShortcutsDialog from "./shortcuts-dialog";

export default function Companies() {
  return (
    <section id="companies" className="flex min-h-0 min-w-0 flex-1 flex-col">
      <CompaniesHeader />
      <CompaniesToolbar />
      <ActiveFilters />
      <CompaniesTable />
      <CompanyDetail />
      <Profile />
      <NewCompanyDialog />
      <CommandMenu />
      <ShortcutsDialog />
      <Suspense fallback={null}>
        <CompaniesSync />
      </Suspense>
    </section>
  );
}
