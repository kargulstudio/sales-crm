import Button from "@/components/_ui/button";
import Tag from "@/components/_ui/tag";
import ContactInitials from "@/components/contacts/contact-initials";
import type { Contact } from "@/data/contacts";
import type { Deal } from "@/data/deals";
import type { Enrollment, Sequence } from "@/data/sequences";
import { displayStatus, enrollmentProgress } from "@/lib/sequences";

type EnrollmentItemProps = {
  sequence: Sequence;
  enrollment: Enrollment;
  contact: Contact;
  companyName: string;
  deal: Deal | undefined;
  onOpenContact: () => void;
  onOpenDeal: () => void;
  onReplied: () => void;
  onMeeting: () => void;
  onRemove: () => void;
};

export default function EnrollmentItem({
  sequence,
  enrollment,
  contact,
  companyName,
  deal,
  onOpenContact,
  onOpenDeal,
  onReplied,
  onMeeting,
  onRemove,
}: EnrollmentItemProps) {
  const status = displayStatus(sequence, enrollment);
  const canReply = enrollment.status === "Active";
  const canBook =
    enrollment.status === "Active" || enrollment.status === "Replied";

  return (
    <li className="flex flex-col gap-3 py-3 first:pt-0 last:pb-0">
      <div className="flex items-start justify-between gap-3">
        <span className="flex min-w-0 items-center gap-2.5">
          <ContactInitials name={contact.name} />
          <span className="flex min-w-0 flex-col items-start gap-1.5">
            <Button
              variant="ghost"
              size="none"
              onClick={onOpenContact}
              className="text-foreground max-w-full justify-start font-normal hover:underline"
            >
              <span className="truncate">{contact.name}</span>
            </Button>
            {deal ? (
              <Button
                variant="ghost"
                size="none"
                onClick={onOpenDeal}
                className="caption-style text-subtle max-w-full justify-start font-normal hover:underline"
              >
                <span className="truncate">{deal.name}</span>
              </Button>
            ) : (
              <span className="caption-style text-subtle truncate">
                {companyName}
              </span>
            )}
          </span>
        </span>
        <span className="flex shrink-0 flex-col items-end gap-1.5">
          <Tag tone={status.tone} size="sm">
            {status.label}
          </Tag>
          <span className="caption-style text-subtle tabular-nums">
            Step {enrollmentProgress(sequence, enrollment)}
          </span>
        </span>
      </div>
      <div className="flex flex-wrap items-center gap-1">
        {canReply && (
          <Button variant="subtle" size="sm" onClick={onReplied}>
            Mark replied
          </Button>
        )}
        {canBook && (
          <Button variant="subtle" size="sm" onClick={onMeeting}>
            Book meeting
          </Button>
        )}
        <Button variant="ghost" size="sm" onClick={onRemove}>
          Remove
        </Button>
      </div>
    </li>
  );
}
