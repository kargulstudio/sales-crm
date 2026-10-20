"use client";

import { useMemo, useState, type FormEvent } from "react";
import Avatar from "@/components/_ui/avatar";
import Button from "@/components/_ui/button";
import CountBadge from "@/components/_ui/count-badge";
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
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/_ui/tabs";
import FilterMenu from "@/components/_common/filter-menu";
import DetailSection from "./detail-section";
import PipelineHealth from "./pipeline-health";
import ActivityTrend from "./activity-trend";
import ScoreCard from "./score-card";
import ActivityTimeline from "./activity-timeline";
import CompanyNotes from "./company-notes";
import CompanyFields, {
  draftToPatch,
  isDirty,
  toDraft,
  validateDraft,
  type CompanyDraft,
  type DraftErrors,
} from "./company-fields";
import {
  TAG_TONES,
  TREND_WINDOWS,
  ownerByName,
  type Company,
} from "@/data/companies";
import { buildTimeline } from "@/lib/activity";
import { scoreCardsFor, type TrendWindow } from "@/lib/companies";
import CompanyLogo from "@/components/companies/company-logo";
import { useCompaniesStore } from "@/stores/companies-store";
import { toast } from "@/stores/toast-store";
import BuildingIcon from "@/public/assets/images/companies/detail/building.svg";
import XIcon from "@/public/assets/images/companies/detail/x.svg";
import MailIcon from "@/public/assets/images/companies/detail/mail-04.svg";
import PhoneIcon from "@/public/assets/images/companies/detail/phone.svg";

const WINDOW_OPTIONS = TREND_WINDOWS.map((label) => ({ value: label, label }));

type DetailTab = "overview" | "activity" | "notes";

export default function CompanyDetail() {
  const detailId = useCompaniesStore((state) => state.detailId);
  const detailOpen = useCompaniesStore((state) => state.detailOpen);
  const companies = useCompaniesStore((state) => state.companies);
  const closeDetail = useCompaniesStore((state) => state.closeDetail);

  const company = companies.find((item) => item.id === detailId);

  return (
    <Sheet
      open={detailOpen && company !== undefined}
      onOpenChange={(open) => !open && closeDetail()}
    >
      <SheetContent side="right" className="sm:w-140 sm:max-w-140">
        <SheetHeader>
          <div className="flex items-center gap-2">
            <BuildingIcon aria-hidden className="text-icon size-3.5" />
            <SheetTitle>Company details</SheetTitle>
          </div>
          <SheetDescription className="sr-only">
            Account summary, editable details, activity timeline and notes
          </SheetDescription>
          <SheetClose asChild>
            <Button
              variant="ghost"
              size="icon-sm"
              className="-mr-2"
              aria-label="Close details"
            >
              <XIcon aria-hidden className="text-foreground size-4" />
            </Button>
          </SheetClose>
        </SheetHeader>

        {company && <DetailBody key={company.id} company={company} />}
      </SheetContent>
    </Sheet>
  );
}

