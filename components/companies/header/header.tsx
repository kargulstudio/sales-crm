"use client";

import Avatar from "@/components/_ui/avatar";
import Button from "@/components/_ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/_ui/tabs";
import Notifications from "./notifications/notifications";

import { useCompaniesStore } from "@/stores/companies-store";
import MenuIcon from "@/assets/icons/_common/menu.svg?react";
import ActiveDot from "@/assets/icons/companies/header/active-dot.svg?react";
import SearchIcon from "@/assets/icons/_common/search.svg?react";

const TABS = [
  { value: "companies", label: "Companies" },
  { value: "deals", label: "Deals" },
  { value: "forecast", label: "Forecast" },
];

export default function CompaniesHeader() {
  const user = useCompaniesStore((s) => s.user);
  const CURRENT_USER = {
    name: user?.display_name || "Account",
    avatar: user?.avatar_url || "/assets/images/_common/avatar-placeholder.svg",
  };
  const activeTab = useCompaniesStore((state) => state.activeTab);
  const setActiveTab = useCompaniesStore((state) => state.setActiveTab);
  const setSidebarOpen = useCompaniesStore((state) => state.setSidebarOpen);
  const setSearchOpen = useCompaniesStore((state) => state.setSearchOpen);
  const openProfile = useCompaniesStore((state) => state.openProfile);

  return (
    <header className="shrink-0">
      <div className="flex items-center justify-between gap-2 px-4 py-[14px]">
        <div className="flex min-w-0 items-center gap-2">
          <Button
            variant="secondary"
            size="icon"
            className="lg:hidden"
            aria-label="Open navigation"
            onClick={() => setSidebarOpen(true)}
          >
            <MenuIcon aria-hidden className="size-3.5" />
          </Button>
          <h1 className="truncate capitalize">{activeTab}</h1>
          <span className="caption-style bg-muted inline-flex shrink-0 items-center gap-0.5 rounded-full border border-[#363636] py-[3px] pr-[5px] pl-[3px]">
            <ActiveDot aria-hidden className="size-3" />
            Active
          </span>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <Button
            variant="secondary"
            size="icon"
            aria-label="Search"
            aria-keyshortcuts="Meta+K Control+K"
            onClick={() => setSearchOpen(true)}
          >
            <SearchIcon aria-hidden className="size-3.5" />
          </Button>
          <Notifications />
          <Button
            variant="secondary"
            size="none"
            className="caption-style h-[30px] gap-1.5 py-[5px] pr-[7px] pl-[5px] font-normal"
            aria-label={`Open profile for ${CURRENT_USER.name}`}
            onClick={() => openProfile(CURRENT_USER.name)}
          >
            <Avatar src={CURRENT_USER.avatar} alt="" />
            <span className="hidden sm:inline">{CURRENT_USER.name}</span>
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="border-border border-b px-4">
          {TABS.map((tab) => (
            <TabsTrigger
              key={tab.value}
              value={tab.value}
              id={`crm-tab-${tab.value}`}
              aria-controls={`crm-panel-${tab.value}`}
            >
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
    </header>
  );
}
