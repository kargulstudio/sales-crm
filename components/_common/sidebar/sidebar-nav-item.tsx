import type { ComponentType, SVGProps } from "react";
import Button from "@/components/_ui/button";
import CountBadge from "@/components/_ui/count-badge";
import { cn } from "@/lib/utils";

type SidebarNavItemProps = {
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  label: string;
  count?: number;
  active?: boolean;
  pressed?: boolean;
  onClick?: () => void;
  soon?: boolean;
  tone?: "default" | "quiet";
  iconClassName?: string;
};

export default function SidebarNavItem({
  icon: Icon,
  label,
  count,
  active = false,
  pressed,
  onClick,
  soon = false,
  tone = "default",
  iconClassName,
}: SidebarNavItemProps) {
  return (
    <li className={cn(active && "mb-0.75")}>
      <Button
        variant="nav"
        size="md"
        data-active={active || pressed === true}
        aria-current={active ? "page" : undefined}
        aria-pressed={pressed}
        onClick={onClick}
        disabled={soon}
        className={cn(
          "group h-control-md gap-1.5 py-0 data-[active=true]:h-8",
          tone === "quiet" && "text-fg-tertiary",
        )}
      >
        <Icon
          aria-hidden
          className={cn(
            "text-fg-tertiary ease-power3-out group-hover:text-icon group-data-[active=true]:text-icon duration-fast size-3.5 shrink-0 transition-colors",
            iconClassName,
          )}
        />
        <span className="min-w-0 flex-1 truncate text-left">{label}</span>
        {soon ? (
          <span className="caption-style text-fg-tertiary shrink-0">Soon</span>
        ) : (
          count !== undefined && <CountBadge>{count}</CountBadge>
        )}
      </Button>
    </li>
  );
}
