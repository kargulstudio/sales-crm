"use client";

import type { ComponentType, SVGProps } from "react";
import { usePathname } from "next/navigation";
import Button from "@/components/_ui/button";
import CountBadge from "@/components/_ui/count-badge";
import { isActivePath } from "@/lib/routes";
import { cn } from "@/lib/utils";
import { useCompaniesStore } from "@/stores/companies-store";

type SidebarNavItemProps = {
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  label: string;
  href?: string;
  onClick?: () => void;
  count?: number;
  tone?: "default" | "quiet";
  iconClassName?: string;
};

export default function SidebarNavItem({
  icon: Icon,
  label,
  href,
  onClick,
  count,
  tone = "default",
  iconClassName,
}: SidebarNavItemProps) {
  const pathname = usePathname();
  const setSidebarOpen = useCompaniesStore((state) => state.setSidebarOpen);
  const active = href !== undefined && isActivePath(pathname, href);

  function handleClick() {
    setSidebarOpen(false);
    onClick?.();
  }

  return (
    <li className={cn(active && "mb-0.75")}>
      <Button
        variant="nav"
        size="md"
        href={href}
        onClick={handleClick}
        data-active={active}
        aria-current={active ? "page" : undefined}
        className={cn(
          "group h-[30px] gap-1.5 py-0 data-[active=true]:h-8",
          tone === "quiet" && "text-subtle",
        )}
      >
        <Icon
          aria-hidden
          className={cn(
            "text-subtle ease-power3-out group-hover:text-icon group-data-[active=true]:text-icon size-3.5 shrink-0 transition-colors duration-150",
            iconClassName,
          )}
        />
        <span className="min-w-0 flex-1 truncate text-left">{label}</span>
        {count !== undefined && <CountBadge>{count}</CountBadge>}
      </Button>
    </li>
  );
}
