"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import Avatar from "@/components/_ui/avatar";
import Button from "@/components/_ui/button";
import { TabLabel, tabsTriggerClass } from "@/components/_ui/tabs";
import Notifications from "./notifications/notifications";
import { CURRENT_USER } from "@/data/companies";
import { isActivePath } from "@/lib/routes";
import { useCompaniesStore } from "@/stores/companies-store";
import MenuIcon from "@/public/assets/images/_common/menu.svg";
import SearchIcon from "@/public/assets/images/_common/search.svg";

type HeaderTab = { href: string; label: string };

type HeaderProps = {
  title: string;
  status?: ReactNode;
  tabs?: HeaderTab[];
};

export default function Header({ title, status, tabs }: HeaderProps) {
  const pathname = usePathname();
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
          <h1 className="truncate">{title}</h1>
          {status}
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

      {tabs && (
        <nav
          aria-label={`${title} views`}
          className="border-border flex items-center gap-4 overflow-x-auto border-b px-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {tabs.map((tab) => {
            const active = isActivePath(pathname, tab.href);
            return (
              <Link
                key={tab.href}
                href={tab.href}
                data-state={active ? "active" : "inactive"}
                aria-current={active ? "page" : undefined}
                className={tabsTriggerClass}
              >
                <TabLabel>{tab.label}</TabLabel>
              </Link>
            );
          })}
        </nav>
      )}
    </header>
  );
}
