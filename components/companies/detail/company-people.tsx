"use client";

import { useMemo } from "react";
import Button from "@/components/_ui/button";
import Tag from "@/components/_ui/tag";
import ContactInitials from "@/components/contacts/contact-initials";
import ContactReach from "@/components/contacts/contact-reach";
import { CONTACT_ROLE_TONES, contactSummaryFor } from "@/lib/contacts";
import { useContactSummaries, useContactsStore } from "@/stores/contacts-store";

type CompanyPeopleProps = {
  companyId: string;
  onOpenContact: (contactId: string) => void;
};

export default function CompanyPeople({
  companyId,
  onOpenContact,
}: CompanyPeopleProps) {
  const contacts = useContactsStore((state) => state.contacts);
  const summaries = useContactSummaries();
  const people = useMemo(
    () => contacts.filter((contact) => contact.companyId === companyId),
    [contacts, companyId],
  );

  if (people.length === 0) {
    return (
      <span className="caption-style text-subtle block">No contacts yet.</span>
    );
  }

  return (
    <ul className="divide-line-strong flex flex-col divide-y">
      {people.map((contact) => (
        <li key={contact.id} className="flex items-center gap-2">
          <Button
            variant="item"
            size="none"
            onClick={() => onOpenContact(contact.id)}
            className="min-w-0 flex-1 items-center justify-between gap-3 rounded-none py-2"
          >
            <span className="flex min-w-0 items-center gap-2.5">
              <ContactInitials name={contact.name} className="size-6" />
              <span className="flex min-w-0 flex-col gap-1">
                <span className="text-foreground truncate">{contact.name}</span>
                <span className="caption-style text-subtle truncate">
                  {contact.title}
                </span>
              </span>
            </span>
            <Tag tone={CONTACT_ROLE_TONES[contact.role]} size="sm">
              {contact.role}
            </Tag>
          </Button>
          <ContactReach
            contact={contact}
            left={contactSummaryFor(summaries, contact.id).left}
            linkedin={false}
            className="shrink-0"
          />
        </li>
      ))}
    </ul>
  );
}
