"use client";

import Button from "@/components/_ui/button";
import { ScrollArea } from "@/components/_ui/scroll-area";
import SidebarNavItem from "./sidebar-nav-item";
import SidebarSection from "./sidebar-section";
import { useCompaniesStore } from "@/stores/companies-store";
import Logo from "@/assets/icons/_common/logo.svg?react";
import BuildingIcon from "@/assets/icons/companies/sidebar/building.svg?react";
import ClipboardIcon from "@/assets/icons/companies/sidebar/clipboard.svg?react";
import BarChartIcon from "@/assets/icons/companies/sidebar/bar-chart.svg?react";
import ListIcon from "@/assets/icons/companies/sidebar/list.svg?react";
import BookClosedIcon from "@/assets/icons/companies/sidebar/book-closed.svg?react";
import MailIcon from "@/assets/icons/companies/sidebar/mail.svg?react";
export default function SidebarContent() {
  const tab = useCompaniesStore((s) => s.activeTab);
  const setTab = useCompaniesStore((s) => s.setActiveTab);
  const companyCount = useCompaniesStore((state) => state.companies.length);

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="border-sidebar-border bg-sidebar-accent flex shrink-0 items-center gap-2 border-b p-3">
        <Logo aria-hidden className="size-8 shrink-0 overflow-visible" />
        <div className="flex min-w-0 flex-col gap-1">
          <span className="lead-style block truncate font-medium tracking-[-0.01em]">
            Sales CRM
          </span>
          <span className="caption-style text-subtle block truncate">
            Company pipeline
          </span>
        </div>
      </div>

      <ScrollArea className="min-h-0 flex-1">
        <nav aria-label="Primary">
          <SidebarSection className="border-sidebar-border border-b">
            <SidebarNavItem
              icon={BuildingIcon}
              label="Companies"
              count={companyCount}
              active={tab === "companies"}
              onClick={() => setTab("companies")}
            />
            <SidebarNavItem
              icon={ClipboardIcon}
              label="Deals Board"
              active={tab === "deals"}
              onClick={() => setTab("deals")}
            />
            <SidebarNavItem
              icon={BarChartIcon}
              label="Forecast"
              active={tab === "forecast"}
              onClick={() => setTab("forecast")}
            />
            <SidebarNavItem
              icon={ListIcon}
              label="Activities"
              active={tab === "activities"}
              onClick={() => setTab("activities")}
            />
            <SidebarNavItem
              icon={BookClosedIcon}
              label="Contacts"
              active={tab === "contacts"}
              onClick={() => setTab("contacts")}
            />
            <SidebarNavItem
              icon={MailIcon}
              label="Tasks & Follow-ups"
              active={tab === "tasks"}
              onClick={() => setTab("tasks")}
            />
          </SidebarSection>
          <SidebarSection title="Manage">
            <SidebarNavItem
              icon={BuildingIcon}
              label="Archived companies"
              active={tab === "archived"}
              onClick={() => setTab("archived")}
            />
          </SidebarSection>
        </nav>
      </ScrollArea>

      <div className="border-sidebar-border bg-sidebar-accent flex shrink-0 flex-col gap-3 border-t p-4">
        <span className="caption-style text-subtle">
          Personal CRM · Cloudflare Access
        </span>
        <Button
          variant="muted"
          size="md"
          href="https://github.com/kargulstudio/sales-crm#readme"
        >
          Documentation
        </Button>
      </div>
    </div>
  );
}
