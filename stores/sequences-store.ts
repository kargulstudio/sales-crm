import { useMemo } from "react";
import { create } from "zustand";
import {
  SEQUENCES,
  type Enrollment,
  type Sequence,
  type SequenceStatus,
} from "@/data/sequences";
import { TODAY } from "@/lib/companies";
import { contactSummaryMap, firstOpenDeal } from "@/lib/contacts";
import { isOpenStage } from "@/lib/deals";
import {
  DEFAULT_SEQUENCE_FILTERS,
  activeSequenceCount,
  canActivate,
  enrollableContacts,
  filterSequences,
  hasLoggedEvent,
  sequenceStatsMap,
  type SequenceFilters,
} from "@/lib/sequences";
import { useContactsStore } from "@/stores/contacts-store";
import { useDealsStore } from "@/stores/deals-store";

type SequencesState = SequenceFilters & {
  sequences: Sequence[];
  detailId: string | null;
  detailOpen: boolean;
  newSequenceOpen: boolean;
  editSequenceId: string | null;
  editOpen: boolean;
  enrollSequenceId: string | null;
  contactEnrollId: string | null;
  setSortBy: (sortBy: SequenceFilters["sortBy"]) => void;
  setStatusFilter: (status: string) => void;
  setOwner: (owner: string) => void;
  resetFilters: () => void;
  openDetail: (id: string) => void;
  closeDetail: () => void;
  setNewSequenceOpen: (open: boolean) => void;
  openEdit: (id: string) => void;
  closeEdit: () => void;
  setEnrollSequenceId: (id: string | null) => void;
  setContactEnrollId: (id: string | null) => void;
  addSequence: (sequence: Sequence) => void;
  updateSequence: (sequence: Sequence) => void;
  setSequenceStatus: (id: string, status: SequenceStatus) => void;
  enrollContacts: (sequenceId: string, contactIds: string[]) => void;
  removeEnrollment: (sequenceId: string, enrollmentId: string) => void;
  markReplied: (sequenceId: string, enrollmentId: string) => void;
  bookMeeting: (sequenceId: string, enrollmentId: string) => void;
};

function patchEnrollment(
  sequences: Sequence[],
  sequenceId: string,
  enrollmentId: string,
  patch: Partial<Enrollment>,
  repliedStep?: number,
) {
  return sequences.map((sequence) =>
    sequence.id === sequenceId
      ? {
          ...sequence,
          steps:
            repliedStep === undefined
              ? sequence.steps
              : sequence.steps.map((step, index) => {
                  if (index !== repliedStep - 1) return step;
                  const replied = step.replied + 1;
                  return {
                    ...step,
                    replied,
                    opened:
                      step.channel === "Email" && step.opened < replied
                        ? replied
                        : step.opened,
                  };
                }),
          enrollments: sequence.enrollments.map((enrollment) =>
            enrollment.id === enrollmentId
              ? { ...enrollment, ...patch }
              : enrollment,
          ),
        }
      : sequence,
  );
}

function logOnOpenDeal(enrollment: Enrollment, type: "reply" | "meeting") {
  if (!enrollment.dealId) return;
  const { deals, logActivity } = useDealsStore.getState();
  const deal = deals.find((item) => item.id === enrollment.dealId);
  if (!deal || !isOpenStage(deal.stage)) return;
  if (hasLoggedEvent(deal, type, enrollment)) return;
  logActivity(deal.id, type, { contactId: enrollment.contactId });
}

