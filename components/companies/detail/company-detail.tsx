"use client";

import { useState } from "react";
import Asset from "@/components/_ui/asset";
import Avatar from "@/components/_ui/avatar";
import Button from "@/components/_ui/button";
import Tag from "@/components/_ui/tag";
import { ScrollArea } from "@/components/_ui/scroll-area";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/_ui/sheet";
import FilterMenu from "@/components/_common/filter-menu";
import DetailSection from "./detail-section";
import CompanyPeople from "./company-people";
import PipelineHealth from "./pipeline-health";
import ActivityTrend from "./activity-trend";
import ScoreCard from "./score-card";
import {
  SCORE_CARDS,
  TAG_TONES,
  TREND_WINDOWS,
  ownerByName,
} from "@/data/companies";
import { REGIONS } from "@/data/deals";
import { summaryFor } from "@/lib/companies";
import { useHandoff } from "@/lib/use-handoff";
import { useCompaniesStore } from "@/stores/companies-store";
import { useContactsStore } from "@/stores/contacts-store";
import { useCompanySummaries, useDealsStore } from "@/stores/deals-store";
import BuildingIcon from "@/public/assets/images/companies/detail/building.svg";
import XIcon from "@/public/assets/images/companies/detail/x.svg";
import MailIcon from "@/public/assets/images/companies/detail/mail-04.svg";
import PhoneIcon from "@/public/assets/images/companies/detail/phone.svg";

const WINDOW_OPTIONS = TREND_WINDOWS.map((label) => ({ value: label, label }));

export default function CompanyDetail() {
  const detailId = useCompaniesStore((state) => state.detailId);
  const detailOpen = useCompaniesStore((state) => state.detailOpen);
  const companies = useCompaniesStore((state) => state.companies);
  const summaries = useCompanySummaries();
  const deals = useDealsStore((state) => state.deals);
  const closeDetail = useCompaniesStore((state) => state.closeDetail);
  const openProfile = useCompaniesStore((state) => state.openProfile);
  const setAppDialog = useCompaniesStore((state) => state.setAppDialog);
  const openContact = useContactsStore((state) => state.openDetail);
  const handoff = useHandoff();
  const [trendWindow, setTrendWindow] = useState(TREND_WINDOWS[1]);
  const [scoreWindow, setScoreWindow] = useState(TREND_WINDOWS[1]);

  const scoreDays = Number(scoreWindow.match(/\d+/)?.[0] ?? 30);
  const scoreCards = SCORE_CARDS.filter((card) => card.ageDays <= scoreDays);
  const company = companies.find((item) => item.id === detailId);
  const owner = company ? ownerByName(company.owner) : null;
  const regions = REGIONS.filter((region) =>
    deals.some((deal) => deal.companyId === detailId && deal.region === region),
  );

  return (
    <Sheet
      open={detailOpen && company !== undefined}
      onOpenChange={(open) => !open && closeDetail()}
    >
      <SheetContent
        side="right"
        className="sm:w-[560px] sm:max-w-[560px]"
        onCloseAutoFocus={handoff.onCloseAutoFocus}
      >
        <SheetHeader>
          <div className="flex items-center gap-2">
            <BuildingIcon aria-hidden className="text-icon size-3.5" />
            <SheetTitle>Companies Detail</SheetTitle>
          </div>
          <SheetDescription className="sr-only">
            Account summary, pipeline health, activity and score cards
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

        {company && owner && (
          <ScrollArea className="min-h-0 flex-1">
            <div className="flex items-start gap-3 p-5 shadow-[inset_0_-1px_0_var(--line-strong)]">
              <span className="bg-muted flex size-[50px] shrink-0 items-center justify-center rounded-[12.5px] shadow-[0px_6.25px_6.25px_0px_rgba(15,15,15,0.24),0px_0px_0px_1.563px_#232323]">
                {company.logo ? (
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
                    {company.name.slice(0, 1)}
                  </span>
                )}
              </span>
              <div className="flex min-w-0 flex-col gap-3">
                <h2 className="truncate">{company.name}</h2>
                <div className="flex flex-wrap items-center gap-[3px]">
                  {company.tags.map((tag) => (
                    <Tag key={tag} tone={TAG_TONES[tag]} size="sm">
                      {tag}
                    </Tag>
                  ))}
                  {regions.map((region) => (
                    <Tag key={region} tone="neutral" size="sm">
                      {region}
                    </Tag>
                  ))}
                </div>
              </div>
            </div>

            <DetailSection title="Account summary">
              <div className="lead-style flex flex-wrap items-center gap-x-4 gap-y-3">
                <Button
                  variant="ghost"
                  size="none"
                  onClick={() =>
                    handoff.run(closeDetail, () => openProfile(owner.name))
                  }
                  aria-label={`Open ${owner.name} profile`}
                  className="lead-style text-foreground -mx-1.5 gap-1.5 px-1.5 py-1 font-medium"
                >
                  <Avatar src={owner.avatar} alt="" />
                  {owner.name}
                </Button>
                <span className="flex items-center gap-1">
                  <MailIcon aria-hidden className="text-soft size-3" />
                  {owner.email}
                </span>
                <span className="flex items-center gap-1">
                  <PhoneIcon aria-hidden className="text-soft size-3" />
                  {owner.phone}
                </span>
              </div>
            </DetailSection>

            <DetailSection title="People">
              <CompanyPeople
                companyId={company.id}
                onOpenContact={(contactId) =>
                  handoff.run(closeDetail, () => openContact(contactId))
                }
              />
            </DetailSection>

            <DetailSection title="Pipeline health">
              <PipelineHealth summary={summaryFor(summaries, company.id)} />
            </DetailSection>

            <DetailSection
              title="Activity trend"
              action={
                <FilterMenu
                  value={trendWindow}
                  options={WINDOW_OPTIONS}
                  onChange={setTrendWindow}
                  align="end"
                />
              }
            >
              <ActivityTrend
                summary={summaryFor(summaries, company.id)}
                range={trendWindow}
              />
            </DetailSection>

            <DetailSection
              title="Score card"
              className="gap-3 shadow-none"
              action={
                <FilterMenu
                  value={scoreWindow}
                  options={WINDOW_OPTIONS}
                  onChange={setScoreWindow}
                  align="end"
                  className="shadow-[0px_4px_4px_0px_rgba(15,15,15,0.24),0px_0px_0px_1px_#393939]"
                />
              }
            >
              {scoreCards.length > 0 ? (
                <div className="flex flex-col gap-2">
                  {scoreCards.map((card, index) => (
                    <ScoreCard key={`${card.title}-${index}`} card={card} />
                  ))}
                </div>
              ) : (
                <span className="caption-style text-subtle block">
                  No score cards updated in this period.
                </span>
              )}
            </DetailSection>
          </ScrollArea>
        )}

        <SheetFooter>
          <Button
            variant="link"
            size="none"
            className="lead-style"
            onClick={() => setAppDialog("help")}
          >
            Need help? Ask us.
          </Button>
          <div className="flex items-center gap-2">
            <SheetClose asChild>
              <Button variant="subtle" size="sm">
                Cancel
              </Button>
            </SheetClose>
            <Button variant="primary" size="sm" onClick={closeDetail}>
              Save Update
            </Button>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
