"use client";

import Button from "@/components/_ui/button";
import Tooltip from "@/components/_ui/tooltip";
import { ScrollArea } from "@/components/_ui/scroll-area";
import SidebarNavItem from "./sidebar-nav-item";
import SidebarSection from "./sidebar-section";
import { useCompaniesStore } from "@/stores/companies-store";
import Logo from "@/public/assets/images/_common/logo.svg";
import BuildingIcon from "@/public/assets/images/companies/sidebar/building.svg";
import ClipboardIcon from "@/public/assets/images/companies/sidebar/clipboard.svg";
import BarChartIcon from "@/public/assets/images/companies/sidebar/bar-chart.svg";
import ListIcon from "@/public/assets/images/companies/sidebar/list.svg";
import BookClosedIcon from "@/public/assets/images/companies/sidebar/book-closed.svg";
import MailIcon from "@/public/assets/images/companies/sidebar/mail.svg";
import TargetIcon from "@/public/assets/images/companies/sidebar/target-05.svg";
import TargetAltIcon from "@/public/assets/images/companies/sidebar/target-03.svg";
import UsersIcon from "@/public/assets/images/companies/sidebar/users.svg";
import BarChartAltIcon from "@/public/assets/images/companies/sidebar/bar-chart-10.svg";
import AlertTriangleIcon from "@/public/assets/images/companies/sidebar/alert-triangle.svg";
import UserPlusIcon from "@/public/assets/images/companies/sidebar/user-plus.svg";
import MessageQuestionIcon from "@/public/assets/images/companies/sidebar/message-question.svg";
import WalletIcon from "@/public/assets/images/companies/sidebar/wallet.svg";
import { STAGES, TAG_TONES, type Stage, type TagTone } from "@/data/companies";
import { ANY_STAGE } from "@/lib/companies";
import type { SVGProps } from "react";

const DOT_FILL: Record<TagTone, string> = {
  blue: "fill-(--tag-blue-text)",
  purple: "fill-(--tag-purple-text)",
  green: "fill-(--tag-green-text)",
  moss: "fill-(--tag-moss-text)",
  red: "fill-(--tag-red-text)",
  orange: "fill-(--tag-orange-text)",
  amber: "fill-(--tag-amber-text)",
  teal: "fill-(--tag-teal-text)",
  yellow: "fill-(--tag-yellow-text)",
  neutral: "fill-(--tag-neutral-text)",
};

function stageDot(stage: Stage) {
  function StageDot(props: SVGProps<SVGSVGElement>) {
    return (
      <svg viewBox="0 0 14 14" {...props}>
        <circle cx="7" cy="7" r="4" className={DOT_FILL[TAG_TONES[stage]]} />
      </svg>
    );
  }
  return StageDot;
}

const STAGE_DOTS = Object.fromEntries(
  STAGES.map((stage) => [stage, stageDot(stage)]),
) as Record<Stage, ReturnType<typeof stageDot>>;

export default function SidebarContent() {
  const companies = useCompaniesStore((state) => state.companies);
  const stage = useCompaniesStore((state) => state.stage);
  const setStage = useCompaniesStore((state) => state.setStage);
  const setSidebarOpen = useCompaniesStore((state) => state.setSidebarOpen);
  const setShortcutsOpen = useCompaniesStore((state) => state.setShortcutsOpen);
  const companyCount = companies.length;
  const loaded = useCompaniesStore((state) => state.loaded);

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="border-sidebar-border bg-sidebar-accent flex shrink-0 items-center gap-2 border-b p-3">
        <Logo aria-hidden className="size-8 shrink-0 overflow-visible" />
        <div className="flex min-w-0 flex-col gap-1">
          <span className="lead-style block truncate font-medium tracking-[-0.01em]">
            Sales CRM
          </span>
          <span className="caption-style text-fg-tertiary block truncate">
            Company pipeline
          </span>
        </div>
      </div>

      <ScrollArea className="min-h-0 flex-1">
        <nav aria-label="Primary">
          <SidebarSection className="border-sidebar-border border-b">
            <SidebarNavItem
              icon={BuildingIcon}
              label="Companies"
              count={loaded ? companyCount : undefined}
              active
            />
            <SidebarNavItem icon={ClipboardIcon} label="Deals Board" soon />
            <SidebarNavItem icon={BarChartIcon} label="Forecast" soon />
            <SidebarNavItem icon={ListIcon} label="Activities" soon />
            <SidebarNavItem icon={BookClosedIcon} label="Contacts" soon />
            <SidebarNavItem icon={MailIcon} label="Email Sequences" soon />
          </SidebarSection>

          <SidebarSection
            title="Team"
            className="border-sidebar-border border-b"
          >
            <SidebarNavItem icon={TargetIcon} label="Strategic AEs" soon />
            <SidebarNavItem icon={TargetAltIcon} label="Mid Market" soon />
            <SidebarNavItem icon={UsersIcon} label="SDR Team" soon />
          </SidebarSection>

          <SidebarSection
            title="Reporting"
            className="border-sidebar-border border-b"
          >
            <SidebarNavItem icon={BarChartAltIcon} label="Q1 Forecast" soon />
            <SidebarNavItem
              icon={AlertTriangleIcon}
              label="Slipping Deals"
              soon
            />
          </SidebarSection>

          <SidebarSection title="Stages">
            {STAGES.map((item) => (
              <SidebarNavItem
                key={item}
                icon={STAGE_DOTS[item]}
                label={item}
                count={
                  !loaded
                    ? undefined
                    : companies.filter((company) => company.tags.includes(item))
                        .length
                }
                pressed={stage === item}
                onClick={() => {
                  setStage(stage === item ? ANY_STAGE : item);
                  setSidebarOpen(false);
                }}
              />
            ))}
          </SidebarSection>
        </nav>
      </ScrollArea>

      <SidebarSection className="border-sidebar-border shrink-0 border-t border-b">
        <SidebarNavItem
          icon={UserPlusIcon}
          label="Invite teammates"
          tone="quiet"
          soon
        />
        <SidebarNavItem
          icon={MessageQuestionIcon}
          label="Help & shortcuts"
          tone="quiet"
          onClick={() => {
            setSidebarOpen(false);
            setShortcutsOpen(true);
          }}
        />
      </SidebarSection>

      <div className="border-sidebar-border bg-sidebar-accent flex shrink-0 items-center justify-between gap-2 border-b py-4 pr-3 pl-5">
        <div className="flex flex-col gap-2">
          <span className="lead-style block font-medium tracking-[-0.01em]">
            14 Days
          </span>
          <span className="caption-style text-fg-tertiary block">
            left in your trial
          </span>
        </div>
        <Tooltip content="Billing is coming soon" side="top">
          <span
            tabIndex={0}
            className="focus-visible:ring-ring rounded-full outline-none focus-visible:ring-2"
          >
            <Button variant="muted" size="md" disabled>
              <WalletIcon aria-hidden className="size-3.5" />
              Add billing
            </Button>
          </span>
        </Tooltip>
      </div>
    </div>
  );
}
