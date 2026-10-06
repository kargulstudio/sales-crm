import Button from "@/components/_ui/button";
import Field from "@/components/_ui/field";
import { Input } from "@/components/_ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/_ui/select";
import { SEQUENCE_CHANNELS, type SequenceChannel } from "@/data/sequences";
import ChevronDownIcon from "@/public/assets/images/_common/chevron-down.svg";
import XIcon from "@/public/assets/images/companies/detail/x.svg";

export type StepDraft = {
  key: string;
  day: string;
  channel: SequenceChannel;
  subject: string;
};

export type StepErrors = { day?: string; subject?: string };

type StepFieldsProps = {
  step: StepDraft;
  index: number;
  count: number;
  errors: StepErrors | undefined;
  onChange: (patch: Partial<StepDraft>) => void;
  onMove: (direction: -1 | 1) => void;
  onRemove: () => void;
};

export default function StepFields({
  step,
  index,
  count,
  errors,
  onChange,
  onMove,
  onRemove,
}: StepFieldsProps) {
  const dayId = `new-sequence-${step.key}-day`;
  const channelId = `new-sequence-${step.key}-channel`;
  const subjectId = `new-sequence-${step.key}-subject`;
  const isEmail = step.channel === "Email";

  return (
    <li className="border-line-strong flex flex-col gap-3 rounded-lg border p-3">
      <div className="flex items-center justify-between gap-2">
        <span className="eyebrow-style text-soft">Step {index + 1}</span>
        <span className="flex items-center gap-0.5">
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label={`Move step ${index + 1} up`}
            onClick={() => onMove(-1)}
            disabled={index === 0}
          >
            <ChevronDownIcon aria-hidden className="size-3 rotate-180" />
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label={`Move step ${index + 1} down`}
            onClick={() => onMove(1)}
            disabled={index === count - 1}
          >
            <ChevronDownIcon aria-hidden className="size-3" />
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label={`Remove step ${index + 1}`}
            onClick={onRemove}
          >
            <XIcon aria-hidden className="size-3.5" />
          </Button>
        </span>
      </div>

      <div className="grid gap-3 sm:grid-cols-[110px_1fr]">
        <Field label="Day" htmlFor={dayId} error={errors?.day}>
          <Input
            id={dayId}
            type="number"
            inputMode="numeric"
            min={0}
            step={1}
            value={step.day}
            onChange={(event) => onChange({ day: event.target.value })}
            aria-invalid={errors?.day ? true : undefined}
            aria-describedby={errors?.day ? `${dayId}-error` : undefined}
            className="aria-invalid:border-danger"
          />
        </Field>
        <Field label="Channel" htmlFor={channelId}>
          <Select
            value={step.channel}
            onValueChange={(value) =>
              onChange({ channel: value as SequenceChannel })
            }
          >
            <SelectTrigger id={channelId}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {SEQUENCE_CHANNELS.map((channel) => (
                <SelectItem key={channel} value={channel}>
                  {channel}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
      </div>

      <Field
        label={isEmail ? "Subject" : "Task note"}
        htmlFor={subjectId}
        required={isEmail}
        error={errors?.subject}
      >
        <Input
          id={subjectId}
          value={step.subject}
          onChange={(event) => onChange({ subject: event.target.value })}
          placeholder={
            isEmail ? "A quick idea for your pipeline reviews" : "Optional"
          }
          autoComplete="off"
          aria-invalid={errors?.subject ? true : undefined}
          aria-describedby={errors?.subject ? `${subjectId}-error` : undefined}
          className="aria-invalid:border-danger"
        />
      </Field>
    </li>
  );
}
