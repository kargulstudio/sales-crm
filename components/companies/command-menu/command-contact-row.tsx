import { CommandItem } from "@/components/_ui/command";
import Tag from "@/components/_ui/tag";
import ContactInitials from "@/components/contacts/contact-initials";
import type { Contact } from "@/data/contacts";
import { CONTACT_ROLE_TONES } from "@/lib/contacts";

type CommandContactRowProps = {
  contact: Contact;
  companyName: string;
  onSelect: () => void;
};

export default function CommandContactRow({
  contact,
  companyName,
  onSelect,
}: CommandContactRowProps) {
  return (
    <CommandItem
      value={contact.id}
      keywords={[contact.name, contact.title, companyName, contact.role]}
      onSelect={onSelect}
      className="text-foreground h-11 justify-between gap-x-4"
    >
      <span className="flex min-w-0 items-center gap-2.5">
        <ContactInitials name={contact.name} className="size-6" />
        <span className="truncate">{contact.name}</span>
        <span className="text-soft hidden min-w-0 truncate md:block">
          {contact.title} · {companyName}
        </span>
      </span>
      <Tag tone={CONTACT_ROLE_TONES[contact.role]} size="sm">
        {contact.role}
      </Tag>
    </CommandItem>
  );
}
