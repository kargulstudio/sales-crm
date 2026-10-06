import type { ComponentType, SVGProps } from "react";
import Button from "@/components/_ui/button";
import CountBadge from "@/components/_ui/count-badge";
import { cn } from "@/lib/utils";

type SidebarNavItemProps = {
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  label: string;
  count?: number;
  active?: boolean;
  tone?: "default" | "quiet";
  iconClassName?: string;
  onClick?: () => void;
};

export default function SidebarNavItem({
  icon: Icon,
  label,
  count,
  active = false,
  tone = "default",
  iconClassName,
  onClick,
}: SidebarNavItemProps) {
  return (
    <li className={cn(active && "mb-0.75")}>
      <Button
        onClick={onClick}
        variant="nav"
        size="md"
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
            onClick,
          )}
        />
        <span className="min-w-0 flex-1 truncate text-left">{label}</span>
        {count !== undefined && <CountBadge>{count}</CountBadge>}
      </Button>
    </li>
  );
}
