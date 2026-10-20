import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type DetailSectionProps = {
  title: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
};

export default function DetailSection({
  title,
  action,
  children,
  className,
}: DetailSectionProps) {
  return (
    <section
      className={cn("shadow-divider flex flex-col gap-4 px-6 py-5", className)}
    >
      {action ? (
        <div className="flex h-3 items-center justify-between gap-2">
          <h4 className="eyebrow-style font-normal">{title}</h4>
          {action}
        </div>
      ) : (
        <h4 className="eyebrow-style font-normal">{title}</h4>
      )}
      {children}
    </section>
  );
}
