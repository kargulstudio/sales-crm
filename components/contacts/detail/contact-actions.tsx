import Button, { buttonVariants } from "@/components/_ui/button";
import CopyButton from "@/components/contacts/copy-button";
import { reachTitle } from "@/components/contacts/contact-reach";
import type { Contact } from "@/data/contacts";
import {
  CONTACT_LEFT_NOTE,
  contactLinkedIn,
  contactPhoneHref,
} from "@/lib/contacts";
import MailIcon from "@/public/assets/images/contacts/mail.svg";
import PhoneIcon from "@/public/assets/images/contacts/phone.svg";
import LinkedInIcon from "@/public/assets/images/contacts/linkedin.svg";

type ContactActionsProps = {
  contact: Contact;
  left: boolean;
};

export default function ContactActions({ contact, left }: ContactActionsProps) {
  const phoneHref = contactPhoneHref(contact.phone);
  const profile = contactLinkedIn(contact);
  const classes = buttonVariants({ variant: "secondary", size: "sm" });

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap items-center gap-2">
        {contact.email ? (
          <a
            href={`mailto:${contact.email}`}
            className={classes}
            title={reachTitle(contact.email, left)}
          >
            <MailIcon aria-hidden className="size-4" />
            Email
          </a>
        ) : (
          <Button
            variant="secondary"
            size="sm"
            disabled
            title="No email on file"
          >
            <MailIcon aria-hidden className="size-4" />
            Email
          </Button>
        )}
        {phoneHref ? (
          <a
            href={phoneHref}
            className={classes}
            title={reachTitle(contact.phone, left)}
          >
            <PhoneIcon aria-hidden className="size-4" />
            Call
          </a>
        ) : (
          <Button
            variant="secondary"
            size="sm"
            disabled
            title="No phone on file"
          >
            <PhoneIcon aria-hidden className="size-4" />
            Call
          </Button>
        )}
        {profile ? (
          <a
            href={profile}
            target="_blank"
            rel="noopener noreferrer"
            className={classes}
            title={reachTitle("LinkedIn profile", left)}
          >
            <LinkedInIcon aria-hidden className="size-4" />
            LinkedIn
          </a>
        ) : (
          <Button
            variant="secondary"
            size="sm"
            disabled
            title="No LinkedIn profile"
          >
            <LinkedInIcon aria-hidden className="size-4" />
            LinkedIn
          </Button>
        )}
        <CopyButton
          value={contact.email}
          label="Copy email"
          variant="secondary"
          size="icon"
        />
      </div>
      {left && (
        <span className="caption-style text-subtle">{CONTACT_LEFT_NOTE}</span>
      )}
    </div>
  );
}
