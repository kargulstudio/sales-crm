"use client";

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
import DetailSection from "@/components/companies/detail/detail-section";
import ContactInitials from "../contact-initials";
import CopyButton from "../copy-button";
import ContactActions from "./contact-actions";
import { CONTACT_ROLES, type ContactRole } from "@/data/contacts";
import { formatDate, formatMoney } from "@/lib/companies";
import {
  CONTACT_ROLE_TONES,
  contactDeals,
  contactEvents,
  contactPhoneHref,
  contactSummaryFor,
} from "@/lib/contacts";
import { ACTIVITY_EFFECTS, isOpenStage } from "@/lib/deals";
import {
  contactEnrollments,
  displayStatus,
  enrollmentProgress,
} from "@/lib/sequences";
import { useHandoff } from "@/lib/use-handoff";
import { useActivitiesStore } from "@/stores/activities-store";
import { useCompaniesStore, useCompanyMap } from "@/stores/companies-store";
import { useContactSummaries, useContactsStore } from "@/stores/contacts-store";
import { useDealsStore } from "@/stores/deals-store";
import { useSequencesStore } from "@/stores/sequences-store";
import BookClosedIcon from "@/public/assets/images/companies/sidebar/book-closed.svg";
import MailIcon from "@/public/assets/images/contacts/mail.svg";
import PhoneIcon from "@/public/assets/images/contacts/phone.svg";
import XIcon from "@/public/assets/images/companies/detail/x.svg";

const RECENT_LIMIT = 8;

