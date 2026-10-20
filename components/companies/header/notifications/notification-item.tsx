import Avatar from "@/components/_ui/avatar";
import Button from "@/components/_ui/button";
import CompanyLogo from "@/components/companies/company-logo";
import { COMPANY_DOMAINS, ownerByName, type Company } from "@/data/companies";
import type { Notification } from "@/data/notifications";

type NotificationItemProps = {
  notification: Notification;
  company?: Company;
  unread: boolean;
  onSelect: () => void;
};

export default function NotificationItem({
  notification,
  company,
  unread,
  onSelect,
}: NotificationItemProps) {
  const actor = notification.actor ? ownerByName(notification.actor) : null;
  const mark = {
    name: company?.name ?? "?",
    logo: company?.logo,
    domain: company?.domain ?? COMPANY_DOMAINS[notification.companyId],
  };

  return (
    <li className="relative">
      <Button
        variant="item"
        size="none"
        onClick={onSelect}
        data-unread={unread}
        className="data-[unread=true]:bg-overlay-1 data-[unread=true]:hover:bg-overlay-2 rounded-md p-2.5"
      >
        <span className="relative mt-px shrink-0">
          {actor ? (
            <>
              <Avatar src={actor.avatar} alt="" className="size-8" />
              <CompanyLogo
                company={mark}
                size="xs"
                className="ring-popover absolute -right-1 -bottom-1 size-4 rounded-sm ring-2"
              />
            </>
          ) : (
            <CompanyLogo company={mark} size="md" />
          )}
        </span>
        <span className="flex min-w-0 flex-1 flex-col gap-2 pr-4">
          <span className="p-style text-fg-secondary block">
            {actor && (
              <span className="text-foreground font-medium">{actor.name} </span>
            )}
            {notification.message}
          </span>
          {notification.quote && (
            <span className="p-style border-line-strong text-fg-secondary bg-overlay-1 block rounded-lg border px-3 py-2">
              {notification.quote}
            </span>
          )}
          <span className="caption-style text-fg-tertiary flex items-center gap-1.5">
            {notification.time}
            {company && (
              <>
                <span
                  aria-hidden
                  className="bg-fg-tertiary size-0.5 rounded-full"
                />
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
          className="bg-danger pointer-events-none absolute top-4.25 right-2.5 size-1.5 rounded-full"
        />
      )}
    </li>
  );
}