function DetailBody({ company }: { company: Company }) {
  const openProfile = useCompaniesStore((state) => state.openProfile);
  const setShortcutsOpen = useCompaniesStore((state) => state.setShortcutsOpen);
  const updateCompany = useCompaniesStore((state) => state.updateCompany);
  const notes = useCompaniesStore((state) => state.notes);
  const changes = useCompaniesStore((state) => state.changes);
  const [tab, setTab] = useState<DetailTab>("overview");
  const [trendWindow, setTrendWindow] = useState<TrendWindow>(TREND_WINDOWS[1]);
  const [scoreWindow, setScoreWindow] = useState<TrendWindow>(TREND_WINDOWS[1]);
  const [draft, setDraft] = useState<CompanyDraft>(() => toDraft(company));
  const [errors, setErrors] = useState<DraftErrors>({});
  const [baseline, setBaseline] = useState(company);

  // Saves, undo and bulk actions replace the company object; resync the form.
  if (baseline !== company) {
    setBaseline(company);
    setDraft(toDraft(company));
    setErrors({});
  }

  const owner = ownerByName(company.owner);
  const dirty = isDirty(draft, company);
  const companyNotes = useMemo(
    () => notes.filter((note) => note.companyId === company.id),
    [notes, company.id],
  );
  const timeline = useMemo(
    () => buildTimeline(company, notes, changes),
    [company, notes, changes],
  );

  function update<K extends keyof CompanyDraft>(
    key: K,
    value: CompanyDraft[K],
  ) {
    setDraft((current) => ({ ...current, [key]: value }));
    if (key in errors) {
      setErrors((current) => ({ ...current, [key]: undefined }));
    }
  }

  function save(event?: FormEvent) {
    event?.preventDefault();
    const found = validateDraft(draft);
    if (Object.keys(found).length > 0) {
      setErrors(found);
      setTab("overview");
      return;
    }
    const name = draft.name.trim();
    toast(`Saved ${name}`, updateCompany(company.id, draftToPatch(draft)));
  }

  return (
    <>
      <ScrollArea className="min-h-0 flex-1">
        <div className="flex items-start gap-3 px-6 pt-5 pb-1">
          <CompanyLogo company={company} size="lg" />
          <div className="flex min-w-0 flex-col gap-3">
            <h2 className="truncate">{company.name}</h2>
            <div className="flex flex-wrap items-center gap-0.75">
              {company.tags.map((tag) => (
                <Tag key={tag} tone={TAG_TONES[tag]} size="sm">
                  {tag}
                </Tag>
              ))}
            </div>
          </div>
        </div>

        <Tabs value={tab} onValueChange={(value) => setTab(value as DetailTab)}>
          <TabsList className="shadow-divider px-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="activity">
              <span className="flex items-center gap-1.5">
                Activity
                <CountBadge>{timeline.length}</CountBadge>
              </span>
            </TabsTrigger>
            <TabsTrigger value="notes">
              <span className="flex items-center gap-1.5">
                Notes
                <CountBadge>{companyNotes.length}</CountBadge>
              </span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <DetailSection title="Account summary">
              <div className="lead-style flex flex-wrap items-center gap-x-4 gap-y-3">
                <Button
                  variant="ghost"
                  size="inline"
                  onClick={() => openProfile(owner.name)}
                  aria-label={`Open ${owner.name} profile`}
                  className="lead-style text-foreground -my-1 font-medium"
                >
                  <Avatar src={owner.avatar} alt="" />
                  {owner.name}
                </Button>
                <span className="flex items-center gap-1">
                  <MailIcon aria-hidden className="text-fg-secondary size-3" />
                  {owner.email}
                </span>
                <span className="flex items-center gap-1">
                  <PhoneIcon aria-hidden className="text-fg-secondary size-3" />
                  {owner.phone}
                </span>
              </div>
            </DetailSection>

            <DetailSection title="Details">
              <form id="company-details-form" onSubmit={save} noValidate>
                <CompanyFields
                  draft={draft}
                  errors={errors}
                  onChange={update}
                />
                <button type="submit" hidden tabIndex={-1} />
              </form>
            </DetailSection>

            <DetailSection title="Pipeline health">
              <PipelineHealth company={company} />
            </DetailSection>

            <DetailSection
              title="Activity trend"
              action={
                <FilterMenu
                  value={trendWindow}
                  options={WINDOW_OPTIONS}
                  onChange={(value) => setTrendWindow(value as TrendWindow)}
                  align="end"
                />
              }
            >
              <ActivityTrend company={company} window={trendWindow} />
            </DetailSection>

            <DetailSection
              title="Score card"
              className="shadow-none"
              action={
                <FilterMenu
                  value={scoreWindow}
                  options={WINDOW_OPTIONS}
                  onChange={(value) => setScoreWindow(value as TrendWindow)}
                  align="end"
                  className="shadow-raised"
                />
              }
            >
              <div className="flex flex-col gap-2">
                {scoreCardsFor(company, scoreWindow).map((card, index) => (
                  <ScoreCard key={`${card.title}-${index}`} card={card} />
                ))}
              </div>
            </DetailSection>
          </TabsContent>

          <TabsContent value="activity" className="px-6 py-5">
            <ActivityTimeline entries={timeline} />
          </TabsContent>

          <TabsContent value="notes" className="px-6 py-5">
            <CompanyNotes companyId={company.id} notes={companyNotes} />
          </TabsContent>
        </Tabs>
      </ScrollArea>

      <SheetFooter>
        {dirty ? (
          <span
            role="status"
            className="caption-style text-fg-secondary flex min-w-0 items-center gap-1.5 truncate"
          >
            <span aria-hidden className="bg-warning size-1.5 rounded-full" />
            Unsaved changes
          </span>
        ) : (
          <Button
            variant="link"
            size="none"
            onClick={() => setShortcutsOpen(true)}
            className="lead-style min-w-0 truncate max-[359px]:hidden"
          >
            Keyboard shortcuts
          </Button>
        )}
        <div className="ml-auto flex shrink-0 items-center gap-2">
          {dirty ? (
            <Button
              variant="subtle"
              size="sm"
              onClick={() => {
                setDraft(toDraft(company));
                setErrors({});
              }}
            >
              Discard
            </Button>
          ) : (
            <SheetClose asChild>
              <Button variant="subtle" size="sm">
                Close
              </Button>
            </SheetClose>
          )}
          <Button
            variant="primary"
            size="sm"
            onClick={() => save()}
            disabled={!dirty}
          >
            Save Update
          </Button>
        </div>
      </SheetFooter>
    </>
  );
}
