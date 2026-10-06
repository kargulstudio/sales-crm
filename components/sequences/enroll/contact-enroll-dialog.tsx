"use client";

import { useMemo, useState, type FormEvent } from "react";
import Button from "@/components/_ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/_ui/dialog";
import Field from "@/components/_ui/field";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/_ui/select";
import { firstOpenDeal } from "@/lib/contacts";
import { useContactsStore } from "@/stores/contacts-store";
import { useDealsStore } from "@/stores/deals-store";
import { useSequencesStore } from "@/stores/sequences-store";

export default function ContactEnrollDialog() {
  const contactId = useSequencesStore((state) => state.contactEnrollId);
  const setContactId = useSequencesStore((state) => state.setContactEnrollId);
  const sequences = useSequencesStore((state) => state.sequences);
  const enrollContacts = useSequencesStore((state) => state.enrollContacts);
  const contacts = useContactsStore((state) => state.contacts);
  const deals = useDealsStore((state) => state.deals);
  const [choice, setChoice] = useState("");

  const contact = contacts.find((item) => item.id === contactId);
  const options = useMemo(
    () =>
      contact
        ? sequences.filter(
            (sequence) =>
              sequence.status === "Active" &&
              !sequence.enrollments.some(
                (enrollment) => enrollment.contactId === contact.id,
              ),
          )
        : [],
    [contact, sequences],
  );
  const current = options.some((option) => option.id === choice)
    ? choice
    : (options[0]?.id ?? "");
  const deal = contact ? firstOpenDeal(contact, deals) : undefined;

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!contact || !current) return;
    enrollContacts(current, [contact.id]);
    setContactId(null);
  }

  return (
    <Dialog
      open={contact !== undefined}
      onOpenChange={(open) => !open && setContactId(null)}
    >
      <DialogContent
        className="max-w-[480px]"
        onCloseAutoFocus={() => setChoice("")}
      >
        <form onSubmit={handleSubmit} className="flex flex-col">
          <DialogHeader>
            <DialogTitle>Enroll in sequence</DialogTitle>
            <DialogDescription>
              {contact
                ? `Add ${contact.name} to an active sequence. They join at step 1.`
                : "Add this person to an active sequence."}
            </DialogDescription>
          </DialogHeader>

          <div className="px-6 py-5">
            <Field
              label="Sequence"
              htmlFor="contact-enroll-sequence"
              hint={
                options.length === 0
                  ? "No active sequences are open to this person."
                  : deal
                    ? `Linked to ${deal.name}, their first open deal.`
                    : "They have no open deal, so nothing is linked."
              }
            >
              <Select
                value={current}
                onValueChange={setChoice}
                disabled={options.length === 0}
              >
                <SelectTrigger id="contact-enroll-sequence">
                  <SelectValue placeholder="No sequences available" />
                </SelectTrigger>
                <SelectContent>
                  {options.map((option) => (
                    <SelectItem key={option.id} value={option.id}>
                      {option.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
          </div>

          <DialogFooter>
            <DialogClose asChild>
              <Button variant="subtle" size="sm">
                Cancel
              </Button>
            </DialogClose>
            <Button
              variant="primary"
              size="sm"
              type="submit"
              disabled={!current}
            >
              Enroll
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
