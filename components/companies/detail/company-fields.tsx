"use client";

import Avatar from "@/components/_ui/avatar";
import Field from "@/components/_ui/field";
import { Input } from "@/components/_ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/_ui/select";
import { Slider } from "@/components/_ui/slider";
import { tagVariants } from "@/components/_ui/tag";
import {
  OWNERS,
  SEGMENTS,
  STAGES,
  TAG_TONES,
  type Company,
  type Tag,
} from "@/data/companies";
import { normalizeDomain } from "@/lib/companies";
import { cn } from "@/lib/utils";
import type { CompanyPatch } from "@/stores/companies-store";

export type CompanyDraft = {
  name: string;
  website: string;
  tags: Tag[];
  owner: string;
  pipelineValue: string;
  openDeals: string;
  winProbability: number;
};

export function toDraft(company: Company): CompanyDraft {
  return {
    name: company.name,
    website: company.domain ?? "",
    tags: company.tags,
    owner: company.owner,
    pipelineValue: String(company.pipelineValue),
    openDeals: String(company.openDeals),
    winProbability: company.winProbability,
  };
}

export type DraftErrors = Partial<Record<"name" | "website" | "tags", string>>;

export function validateDraft(draft: CompanyDraft): DraftErrors {
  const errors: DraftErrors = {};
  if (!draft.name.trim()) errors.name = "Enter a company name.";
  if (draft.website.trim() && !normalizeDomain(draft.website)) {
    errors.website = "Enter a domain like acme.com.";
  }
  if (draft.tags.length === 0) errors.tags = "Pick at least one tag.";
  return errors;
}

export function draftToPatch(draft: CompanyDraft): CompanyPatch {
  const tagOrder = [...SEGMENTS, ...STAGES] as readonly Tag[];
  return {
    name: draft.name.trim(),
    domain: normalizeDomain(draft.website) ?? undefined,
    tags: [...draft.tags].sort(
      (a, b) => tagOrder.indexOf(a) - tagOrder.indexOf(b),
    ),
    owner: draft.owner,
    pipelineValue: Math.max(0, Math.round(Number(draft.pipelineValue) || 0)),
    openDeals: Math.max(0, Math.round(Number(draft.openDeals) || 0)),
    winProbability: draft.winProbability,
  };
}

export function isDirty(draft: CompanyDraft, company: Company) {
  const patch = draftToPatch(draft);
  return (
    patch.name !== company.name ||
    (patch.domain ?? "") !== (company.domain ?? "") ||
    [...(patch.tags ?? [])].sort().join() !== [...company.tags].sort().join() ||
    patch.owner !== company.owner ||
    patch.pipelineValue !== company.pipelineValue ||
    patch.openDeals !== company.openDeals ||
    patch.winProbability !== company.winProbability
  );
}

type CompanyFieldsProps = {
  draft: CompanyDraft;
  errors: DraftErrors;
  onChange: <K extends keyof CompanyDraft>(
    key: K,
    value: CompanyDraft[K],
  ) => void;
};

export default function CompanyFields({
  draft,
  errors,
  onChange,
}: CompanyFieldsProps) {
  function toggleTag(tag: Tag) {
    onChange(
      "tags",
      draft.tags.includes(tag)
        ? draft.tags.filter((item) => item !== tag)
        : [...draft.tags, tag],
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Company name" htmlFor="detail-name" error={errors.name}>
          <Input
            id="detail-name"
            value={draft.name}
            onChange={(event) => onChange("name", event.target.value)}
            autoComplete="off"
            aria-invalid={errors.name ? true : undefined}
            aria-describedby={errors.name ? "detail-name-error" : undefined}
            className="aria-invalid:border-danger"
          />
        </Field>
        <Field label="Website" htmlFor="detail-website" error={errors.website}>
          <Input
            id="detail-website"
            inputMode="url"
            spellCheck={false}
            autoComplete="off"
            placeholder="acme.com"
            value={draft.website}
            onChange={(event) => onChange("website", event.target.value)}
            aria-invalid={errors.website ? true : undefined}
            aria-describedby={
              errors.website ? "detail-website-error" : undefined
            }
            className="aria-invalid:border-danger"
          />
        </Field>
      </div>

      <Field label="Account owner" htmlFor="detail-owner">
        <Select
          value={draft.owner}
          onValueChange={(value) => onChange("owner", value)}
        >
          <SelectTrigger id="detail-owner">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {OWNERS.map((owner) => (
              <SelectItem key={owner.name} value={owner.name}>
                <span className="flex items-center gap-2">
                  <Avatar src={owner.avatar} alt="" />
                  {owner.name}
                </span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Field>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Pipeline value" htmlFor="detail-pipeline">
          <div className="relative">
            <span
              aria-hidden
              className="text-fg-tertiary pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-sm leading-none"
            >
              $
            </span>
            <Input
              id="detail-pipeline"
              type="number"
              min={0}
              step={1000}
              inputMode="numeric"
              value={draft.pipelineValue}
              onChange={(event) =>
                onChange("pipelineValue", event.target.value)
              }
              className="pl-6 tabular-nums"
            />
          </div>
        </Field>
        <Field label="Open deals" htmlFor="detail-deals">
          <Input
            id="detail-deals"
            type="number"
            min={0}
            inputMode="numeric"
            value={draft.openDeals}
            onChange={(event) => onChange("openDeals", event.target.value)}
            className="tabular-nums"
          />
        </Field>
      </div>

      <Field
        label="Win probability"
        htmlFor="detail-win"
        trailing={
          <span className="caption-style text-foreground tabular-nums">
            {draft.winProbability}%
          </span>
        }
      >
        <Slider
          id="detail-win"
          aria-label="Win probability"
          min={0}
          max={100}
          step={1}
          value={[draft.winProbability]}
          onValueChange={([value]) => onChange("winProbability", value)}
        />
      </Field>

      <fieldset className="flex min-w-0 flex-col gap-2">
        <legend className="caption-style text-fg-secondary mb-2">
          Segment & stage
        </legend>
        <div
          className="flex flex-wrap gap-1.5"
          aria-describedby={errors.tags ? "detail-tags-error" : undefined}
        >
          {([...SEGMENTS, ...STAGES] as Tag[]).map((tag) => {
            const on = draft.tags.includes(tag);
            return (
              <button
                key={tag}
                type="button"
                aria-pressed={on}
                onClick={() => toggleTag(tag)}
                className={cn(
                  tagVariants({ tone: on ? TAG_TONES[tag] : "neutral" }),
                  "focus-visible:ring-ring duration-fast ease-power3-out cursor-pointer transition-[opacity,background-color,border-color,color] outline-none focus-visible:ring-2",
                  !on &&
                    "text-fg-tertiary hover:text-foreground border-dashed bg-transparent",
                )}
              >
                {tag}
              </button>
            );
          })}
        </div>
        {errors.tags && (
          <span
            id="detail-tags-error"
            role="alert"
            className="caption-style text-danger block leading-snug"
          >
            {errors.tags}
          </span>
        )}
      </fieldset>
    </div>
  );
}
