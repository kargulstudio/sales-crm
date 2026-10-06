import Button, { buttonVariants } from "@/components/_ui/button";
import type { Contact } from "@/data/contacts";
import {
  CONTACT_LEFT_NOTE,
  contactLinkedIn,
  contactPhoneHref,
} from "@/lib/contacts";
import { cn } from "@/lib/utils";
import MailIcon from "@/public/assets/images/contacts/mail.svg";
import PhoneIcon from "@/public/assets/images/contacts/phone.svg";
import LinkedInIcon from "@/public/assets/images/contacts/linkedin.svg";

type ContactReachProps = {
  contact: Contact;
  left: boolean;
  linkedin?: boolean;
  className?: string;
};

export function reachTitle(value: string, left: boolean) {
  return left ? `${value} — ${CONTACT_LEFT_NOTE}` : value;
}

export default function ContactReach({
  contact,
  left,
  linkedin = true,
  className,
}: ContactReachProps) {
  const phoneHref = contactPhoneHref(contact.phone);
  const profile = contactLinkedIn(contact);
  const classes = buttonVariants({ variant: "ghost", size: "icon-sm" });

  return (
    <span
      className={cn("flex items-center gap-1", className)}
      onClick={(event) => event.stopPropagation()}
    >
      {contact.email ? (
        <a
          href={`mailto:${contact.email}`}
          className={classes}
          aria-label={`Email ${contact.name}`}
          title={reachTitle(contact.email, left)}
        >
          <MailIcon aria-hidden className="size-4" />
        </a>
      ) : (
        <Button
          variant="ghost"
          size="icon-sm"
          disabled
          aria-label={`Email ${contact.name}`}
          title="No email on file"
        >
          <MailIcon aria-hidden className="size-4" />
        </Button>
      )}
      {phoneHref ? (
        <a
          href={phoneHref}
          className={classes}
          aria-label={`Call ${contact.name}`}
          title={reachTitle(contact.phone, left)}
        >
          <PhoneIcon aria-hidden className="size-4" />
        </a>
      ) : (
        <Button
          variant="ghost"
          size="icon-sm"
          disabled
          aria-label={`Call ${contact.name}`}
          title="No phone on file"
        >
          <PhoneIcon aria-hidden className="size-4" />
        </Button>
      )}
      {linkedin &&
        (profile ? (
          <a
            href={profile}
            target="_blank"
            rel="noopener noreferrer"
            className={classes}
            aria-label={`Open ${contact.name} on LinkedIn`}
            title={reachTitle("LinkedIn profile", left)}
          >
            <LinkedInIcon aria-hidden className="size-4" />
          </a>
        ) : (
          <Button
            variant="ghost"
            size="icon-sm"
            disabled
            aria-label={`Open ${contact.name} on LinkedIn`}
            title="No LinkedIn profile"
          >
            <LinkedInIcon aria-hidden className="size-4" />
          </Button>
        ))}
    </span>
  );
}
