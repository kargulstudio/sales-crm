"use client";

import { useRef, useState } from "react";
import Button from "@/components/_ui/button";
import CountBadge from "@/components/_ui/count-badge";
import EmptyState from "@/components/_ui/empty-state";
import Tooltip from "@/components/_ui/tooltip";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/_ui/popover";
import { ScrollArea } from "@/components/_ui/scroll-area";
import { Tabs, TabsList, TabsTrigger } from "@/components/_ui/tabs";
import NotificationItem from "./notification-item";
import { NOTIFICATIONS } from "@/data/notifications";
import { useCompaniesStore } from "@/stores/companies-store";
import { toast } from "@/stores/toast-store";
import BellIcon from "@/public/assets/images/companies/header/bell.svg";

type Filter = "all" | "unread";

export default function Notifications() {
  const [open, setOpen] = useState(false);
  const [filter, setFilter] = useState<Filter>("all");
  const navigated = useRef(false);
  const companies = useCompaniesStore((state) => state.companies);
  const unreadIds = useCompaniesStore((state) => state.unreadNotificationIds);
  const markRead = useCompaniesStore((state) => state.markNotificationRead);
  const markAllRead = useCompaniesStore(
    (state) => state.markAllNotificationsRead,
  );
  const openDetail = useCompaniesStore((state) => state.openDetail);

  const unreadCount = unreadIds.length;
  const visible = NOTIFICATIONS.filter(
    (item) => filter === "all" || unreadIds.includes(item.id),
  );

  function handleSelect(id: string, companyId: string) {
    markRead(id);
    if (!companies.some((company) => company.id === companyId)) {
      toast("That company was deleted from your pipeline");
      return;
    }
    navigated.current = true;
    setOpen(false);
    openDetail(companyId);
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <Tooltip content="Notifications">
        <PopoverTrigger asChild>
          <Button
            variant="secondary"
            size="icon"
            aria-label={
              unreadCount > 0
                ? `Notifications, ${unreadCount} unread`
                : "Notifications"
            }
            className="group data-[state=open]:bg-muted relative"
          >
            <BellIcon aria-hidden className="size-3.5" />
            {unreadCount > 0 && (
              <span
                aria-hidden
                className="bg-danger ring-secondary group-hover:ring-muted group-data-[state=open]:ring-muted absolute top-1.75 right-1.75 size-1.5 rounded-full ring-2"
              />
            )}
          </Button>
        </PopoverTrigger>
      </Tooltip>
      <PopoverContent
        className="w-[min(400px,calc(100vw-2rem))]"
        onCloseAutoFocus={(event) => {
          if (navigated.current) event.preventDefault();
          navigated.current = false;
        }}
      >
        <div className="flex h-14 items-center justify-between gap-2 px-4">
          <div className="flex items-center gap-2">
            <h2>Notifications</h2>
            {unreadCount > 0 && <CountBadge>{unreadCount}</CountBadge>}
          </div>
          <Button
            variant="ghost"
            size="sm"
            disabled={unreadCount === 0}
            onClick={markAllRead}
            className="-mr-2.25"
          >
            Mark all as read
          </Button>
        </div>

        <Tabs
          value={filter}
          onValueChange={(value) => setFilter(value as Filter)}
        >
          <TabsList className="px-4 shadow-[inset_0_-1px_0_var(--line-strong)]">
            <TabsTrigger value="all" className="py-3">
              All
            </TabsTrigger>
            <TabsTrigger value="unread" className="py-3">
              Unread
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {visible.length > 0 ? (
          <ScrollArea viewportClassName="max-h-[min(420px,60dvh)]">
            <ul className="flex flex-col gap-0.5 p-1.5">
              {visible.map((notification) => (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                  company={companies.find(
                    (company) => company.id === notification.companyId,
                  )}
                  unread={unreadIds.includes(notification.id)}
                  onSelect={() =>
                    handleSelect(notification.id, notification.companyId)
                  }
                />
              ))}
            </ul>
          </ScrollArea>
        ) : (
          <EmptyState
            icon={BellIcon}
            title="You’re all caught up"
            description="New mentions and deal updates will show up here."
            className="py-12"
          />
        )}
      </PopoverContent>
    </Popover>
  );
}