export default function ContactDetail() {
  const detailId = useContactsStore((state) => state.detailId);
  const detailOpen = useContactsStore((state) => state.detailOpen);
  const contacts = useContactsStore((state) => state.contacts);
  const closeDetail = useContactsStore((state) => state.closeDetail);
  const setRole = useContactsStore((state) => state.setRole);
  const summaries = useContactSummaries();
  const companyById = useCompanyMap();
  const deals = useDealsStore((state) => state.deals);
  const openDealDetail = useDealsStore((state) => state.openDetail);
  const openCompanyDetail = useCompaniesStore((state) => state.openDetail);
  const openLog = useActivitiesStore((state) => state.openLog);
  const sequences = useSequencesStore((state) => state.sequences);
  const setContactEnrollId = useSequencesStore(
    (state) => state.setContactEnrollId,
  );
  const handoff = useHandoff();

  const contact = contacts.find((item) => item.id === detailId);
  const company = contact ? companyById.get(contact.companyId) : undefined;
  const summary = contact ? contactSummaryFor(summaries, contact.id) : null;
  const linkedDeals = contact ? contactDeals(contact, deals) : [];
  const firstOpenDeal = linkedDeals.find((deal) => isOpenStage(deal.stage));
  const recent = contact
    ? contactEvents(contact, deals).slice(0, RECENT_LIMIT)
    : [];
  const enrolled = contact ? contactEnrollments(contact.id, sequences) : [];
  const canEnroll =
    contact !== undefined &&
    summary !== null &&
    !summary.left &&
    sequences.some(
      (sequence) =>
        sequence.status === "Active" &&
        !sequence.enrollments.some(
          (enrollment) => enrollment.contactId === contact.id,
        ),
    );

  function openCompany() {
    if (!company) return;
    handoff.run(closeDetail, () => openCompanyDetail(company.id));
  }

  function openDeal(dealId: string) {
    handoff.run(closeDetail, () => openDealDetail(dealId));
  }

  function logActivity() {
    if (!contact || !firstOpenDeal) return;
    handoff.run(closeDetail, () => openLog(firstOpenDeal.id, contact.id));
  }

  return (
    <Sheet
      open={detailOpen && contact !== undefined}
      onOpenChange={(open) => !open && closeDetail()}
    >
      <SheetContent
        side="right"
        className="sm:w-[560px] sm:max-w-[560px]"
        onCloseAutoFocus={handoff.onCloseAutoFocus}
      >
        <SheetHeader>
          <div className="flex items-center gap-2">
            <BookClosedIcon aria-hidden className="text-icon size-3.5" />
            <SheetTitle>Contact Detail</SheetTitle>
          </div>
          <SheetDescription className="sr-only">
            Contact summary, role, linked deals and recent activity
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

        {contact && summary && (
          <ScrollArea className="min-h-0 flex-1">
            <div className="flex flex-col gap-4 p-5 shadow-[inset_0_-1px_0_var(--line-strong)]">
              <div className="flex items-start gap-3">
                <ContactInitials name={contact.name} size="lg" />
                <div className="flex min-w-0 flex-col gap-3">
                  <div className="flex min-w-0 flex-col gap-1.5">
                    <h2 className="truncate">{contact.name}</h2>
                    <span className="caption-style text-soft">
                      {contact.title}
                      {company && ` · ${company.name}`}
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-[3px]">
                    <Tag tone={CONTACT_ROLE_TONES[contact.role]} size="sm">
                      {contact.role}
                    </Tag>
                    {summary.left && (
                      <Tag tone="neutral" size="sm">
                        Left company
                      </Tag>
                    )}
                  </div>
                </div>
              </div>
              <ContactActions contact={contact} left={summary.left} />
            </div>

            <DetailSection title="Contact">
              <div className="lead-style flex flex-wrap items-center gap-x-4 gap-y-3">
                {company && (
                  <Button
                    variant="ghost"
                    size="none"
                    onClick={openCompany}
                    aria-label={`Open ${company.name} details`}
                    className="lead-style text-foreground -mx-1.5 gap-1.5 px-1.5 py-1 font-medium"
                  >
                    {company.name}
                  </Button>
                )}
                {contact.email && (
                  <span className="flex items-center gap-1">
                    <a
                      href={`mailto:${contact.email}`}
                      className="hover:text-foreground flex items-center gap-1"
                    >
                      <MailIcon aria-hidden className="text-soft size-3.5" />
                      {contact.email}
                    </a>
                    <CopyButton value={contact.email} label="Copy email" />
                  </span>
                )}
                {contact.phone && (
                  <span className="flex items-center gap-1">
                    <a
                      href={contactPhoneHref(contact.phone)}
                      className="hover:text-foreground flex items-center gap-1"
                    >
                      <PhoneIcon aria-hidden className="text-soft size-3.5" />
                      {contact.phone}
                    </a>
                    <CopyButton value={contact.phone} label="Copy phone" />
                  </span>
                )}
              </div>
            </DetailSection>

            <DetailSection title="Role">
              <Field
                label="Role on the account"
                htmlFor="contact-detail-role"
                hint={`Setting Decision maker logs Decision-maker added on their first open deal, +${ACTIVITY_EFFECTS.decisionMaker.delta} to win chance.`}
              >
                <Select
                  value={contact.role}
                  onValueChange={(value) =>
                    setRole(contact.id, value as ContactRole)
                  }
                >
                  <SelectTrigger id="contact-detail-role">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CONTACT_ROLES.map((role) => (
                      <SelectItem key={role} value={role}>
                        {role}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
            </DetailSection>

            <DetailSection title="Linked deals">
              {linkedDeals.length > 0 ? (
                <ul className="divide-line-strong flex flex-col divide-y">
                  {linkedDeals.map((deal) => (
                    <li key={deal.id}>
                      <Button
                        variant="item"
                        size="none"
                        onClick={() => openDeal(deal.id)}
                        className="items-center justify-between gap-3 rounded-none py-2.5"
                      >
                        <span className="flex min-w-0 flex-col gap-1.5">
                          <span className="text-foreground truncate">
                            {deal.name}
                          </span>
                          <span className="caption-style text-subtle">
                            {deal.stage}
                          </span>
                        </span>
                        <span className="text-foreground shrink-0 tabular-nums">
                          ${formatMoney(deal.value)}
                        </span>
                      </Button>
                    </li>
                  ))}
                </ul>
              ) : (
                <span className="caption-style text-subtle block">
                  Not linked to a deal yet.
                </span>
              )}
            </DetailSection>

            <DetailSection
              title="Sequences"
              action={
                <Button
                  variant="subtle"
                  size="sm"
                  onClick={() => setContactEnrollId(contact.id)}
                  disabled={!canEnroll}
                >
                  Enroll in sequence
                </Button>
              }
            >
              {enrolled.length > 0 ? (
                <ul className="divide-line-strong flex flex-col divide-y">
                  {enrolled.map(({ sequence, enrollment }) => {
                    const status = displayStatus(sequence, enrollment);
                    return (
                      <li
                        key={enrollment.id}
                        className="flex items-center justify-between gap-3 py-2.5 first:pt-0 last:pb-0"
                      >
                        <span className="flex min-w-0 flex-col gap-1.5">
                          <span className="text-foreground truncate">
                            {sequence.name}
                          </span>
                          <span className="caption-style text-subtle tabular-nums">
                            Step {enrollmentProgress(sequence, enrollment)}
                          </span>
                        </span>
                        <Tag tone={status.tone} size="sm">
                          {status.label}
                        </Tag>
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <span className="caption-style text-subtle block">
                  Not in any sequence yet.
                </span>
              )}
            </DetailSection>

            <DetailSection title="Recent activity" className="shadow-none">
              {recent.length > 0 ? (
                <ul className="divide-line-strong flex flex-col divide-y">
                  {recent.map(({ event, deal }) => (
                    <li
                      key={event.id}
                      className="flex items-center justify-between gap-3 py-2.5 first:pt-0 last:pb-0"
                    >
                      <span className="flex min-w-0 flex-col gap-1.5">
                        <span className="text-foreground">
                          {ACTIVITY_EFFECTS[event.type].label}
                        </span>
                        <span className="caption-style text-subtle truncate">
                          {deal.name}
                        </span>
                      </span>
                      <span className="caption-style text-soft shrink-0 tabular-nums">
                        {formatDate(event.date)}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <span className="caption-style text-subtle block">
                  Nothing has been logged with this person yet.
                </span>
              )}
            </DetailSection>
          </ScrollArea>
        )}

        <SheetFooter>
          <SheetClose asChild>
            <Button variant="subtle" size="sm">
              Close
            </Button>
          </SheetClose>
          <div className="flex flex-col-reverse items-end gap-1.5 sm:flex-row sm:items-center sm:gap-3">
            {!firstOpenDeal && (
              <span className="caption-style text-subtle">
                Link to an open deal first
              </span>
            )}
            <Button
              variant="primary"
              size="sm"
              onClick={logActivity}
              disabled={!firstOpenDeal}
            >
              Log activity
            </Button>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
