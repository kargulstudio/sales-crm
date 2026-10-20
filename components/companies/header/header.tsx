"use client";

import { useMemo } from "react";
import { useShallow } from "zustand/react/shallow";

import Avatar from "@/components/_ui/avatar";
import Button from "@/components/_ui/button";
import Tag from "@/components/_ui/tag";
import { Tabs, TabsList, TabsTrigger } from "@/components/_ui/tabs";
import Notifications from "./notifications/notifications";
import ThemeMenu from "./theme-menu";
import Tooltip from "@/components/_ui/tooltip";
import { useCompaniesStore } from "@/stores/companies-store";
import { useStoreHydrated } from "@/hooks/use-store-hydrated";
import {
  VIEWS,
  filterCompanies,
  pickFilters,
  type View,
} from "@/lib/companies";
import MenuIcon from "@/public/assets/images/_common/menu.svg";
import ActiveDot from "@/public/assets/images/companies/header/active-dot.svg";
import SearchIcon from "@/public/assets/images/_common/search.svg";

const MOD_K =
  typeof navigator !== "undefined" && navigator.userAgent.includes("Mac")
    ? "⌘K"
    : "Ctrl K";

export default function CompaniesHeader() {
  const view = useCompaniesStore((state) => state.view);
  const setView = useCompaniesStore((state) => state.setView);
  const companies = useCompaniesStore((state) => state.companies);
  const filters = useCompaniesStore(useShallow(pickFilters));
  const hydrated = useStoreHydrated();
  const counts = useMemo(
    () =>
      Object.fromEntries(
        VIEWS.map((item) => [
          item.value,
          filterCompanies(companies, { ...filters, view: item.value }).length,
        ]),
      ),
    [companies, filters],
  );
  const setSidebarOpen = useCompaniesStore((state) => state.setSidebarOpen);
  const setSearchOpen = useCompaniesStore((state) => state.setSearchOpen);
  const openProfile = useCompaniesStore((state) => state.openProfile);
  const viewer = useCompaniesStore((state) => state.viewer);
  const viewerName = viewer?.name ?? "";

  return (
    <header className="shrink-0">
      <div className="short:py-2 flex items-center justify-between gap-2 px-4 py-3.5 max-[359px]:gap-1">
        <div className="flex min-w-0 items-center gap-2 max-[359px]:gap-1.5">
          <Button
            variant="secondary"
            size="icon"
            className="lg:hidden"
            aria-label="Open navigation"
            onClick={() => setSidebarOpen(true)}
          >
            <MenuIcon aria-hidden className="size-3.5" />
          </Button>
          <h1 className="truncate">Companies</h1>
          <Tag
            tone="neutral"
            size="xs"
            className="text-foreground gap-0.5 pl-0.5 max-[399px]:hidden"
          >
            <ActiveDot aria-hidden className="text-status size-3" />
            Active
          </Tag>
        </div>

        <div className="flex shrink-0 items-center gap-2 max-[359px]:gap-1 max-[359px]:[&_button]:after:-inset-x-0.5">
          <Tooltip content="Search" shortcut={MOD_K}>
            <Button
              variant="secondary"
              size="icon"
              aria-label="Search"
              aria-keyshortcuts="Meta+K Control+K"
              onClick={() => setSearchOpen(true)}
            >
              <SearchIcon aria-hidden className="size-3.5" />
            </Button>
          </Tooltip>
          <ThemeMenu />
          <Notifications />
          <Button
            variant="secondary"
            size="avatar"
            aria-label={viewer ? `Open profile for ${viewerName}` : "Profile"}
            disabled={!viewer}
            onClick={() => openProfile(viewerName)}
          >
            <Avatar src="" name={viewerName || "?"} alt="" />
            <span className="hidden max-w-40 truncate sm:inline">
              {viewerName || "Loading…"}
            </span>
          </Button>
        </div>
      </div>

      <Tabs value={view} onValueChange={(value) => setView(value as View)}>
        <TabsList
          aria-label="Saved views"
          className="scrollbar-none overflow-x-auto px-4 shadow-[inset_0_-1px_0_var(--border)]"
        >
          {VIEWS.map((item) => (
            <TabsTrigger
              key={item.value}
              value={item.value}
              className="short:py-2.5"
            >
              <span className="flex items-center gap-1.5 whitespace-nowrap">
                {item.label}
                <span className="text-fg-tertiary tabular-nums">
                  {hydrated ? counts[item.value] : "–"}
                </span>
              </span>
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
    </header>
  );
}
