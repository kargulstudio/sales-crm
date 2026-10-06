import { useOwner } from "@/stores/companies-store";
import Asset from "@/components/_ui/asset";
import Avatar from "@/components/_ui/avatar";
import Button from "@/components/_ui/button";
import { type Company } from "@/data/companies";
import type { Notification } from "@/data/notifications";
import { cn } from "@/lib/utils";

type NotificationItemProps = {
  notification: Notification;
  company?: Company;
  unread: boolean;
  onSelect: () => void;
};

function CompanyMark({
  company,
  className,
}: {
  company?: Company;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "bg-muted flex shrink-0 items-center justify-center overflow-hidden shadow-[0px_0px_0px_1px_#232323]",
        className,
      )}
    >
      {company?.logo ? (
        <Asset
          type="image"
          src={company.logo}
          alt=""
          width={1}
          height={1}
          fit="contain"
          className="size-[60%]"
        />
      ) : (
        <span className="caption-style text-soft">
          {company?.name.slice(0, 1) ?? "?"}
        </span>
      )}
    </span>
  );
}

export default function NotificationItem({
  notification,
  company,
  unread,
  onSelect,
}: NotificationItemProps) {
  const actor = useOwner(notification.actor ?? null);

  return (
    <li className="relative">
      <Button
        variant="item"
        size="none"
        onClick={onSelect}
        data-unread={unread}
        className="p-3 data-[unread=true]:bg-white/2 data-[unread=true]:hover:bg-white/5"
      >
        <span className="relative mt-px shrink-0">
          {actor ? (
            <>
              <Avatar src={actor.avatar} alt="" className="size-8" />
              <CompanyMark
                company={company}
                className="ring-popover absolute -right-1 -bottom-1 size-4 rounded-[5px] ring-2"
              />
            </>
          ) : (
            <CompanyMark company={company} className="size-8 rounded-lg" />
          )}
        </span>
        <span className="flex min-w-0 flex-1 flex-col gap-2 pr-4">
          <span className="p-style text-soft block">
            {actor && (
              <span className="text-foreground font-medium">{actor.name} </span>
            )}
            {notification.message}
          </span>
          {notification.quote && (
            <span className="p-style border-line-strong text-soft block rounded-lg border bg-white/3 px-3 py-2">
              {notification.quote}
            </span>
          )}
          <span className="caption-style text-subtle flex items-center gap-1.5">
            {notification.time}
            {company && (
              <>
                <span aria-hidden className="bg-subtle size-0.5 rounded-full" />
                {company.name}
              </>
            )}
          </span>
        </span>
        {unread && <span className="sr-only">Unread</span>}
      </Button>
      {unread && (
        <span
          aria-hidden
          className="bg-danger pointer-events-none absolute top-4 right-3 size-1.5 rounded-full"
        />
      )}
    </li>
  );
}
