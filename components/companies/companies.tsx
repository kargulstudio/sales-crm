"use client";
import { useEffect } from "react";
import { useCompaniesStore } from "@/stores/companies-store";
import Overview from "./overview";
import CompaniesHeader from "./header/header";
import CompaniesToolbar from "./toolbar/toolbar";
import CompaniesTable from "./table/companies-table";
import CompanyDetail from "./detail/company-detail";
import Profile from "./profile/profile";
import NewCompanyDialog from "./new-company/new-company-dialog";
import CommandMenu from "./command-menu/command-menu";

export default function Companies() {
  const refresh = useCompaniesStore((s) => s.refresh);
  const loading = useCompaniesStore((s) => s.loading);
  const error = useCompaniesStore((s) => s.error);
  const tab = useCompaniesStore((s) => s.activeTab);
  useEffect(() => {
    void refresh();
  }, [refresh]);
  return (
    <section id="companies" className="flex min-h-0 min-w-0 flex-1 flex-col">
      <CompaniesHeader />
      {error && (
        <div role="alert" className="text-danger p-4">
          {error}{" "}
          <button className="underline" onClick={() => void refresh()}>
            Retry
          </button>
        </div>
      )}
      <div
        id={`crm-panel-${tab}`}
        role={
          ["companies", "deals", "forecast"].includes(tab)
            ? "tabpanel"
            : "region"
        }
        aria-labelledby={
          ["companies", "deals", "forecast"].includes(tab)
            ? `crm-tab-${tab}`
            : undefined
        }
        aria-label={
          ["companies", "deals", "forecast"].includes(tab) ? undefined : tab
        }
        className="flex min-h-0 flex-1 flex-col"
      >
        {loading ? (
          <p role="status" className="text-soft p-5">
            Loading your CRM…
          </p>
        ) : tab === "companies" ? (
          <>
            <CompaniesToolbar />
            <CompaniesTable />
          </>
        ) : (
          <Overview view={tab} />
        )}
      </div>
      <CompanyDetail />
      <Profile />
      <NewCompanyDialog />
      <CommandMenu />
    </section>
  );
}