export const useSequencesStore = create<SequencesState>((set, get) => ({
  sequences: SEQUENCES,
  ...DEFAULT_SEQUENCE_FILTERS,
  detailId: null,
  detailOpen: false,
  newSequenceOpen: false,
  editSequenceId: null,
  editOpen: false,
  enrollSequenceId: null,
  contactEnrollId: null,
  setSortBy: (sortBy) => set({ sortBy }),
  setStatusFilter: (status) => set({ status }),
  setOwner: (owner) => set({ owner }),
  resetFilters: () => set({ ...DEFAULT_SEQUENCE_FILTERS }),
  openDetail: (detailId) => set({ detailId, detailOpen: true }),
  closeDetail: () => set({ detailOpen: false }),
  setNewSequenceOpen: (newSequenceOpen) =>
    set(
      newSequenceOpen
        ? { newSequenceOpen, editSequenceId: null, editOpen: false }
        : { newSequenceOpen },
    ),
  openEdit: (editSequenceId) =>
    set({ editSequenceId, editOpen: true, newSequenceOpen: false }),
  closeEdit: () => set({ editOpen: false }),
  setEnrollSequenceId: (enrollSequenceId) => set({ enrollSequenceId }),
  setContactEnrollId: (contactEnrollId) => set({ contactEnrollId }),
  addSequence: (sequence) =>
    set((state) => ({
      sequences: [sequence, ...state.sequences],
      newSequenceOpen: false,
    })),
  updateSequence: (updated) =>
    set((state) => ({
      sequences: state.sequences.map((sequence) =>
        sequence.id === updated.id && sequence.status === "Draft"
          ? { ...sequence, ...updated, status: sequence.status }
          : sequence,
      ),
      editOpen: false,
    })),
  setSequenceStatus: (id, status) =>
    set((state) => ({
      sequences: state.sequences.map((sequence) =>
        sequence.id === id && (status !== "Active" || canActivate(sequence))
          ? { ...sequence, status }
          : sequence,
      ),
    })),
  enrollContacts: (sequenceId, contactIds) => {
    const sequence = get().sequences.find((item) => item.id === sequenceId);
    if (!sequence || sequence.status !== "Active") return;
    const { contacts } = useContactsStore.getState();
    const { deals } = useDealsStore.getState();
    const allowed = new Set(
      enrollableContacts(
        sequence,
        contacts,
        contactSummaryMap(contacts, deals),
      ).map((contact) => contact.id),
    );
    const taken = new Set(sequence.enrollments.map((item) => item.id));
    const added: Enrollment[] = [];
    let counter = sequence.enrollments.length;
    for (const contactId of contactIds) {
      const contact = contacts.find((item) => item.id === contactId);
      if (!contact || !allowed.has(contactId)) continue;
      allowed.delete(contactId);
      let id = "";
      do {
        counter += 1;
        id = `${sequence.id}-e${counter}`;
      } while (taken.has(id));
      taken.add(id);
      const deal = firstOpenDeal(contact, deals);
      added.push({
        id,
        contactId,
        ...(deal ? { dealId: deal.id } : {}),
        enrolledAt: TODAY,
        currentStep: 1,
        status: "Active",
      });
    }
    if (added.length === 0) return;
    set((state) => ({
      sequences: state.sequences.map((item) =>
        item.id === sequenceId
          ? { ...item, enrollments: [...item.enrollments, ...added] }
          : item,
      ),
    }));
  },
  removeEnrollment: (sequenceId, enrollmentId) =>
    set((state) => ({
      sequences: state.sequences.map((sequence) =>
        sequence.id === sequenceId
          ? {
              ...sequence,
              enrollments: sequence.enrollments.filter(
                (enrollment) => enrollment.id !== enrollmentId,
              ),
            }
          : sequence,
      ),
    })),
  markReplied: (sequenceId, enrollmentId) => {
    const enrollment = get()
      .sequences.find((item) => item.id === sequenceId)
      ?.enrollments.find((item) => item.id === enrollmentId);
    if (!enrollment || enrollment.status !== "Active") return;
    set((state) => ({
      sequences: patchEnrollment(
        state.sequences,
        sequenceId,
        enrollmentId,
        { status: "Replied" },
        enrollment.currentStep,
      ),
    }));
    logOnOpenDeal(enrollment, "reply");
  },
  bookMeeting: (sequenceId, enrollmentId) => {
    const enrollment = get()
      .sequences.find((item) => item.id === sequenceId)
      ?.enrollments.find((item) => item.id === enrollmentId);
    if (
      !enrollment ||
      (enrollment.status !== "Active" && enrollment.status !== "Replied")
    ) {
      return;
    }
    set((state) => ({
      sequences: patchEnrollment(state.sequences, sequenceId, enrollmentId, {
        status: "Meeting booked",
      }),
    }));
    logOnOpenDeal(enrollment, "meeting");
  },
}));

export function useSequenceStats() {
  const sequences = useSequencesStore((state) => state.sequences);
  return useMemo(() => sequenceStatsMap(sequences), [sequences]);
}

export function useVisibleSequences() {
  const sequences = useSequencesStore((state) => state.sequences);
  const sortBy = useSequencesStore((state) => state.sortBy);
  const status = useSequencesStore((state) => state.status);
  const owner = useSequencesStore((state) => state.owner);
  const stats = useSequenceStats();
  return useMemo(
    () => filterSequences(sequences, { sortBy, status, owner }, stats),
    [sequences, sortBy, status, owner, stats],
  );
}

export function useActiveSequenceCount() {
  return useSequencesStore((state) => activeSequenceCount(state.sequences));
}
