"use client";

import Asset from "@/components/_ui/asset";
import Avatar from "@/components/_ui/avatar";
import Button from "@/components/_ui/button";
import Field from "@/components/_ui/field";
import { ScrollArea } from "@/components/_ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/_ui/select";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/_ui/sheet";
import Tag from "@/components/_ui/tag";
import SegmentBar from "@/components/_common/segment-bar";
import DetailSection from "@/components/companies/detail/detail-section";
import { TAG_TONES, ownerByName } from "@/data/companies";
import {
  DEAL_STAGES,
  LOST_STAGE,
  REGIONS,
  WON_STAGE,
  type DealActivityType,
  type DealStage,
  type Region,
} from "@/data/deals";
import { formatDate, formatMoney } from "@/lib/companies";
import {
  MAX_OPEN_WIN,
  OVERRIDE_STEP,
  dealWinBreakdown,
  isOpenStage,
  isStale,
  lastActivityDays,
} from "@/lib/deals";
import { useHandoff } from "@/lib/use-handoff";
import { cn } from "@/lib/utils";
import { useCompaniesStore } from "@/stores/companies-store";
import { useDealsStore } from "@/stores/deals-store";
import CalendarIcon from "@/public/assets/images/_common/calendar.svg";
import ClipboardIcon from "@/public/assets/images/companies/sidebar/clipboard.svg";
import ClockIcon from "@/public/assets/images/companies/detail/clock.svg";
import XIcon from "@/public/assets/images/companies/detail/x.svg";

const QUICK_LOGS: { type: DealActivityType; label: string }[] = [
  { type: "meeting", label: "Log meeting" },
  { type: "reply", label: "Got a reply" },
  { type: "proposalViewed", label: "Proposal viewed" },
  { type: "closePushed", label: "Close date pushed" },
];

const OVERRIDE_OPTIONS = Array.from(
  { length: Math.floor(MAX_OPEN_WIN / OVERRIDE_STEP) },
  (_, index) => (index + 1) * OVERRIDE_STEP,
);

