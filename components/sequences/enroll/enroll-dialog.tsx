"use client";

import { useMemo, useState } from "react";
import Button from "@/components/_ui/button";
import { Checkbox } from "@/components/_ui/checkbox";
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandFooter,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  Kbd,
} from "@/components/_ui/command";
import ContactInitials from "@/components/contacts/contact-initials";
import type { Contact } from "@/data/contacts";
import type { Deal } from "@/data/deals";
import { contactSummaryMap, firstOpenDeal } from "@/lib/contacts";
import { enrollableContacts } from "@/lib/sequences";
import { useCompanyMap } from "@/stores/companies-store";
import { useContactsStore } from "@/stores/contacts-store";
import { useDealsStore } from "@/stores/deals-store";
import { useSequencesStore } from "@/stores/sequences-store";

type Group = {
  companyId: string;
  companyName: string;
  people: { contact: Contact; deal: Deal | undefined }[];
};

export default function EnrollDialog() {
  const sequenceId = useSequencesStore((state) => state.enrollSequenceId);
  const setSequenceId = useSequencesStore((state) => state.setEnrollSequenceId);
  const sequences = useSequencesStore((state) => state.sequences);
  const enrollContacts = useSequencesStore((state) => state.enrollContacts);
  const contacts = useContactsStore((state) => state.contacts);
  const deals = useDealsStore((state) => state.deals);
  const companyById = useCompanyMap();
  const [selected, setSelected] = useState<string[]>([]);
  const [query, setQuery] = useState("");

  const sequence = sequences.find((item) => item.id === sequenceId);

  const groups = useMemo(() => {
    if (!sequence) return [];
    const available = enrollableContacts(
      sequence,
      contacts,
      contactSummaryMap(contacts, deals),
    );
    const byCompany = new Map<string, Group>();
    for (const contact of available) {
      const group = byCompany.get(contact.companyId) ?? {
        companyId: contact.companyId,
        companyName: companyById.get(contact.companyId)?.name ?? "Unknown",
        people: [],
      };
      group.people.push({ contact, deal: firstOpenDeal(contact, deals) });
      byCompany.set(contact.companyId, group);
    }
    return [...byCompany.values()]
      .map((group) => ({
        ...group,
        people: group.people.sort((a, b) =>
          a.contact.name.localeCompare(b.contact.name),
        ),
      }))
      .sort((a, b) => a.companyName.localeCompare(b.companyName));
  }, [sequence, contacts, deals, companyById]);

  const selectedSet = useMemo(() => new Set(selected), [selected]);

  function toggle(contactId: string) {
    setSelected((current) =>
      current.includes(contactId)
        ? current.filter((id) => id !== contactId)
        : [...current, contactId],
    );
  }

  function submit() {
    if (!sequence || selected.length === 0) return;
    enrollContacts(sequence.id, selected);
    setSequenceId(null);
  }

  return (
    <CommandDialog
      open={sequence !== undefined}
      onOpenChange={(open) => !open && setSequenceId(null)}
      title="Enroll contacts"
      description="Choose people to add to this sequence. Each joins at step 1 and is linked to their first open deal."
      className="max-w-[640px]"
      onCloseAutoFocus={() => {
        setSelected([]);
        setQuery("");
      }}
    >
      <Command>
        <CommandInput
          value={query}
          onValueChange={setQuery}
          placeholder={
            sequence ? `Enroll in ${sequence.name}…` : "Search people…"
          }
          trailing={<Kbd>Esc</Kbd>}
        />
        <CommandList>
          <CommandEmpty>
            {groups.length === 0
              ? "Everyone is already enrolled."
              : `No people match “${query}”`}
          </CommandEmpty>
          {groups.map((group) => (
            <CommandGroup key={group.companyId} heading={group.companyName}>
              {group.people.map(({ contact, deal }) => (
                <CommandItem
                  key={contact.id}
                  value={contact.id}
                  keywords={[
                    contact.name,
                    contact.title,
                    group.companyName,
                    deal?.name ?? "",
                  ]}
                  onSelect={() => toggle(contact.id)}
                  className="text-foreground h-11 justify-between gap-x-4"
                >
                  <span className="flex min-w-0 items-center gap-2.5">
                    <Checkbox
                      checked={selectedSet.has(contact.id)}
                      tabIndex={-1}
                      aria-hidden
                      className="pointer-events-none"
                    />
                    <ContactInitials name={contact.name} className="size-6" />
                    <span className="truncate">{contact.name}</span>
                    <span className="text-soft hidden min-w-0 truncate md:block">
                      {contact.title}
                    </span>
                  </span>
                  <span className="caption-style text-subtle hidden max-w-[40%] shrink-0 truncate sm:block">
                    {deal ? deal.name : "No open deal"}
                  </span>
                </CommandItem>
              ))}
            </CommandGroup>
          ))}
        </CommandList>
        <CommandFooter className="h-auto justify-between gap-2 py-2.5">
          <span className="tabular-nums">{selected.length} selected</span>
          <span className="flex items-center gap-1">
            <Button
              variant="subtle"
              size="sm"
              onClick={() => setSequenceId(null)}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={submit}
              disabled={selected.length === 0}
            >
              {selected.length > 0 ? `Enroll ${selected.length}` : "Enroll"}
            </Button>
          </span>
        </CommandFooter>
      </Command>
    </CommandDialog>
  );
}
