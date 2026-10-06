import type { ReactNode } from "react";
import ActiveDot from "@/public/assets/images/companies/header/active-dot.svg";
import PendingDot from "@/public/assets/images/companies/sidebar/dot-yellow.svg";

type StatusPillProps = {
  tone?: "green" | "amber" | "none";
  children: ReactNode;
};

export default function StatusPill({
  tone = "green",
  children,
}: StatusPillProps) {
  return (
    <span className="caption-style bg-muted inline-flex shrink-0 items-center gap-0.5 rounded-full border border-[#363636] py-[3px] pr-[5px] pl-[3px]">
      {tone === "green" && <ActiveDot aria-hidden className="size-3" />}
      {tone === "amber" && <PendingDot aria-hidden className="size-3" />}
      {tone === "none" && <span aria-hidden className="size-3" />}
      {children}
    </span>
  );
}
