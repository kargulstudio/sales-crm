import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type SidebarSectionProps = {
  title?: string;
  children: ReactNode;
  className?: string;
};

export default function SidebarSection({
  title,
  children,
  className,
}: SidebarSectionProps) {
  return (
    <div className={cn("flex flex-col gap-1 p-3", className)}>
      {title && (
        <span className="eyebrow-style text-fg-tertiary block px-2 font-medium">
          {title}
        </span>
      )}
      <ul className="flex flex-col">{children}</ul>
    </div>
  );
}
