import Avatar from "@/components/_ui/avatar";
import Button from "@/components/_ui/button";
import Tag from "@/components/_ui/tag";
import CompanyMark from "../company-mark";
import { ownerByName, type Company } from "@/data/companies";
import {
  ACTIVITY_CHANNELS,
  ACTIVITY_TONES,
  formatDelta,
  type ActivityEvent,
} from "@/lib/activities";
import { ACTIVITY_EFFECTS } from "@/lib/deals";

type ActivityRowProps = {
  event: ActivityEvent;
  company: Company | undefined;
  onOpen: (dealId: string) => void;
};

export default function ActivityRow({
  event,
  company,
  onOpen,
}: ActivityRowProps) {
  const owner = ownerByName(event.owner);
  const effectTone =
    event.delta > 0 ? "green" : event.delta < 0 ? "amber" : "neutral";

  return (
    <li>
      <Button
        variant="item"
        size="none"
        onClick={() => onOpen(event.dealId)}
        className="items-center gap-3 rounded-none px-4 py-3"
      >
        <CompanyMark company={company} />
        <span className="flex min-w-0 flex-1 flex-col gap-1.5">
          <span className="flex flex-wrap items-center gap-2">
            <Tag tone={ACTIVITY_TONES[event.type]} size="sm">
              {ACTIVITY_CHANNELS[event.type]}
            </Tag>
            <span className="text-foreground">
              {ACTIVITY_EFFECTS[event.type].label}
            </span>
          </span>
          <span className="caption-style text-soft flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1">
            <span className="truncate">{event.dealName}</span>
            <span className="flex items-center gap-1.5">
              <Avatar src={owner.avatar} alt="" className="size-4" />
              <span className="truncate">{owner.name}</span>
            </span>
          </span>
          {event.note && (
            <span className="caption-style text-subtle line-clamp-2">
              {event.note}
            </span>
          )}
        </span>
        <span className="flex shrink-0 flex-col items-end gap-1">
          <Tag tone={effectTone} size="sm" className="tabular-nums">
            {formatDelta(event.delta)}
          </Tag>
          {!event.counted && (
            <span className="caption-style text-subtle">
              {event.capped ? "Capped" : "History"}
            </span>
          )}
        </span>
      </Button>
    </li>
  );
}
