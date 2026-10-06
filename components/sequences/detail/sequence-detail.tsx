"use client";

import Avatar from "@/components/_ui/avatar";
import Button from "@/components/_ui/button";
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
import Tag from "@/components/_ui/tag";
import DetailSection from "@/components/companies/detail/detail-section";
import EnrollmentItem from "./enrollment-item";
import StepItem from "./step-item";
import { ownerByName } from "@/data/companies";
import { formatDate } from "@/lib/companies";
import {
  SEQUENCE_STATUS_TONES,
  canActivate,
  sequenceDeal,
  stepCountLabel,
} from "@/lib/sequences";
import { useHandoff } from "@/lib/use-handoff";
import { useCompanyMap } from "@/stores/companies-store";
import { useContactsStore } from "@/stores/contacts-store";
import { useDealsStore } from "@/stores/deals-store";
import { useSequencesStore } from "@/stores/sequences-store";
import MailIcon from "@/public/assets/images/companies/sidebar/mail.svg";
import PlusIcon from "@/public/assets/images/_common/plus.svg";
import XIcon from "@/public/assets/images/companies/detail/x.svg";

export default function SequenceDetail() {
  const detailId = useSequencesStore((state) => state.detailId);
  const detailOpen = useSequencesStore((state) => state.detailOpen);
  const sequences = useSequencesStore((state) => state.sequences);
  const closeDetail = useSequencesStore((state) => state.closeDetail);
  const setSequenceStatus = useSequencesStore(
    (state) => state.setSequenceStatus,
  );
  const setEnrollSequenceId = useSequencesStore(
    (state) => state.setEnrollSequenceId,
  );
  const markReplied = useSequencesStore((state) => state.markReplied);
  const bookMeeting = useSequencesStore((state) => state.bookMeeting);
  const removeEnrollment = useSequencesStore((state) => state.removeEnrollment);
  const openEdit = useSequencesStore((state) => state.openEdit);
  const contacts = useContactsStore((state) => state.contacts);
  const openContact = useContactsStore((state) => state.openDetail);
  const deals = useDealsStore((state) => state.deals);
  const openDeal = useDealsStore((state) => state.openDetail);
  const companyById = useCompanyMap();
  const handoff = useHandoff();

  const sequence = sequences.find((item) => item.id === detailId);
  const owner = sequence ? ownerByName(sequence.owner) : null;
  const canEnroll = sequence?.status === "Active";

  return (
    <Sheet
      open={detailOpen && sequence !== undefined}
      onOpenChange={(open) => !open && closeDetail()}
    >
      <SheetContent
        side="right"
        className="sm:w-[560px] sm:max-w-[560px]"
        onCloseAutoFocus={handoff.onCloseAutoFocus}
      >
        <SheetHeader>
          <div className="flex items-center gap-2">
            <MailIcon aria-hidden className="text-icon size-3.5" />
            <SheetTitle>Sequence Detail</SheetTitle>
          </div>
          <SheetDescription className="sr-only">
            Sequence status, steps with results and enrolled contacts
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

        {sequence && owner && (
          <ScrollArea className="min-h-0 flex-1">
            <div className="flex flex-col gap-3 p-5 shadow-[inset_0_-1px_0_var(--line-strong)]">
              <div className="flex items-start justify-between gap-3">
                <h2 className="min-w-0">{sequence.name}</h2>
                <Tag
                  tone={SEQUENCE_STATUS_TONES[sequence.status]}
                  size="sm"
                  className="mt-1"
                >
                  {sequence.status}
                </Tag>
              </div>
              <div className="caption-style text-soft flex flex-wrap items-center gap-x-4 gap-y-2">
                <span className="flex items-center gap-1.5">
                  <Avatar src={owner.avatar} alt="" />
                  {owner.name}
                </span>
                <span>{stepCountLabel(sequence.steps.length)}</span>
                <span>Created {formatDate(sequence.createdAt)}</span>
              </div>
            </div>

            <DetailSection
              title="Steps"
              action={
                sequence.status === "Draft" ? (
                  <Button
                    variant="subtle"
                    size="sm"
                    onClick={() =>
                      handoff.run(closeDetail, () => openEdit(sequence.id))
                    }
                  >
                    Edit steps
                  </Button>
                ) : undefined
              }
            >
              {sequence.steps.length > 0 ? (
                <ol className="divide-line-strong flex flex-col divide-y">
                  {sequence.steps.map((step) => (
                    <StepItem key={step.id} step={step} />
                  ))}
                </ol>
              ) : (
                <span className="caption-style text-subtle block">
                  This sequence has no steps yet.
                </span>
              )}
            </DetailSection>

            <DetailSection
              title="Enrollments"
              className="shadow-none"
              action={
                <Button
                  variant="subtle"
                  size="sm"
                  onClick={() => setEnrollSequenceId(sequence.id)}
                  disabled={!canEnroll}
                >
                  <PlusIcon aria-hidden className="size-3" />
                  Enroll contacts
                </Button>
              }
            >
              {!canEnroll && (
                <span className="caption-style text-subtle block">
                  {sequence.status === "Paused"
                    ? "Resume this sequence to enroll more contacts."
                    : "Activate this sequence to enroll contacts."}
                </span>
              )}
              {sequence.enrollments.length > 0 ? (
                <ul className="divide-line-strong flex flex-col divide-y">
                  {sequence.enrollments.map((enrollment) => {
                    const contact = contacts.find(
                      (item) => item.id === enrollment.contactId,
                    );
                    if (!contact) return null;
                    return (
                      <EnrollmentItem
                        key={enrollment.id}
                        sequence={sequence}
                        enrollment={enrollment}
                        contact={contact}
                        companyName={
                          companyById.get(contact.companyId)?.name ?? ""
                        }
                        deal={sequenceDeal(enrollment, deals)}
                        onOpenContact={() =>
                          handoff.run(closeDetail, () =>
                            openContact(contact.id),
                          )
                        }
                        onOpenDeal={() => {
                          if (!enrollment.dealId) return;
                          const dealId = enrollment.dealId;
                          handoff.run(closeDetail, () => openDeal(dealId));
                        }}
                        onReplied={() =>
                          markReplied(sequence.id, enrollment.id)
                        }
                        onMeeting={() =>
                          bookMeeting(sequence.id, enrollment.id)
                        }
                        onRemove={() =>
                          removeEnrollment(sequence.id, enrollment.id)
                        }
                      />
                    );
                  })}
                </ul>
              ) : (
                <span className="caption-style text-subtle block">
                  No one is enrolled yet.
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
          {sequence && (
            <div className="flex flex-col-reverse items-end gap-1.5 sm:flex-row sm:items-center sm:gap-3">
              {sequence.status === "Draft" && !canActivate(sequence) && (
                <span className="caption-style text-subtle">
                  Needs at least one step
                </span>
              )}
              {sequence.status === "Active" ? (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setSequenceStatus(sequence.id, "Paused")}
                >
                  Pause
                </Button>
              ) : (
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => setSequenceStatus(sequence.id, "Active")}
                  disabled={!canActivate(sequence)}
                >
                  {sequence.status === "Paused" ? "Resume" : "Activate"}
                </Button>
              )}
            </div>
          )}
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