export default function DealDetail() {
  const detailId = useDealsStore((state) => state.detailId);
  const detailOpen = useDealsStore((state) => state.detailOpen);
  const deals = useDealsStore((state) => state.deals);
  const closeDetail = useDealsStore((state) => state.closeDetail);
  const moveDeal = useDealsStore((state) => state.moveDeal);
  const setRegion = useDealsStore((state) => state.setRegion);
  const logActivity = useDealsStore((state) => state.logActivity);
  const openPush = useDealsStore((state) => state.openPush);
  const setWinOverride = useDealsStore((state) => state.setWinOverride);
  const companies = useCompaniesStore((state) => state.companies);
  const openProfile = useCompaniesStore((state) => state.openProfile);
  const openCompanyDetail = useCompaniesStore((state) => state.openDetail);
  const setAppDialog = useCompaniesStore((state) => state.setAppDialog);
  const handoff = useHandoff();

  const deal = deals.find((item) => item.id === detailId);
  const company = deal
    ? companies.find((item) => item.id === deal.companyId)
    : undefined;
  const owner = deal ? ownerByName(deal.owner) : null;
  const open = deal ? isOpenStage(deal.stage) : false;
  const breakdown = deal ? dealWinBreakdown(deal) : null;
  const manual = breakdown?.manual ?? false;

  function finish(stage: DealStage) {
    if (!deal) return;
    moveDeal(deal.id, stage);
    closeDetail();
  }

  function openOwner() {
    if (!owner) return;
    handoff.run(closeDetail, () => openProfile(owner.name));
  }

  function openCompany() {
    if (!company) return;
    handoff.run(closeDetail, () => openCompanyDetail(company.id));
  }

  return (
    <Sheet
      open={detailOpen && deal !== undefined}
      onOpenChange={(open) => !open && closeDetail()}
    >
      <SheetContent
        side="right"
        className="sm:w-[560px] sm:max-w-[560px]"
        onCloseAutoFocus={handoff.onCloseAutoFocus}
      >
        <SheetHeader>
          <div className="flex items-center gap-2">
            <ClipboardIcon aria-hidden className="text-icon size-3.5" />
            <SheetTitle>Deal Detail</SheetTitle>
          </div>
          <SheetDescription className="sr-only">
            Deal summary, stage, value, close date and next step
          </SheetDescription>
          <SheetClose asChild>
            <Button
              variant="ghost"
              size="icon-sm"
              className="-mr-1"
              aria-label="Close details"
            >
              <XIcon aria-hidden className="text-foreground size-4" />
            </Button>
          </SheetClose>
        </SheetHeader>

        {deal && owner && breakdown && (
          <ScrollArea className="min-h-0 flex-1">
            <div className="flex items-start gap-3 p-5 shadow-[inset_0_-1px_0_var(--line-strong)]">
              <span className="bg-muted flex size-[50px] shrink-0 items-center justify-center rounded-[12.5px] shadow-[0px_6.25px_6.25px_0px_rgba(15,15,15,0.24),0px_0px_0px_1.563px_#232323]">
                {company?.logo ? (
                  <Asset
                    type="image"
                    src={company.logo}
                    alt={`${company.name} logo`}
                    width={1}
                    height={1}
                    fit="contain"
                    className="size-8"
                  />
                ) : (
                  <span className="h2-style text-soft">
                    {(company?.name ?? deal.name).slice(0, 1)}
                  </span>
                )}
              </span>
              <div className="flex min-w-0 flex-col gap-3">
                <h2 className="line-clamp-2">{deal.name}</h2>
                <div className="flex flex-wrap items-center gap-[3px]">
                  <Tag tone={TAG_TONES[deal.motion]} size="sm">
                    {deal.motion}
                  </Tag>
                  <Tag tone="neutral" size="sm">
                    {deal.stage}
                  </Tag>
                  {isStale(deal) && (
                    <Tag tone="amber" size="sm">
                      Stale
                    </Tag>
                  )}
                </div>
              </div>
            </div>

            <DetailSection title="Company">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <span className="lead-style text-foreground">
                  {company?.name ?? "Unknown company"}
                </span>
                {company && (
                  <Button variant="secondary" size="sm" onClick={openCompany}>
                    Open company
                  </Button>
                )}
              </div>
            </DetailSection>

            <DetailSection title="Stage">
              <Field label="Move deal to" htmlFor="deal-detail-stage">
                <Select
                  value={deal.stage}
                  onValueChange={(value) =>
                    moveDeal(deal.id, value as DealStage)
                  }
                >
                  <SelectTrigger id="deal-detail-stage">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {DEAL_STAGES.map((stage) => (
                      <SelectItem key={stage} value={stage}>
                        {stage}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
            </DetailSection>

            <DetailSection title="Region">
              <Field label="Pipeline region" htmlFor="deal-detail-region">
                <Select
                  value={deal.region}
                  onValueChange={(value) => setRegion(deal.id, value as Region)}
                >
                  <SelectTrigger id="deal-detail-region">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {REGIONS.map((region) => (
                      <SelectItem key={region} value={region}>
                        {region}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
            </DetailSection>

            <DetailSection title="Deal summary">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <span className="caption-style text-soft">Value</span>
                  <span className="lead-style text-foreground tabular-nums">
                    ${formatMoney(deal.value)}
                  </span>
                </div>
                <div className="flex flex-col gap-1.5">
                  <span className="caption-style text-soft">Close date</span>
                  <span className="lead-style text-foreground flex items-center gap-1.5 tabular-nums">
                    <CalendarIcon aria-hidden className="text-soft size-3.5" />
                    {formatDate(deal.closeDate)}
                  </span>
                </div>
                <div className="col-span-2 flex flex-col gap-2">
                  <span className="caption-style text-soft flex items-center justify-between">
                    Win chance
                    <span className="text-foreground flex items-center gap-2 tabular-nums">
                      {manual && (
                        <Tag tone="neutral" size="sm">
                          Manual
                        </Tag>
                      )}
                      {breakdown.win}%
                    </span>
                  </span>
                  <SegmentBar
                    percent={breakdown.win}
                    segments={63}
                    className="h-3 w-full border border-white/4 px-px"
                    segmentClassName="h-2"
                    trackClassName="bg-white/8"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <span className="caption-style text-soft">Last activity</span>
                  <span className="lead-style text-foreground flex items-center gap-1.5 tabular-nums">
                    <ClockIcon aria-hidden className="text-soft size-3.5" />
                    {lastActivityDays(deal)}d ago
                  </span>
                </div>
                <div className="flex flex-col gap-1.5">
                  <span className="caption-style text-soft">Owner</span>
                  <Button
                    variant="ghost"
                    size="none"
                    onClick={openOwner}
                    aria-label={`Open ${owner.name} profile`}
                    className="lead-style text-foreground -mx-1.5 justify-start gap-1.5 px-1.5 py-1 font-medium"
                  >
                    <Avatar src={owner.avatar} alt="" />
                    {owner.name}
                  </Button>
                </div>
              </div>
            </DetailSection>

            <DetailSection
              title="Why this number"
              action={
                <Button
                  variant="link"
                  size="none"
                  className="caption-style text-soft"
                  onClick={() => setAppDialog("help")}
                >
                  How is this worked out?
                </Button>
              }
            >
              <ul className="divide-line-strong flex flex-col divide-y">
                <li className="flex items-center justify-between gap-3 py-2 first:pt-0">
                  <span className="text-foreground">{deal.stage} stage</span>
                  <span className="text-foreground tabular-nums">
                    {breakdown.base}%
                  </span>
                </li>
                {breakdown.adjustments.map((item) => (
                  <li
                    key={item.key}
                    className="flex items-center justify-between gap-3 py-2"
                  >
                    <span className="text-soft flex min-w-0 items-center gap-2">
                      <span className="truncate">{item.label}</span>
                      {item.date && (
                        <span className="caption-style text-subtle tabular-nums">
                          {formatDate(item.date)}
                        </span>
                      )}
                    </span>
                    <span
                      className={cn(
                        "tabular-nums",
                        item.delta > 0
                          ? "text-success"
                          : item.delta < 0
                            ? "text-warning"
                            : "text-subtle",
                      )}
                    >
                      {item.delta > 0 ? "+" : item.delta < 0 ? "−" : ""}
                      {Math.abs(item.delta)}
                    </span>
                  </li>
                ))}
                {open && (
                  <li className="flex items-center justify-between gap-3 py-2 last:pb-0">
                    <span className="text-foreground">
                      {manual ? "Automatic result" : "Win chance"}
                    </span>
                    <span className="text-foreground tabular-nums">
                      {breakdown.computed}%
                    </span>
                  </li>
                )}
              </ul>
            </DetailSection>

            {open && (
              <DetailSection title="Log activity">
                <div className="flex flex-wrap gap-2">
                  {QUICK_LOGS.map((item) => (
                    <Button
                      key={item.type}
                      variant="secondary"
                      size="sm"
                      onClick={() =>
                        item.type === "closePushed"
                          ? openPush(deal.id)
                          : logActivity(deal.id, item.type)
                      }
                    >
                      {item.label}
                    </Button>
                  ))}
                </div>
              </DetailSection>
            )}

            {open && (
              <DetailSection title="Override">
                <div className="flex flex-wrap items-end gap-3">
                  <Field
                    label="Set win chance"
                    htmlFor="deal-detail-override"
                    className="min-w-[160px] flex-1"
                  >
                    <Select
                      value={manual ? String(deal.winOverride) : ""}
                      onValueChange={(value) =>
                        setWinOverride(deal.id, Number(value))
                      }
                    >
                      <SelectTrigger id="deal-detail-override">
                        <SelectValue placeholder="Automatic" />
                      </SelectTrigger>
                      <SelectContent>
                        {OVERRIDE_OPTIONS.map((value) => (
                          <SelectItem key={value} value={String(value)}>
                            {value}%
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </Field>
                  <Button
                    variant="subtle"
                    size="sm"
                    onClick={() => setWinOverride(deal.id, null)}
                    disabled={!manual}
                  >
                    Use automatic
                  </Button>
                </div>
              </DetailSection>
            )}

            <DetailSection title="Next step" className="shadow-none">
              <p className="text-soft">{deal.nextStep}</p>
            </DetailSection>
          </ScrollArea>
        )}

        <SheetFooter>
          <Button
            variant="subtle"
            size="sm"
            onClick={() => finish(LOST_STAGE)}
            disabled={deal?.stage === LOST_STAGE}
          >
            Mark lost
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => finish(WON_STAGE)}
            disabled={deal?.stage === WON_STAGE}
          >
            Mark won
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
