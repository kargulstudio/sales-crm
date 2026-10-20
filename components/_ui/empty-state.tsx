import type { ComponentType, ReactNode, SVGProps } from "react";
import { cn } from "@/lib/utils";

type EmptyStateProps = {
  icon?: ComponentType<SVGProps<SVGSVGElement>>;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
};

export default function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center gap-2 px-6 py-10 text-center",
        className,
      )}
    >
      {Icon && (
        <span className="bg-muted shadow-hairline mb-1 flex size-10 items-center justify-center rounded-full">
          <Icon aria-hidden className="text-fg-secondary size-4" />
        </span>
      )}
      <span className="lead-style block font-medium">{title}</span>
      {description && (
        <span className="caption-style text-fg-tertiary block leading-snug">
          {description}
        </span>
      )}
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}
