"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
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
import { Input } from "@/components/_ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/_ui/select";
import FormSection from "@/components/companies/new-company/form-section";
import StepFields, { type StepDraft, type StepErrors } from "./step-fields";
import { OWNERS } from "@/data/companies";
import type { Sequence } from "@/data/sequences";
import { TODAY } from "@/lib/companies";
import { uniqueId } from "@/lib/sequences";
import { useHandoff } from "@/lib/use-handoff";
import { cn } from "@/lib/utils";
import { useSequencesStore } from "@/stores/sequences-store";
import PlusIcon from "@/public/assets/images/_common/plus.svg";

type FormState = {
  name: string;
  owner: string;
  steps: StepDraft[];
};

const DAY_GAP = 2;

export default function NewSequenceDialog() {
  const newOpen = useSequencesStore((state) => state.newSequenceOpen);
  const editOpen = useSequencesStore((state) => state.editOpen);
  const editing = useSequencesStore((state) =>
    state.editSequenceId
      ? state.sequences.find(
          (item) => item.id === state.editSequenceId && item.status === "Draft",
        )
      : undefined,
  );
  const setNewOpen = useSequencesStore((state) => state.setNewSequenceOpen);
  const closeEdit = useSequencesStore((state) => state.closeEdit);
  const addSequence = useSequencesStore((state) => state.addSequence);
  const updateSequence = useSequencesStore((state) => state.updateSequence);
  const openDetail = useSequencesStore((state) => state.openDetail);
  const handoff = useHandoff();
  const [form, setForm] = useState<FormState | null>(null);
  const [nameError, setNameError] = useState<string | null>(null);
  const [stepsError, setStepsError] = useState<string | null>(null);
  const [stepErrors, setStepErrors] = useState<Record<string, StepErrors>>({});
  const nameRef = useRef<HTMLInputElement>(null);
  const submitted = useRef(false);
  const nextKey = useRef(2);

  const open = newOpen || (editOpen && editing !== undefined);

  function setOpen(next: boolean) {
    if (next) return;
    if (editing) closeEdit();
    else setNewOpen(false);
  }

  useEffect(() => {
    if (open) submitted.current = false;
  }, [open]);

  const current: FormState =
    form ??
    (editing
      ? {
          name: editing.name,
          owner: editing.owner,
          steps: editing.steps.map((step) => ({
            key: step.id,
            day: String(step.day),
            channel: step.channel,
            subject: step.subject,
          })),
        }
      : {
          name: "",
          owner: OWNERS[0].name,
          steps: [{ key: "step-1", day: "0", channel: "Email", subject: "" }],
        });

  function update(patch: Partial<FormState>) {
    setForm({ ...current, ...patch });
  }

  function updateStep(key: string, patch: Partial<StepDraft>) {
    update({
      steps: current.steps.map((step) =>
        step.key === key ? { ...step, ...patch } : step,
      ),
    });
    if (stepErrors[key]) {
      setStepErrors((errors) => {
        const rest = { ...errors };
        delete rest[key];
        return rest;
      });
    }
  }

  function addStep() {
    setStepsError(null);
    const lastDay = Number(current.steps.at(-1)?.day);
    const day = Number.isFinite(lastDay) ? lastDay + DAY_GAP : 0;
    update({
      steps: [
        ...current.steps,
        {
          key: `step-${nextKey.current++}`,
          day: String(day),
          channel: "Email",
          subject: "",
        },
      ],
    });
  }

  function moveStep(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= current.steps.length) return;
    const steps = [...current.steps];
    [steps[index], steps[target]] = [steps[target], steps[index]];
    update({ steps });
  }

  function removeStep(key: string) {
    update({ steps: current.steps.filter((step) => step.key !== key) });
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!open || submitted.current) return;
    const name = current.name.trim();
    const errors: Record<string, StepErrors> = {};
    let previousDay: number | null = null;
    for (const step of current.steps) {
      const day = Number(step.day);
      const stepError: StepErrors = {};
      if (step.day.trim() === "" || !Number.isInteger(day) || day < 0) {
        stepError.day = "Use a whole number, 0 or more.";
        previousDay = null;
      } else {
        if (previousDay !== null && day < previousDay) {
          stepError.day = "Day must be on or after the step above";
        }
        previousDay = day;
      }
      if (step.channel === "Email" && !step.subject.trim()) {
        stepError.subject = "Enter a subject.";
      }
      if (stepError.day || stepError.subject) errors[step.key] = stepError;
    }
    setNameError(name ? null : "Enter a name.");
    setStepErrors(errors);
    setStepsError(current.steps.length === 0 ? "Add at least one step" : null);
    if (!name) {
      nameRef.current?.focus();
      return;
    }
    if (current.steps.length === 0 || Object.keys(errors).length > 0) return;

    submitted.current = true;
    const existing = new Set(
      useSequencesStore.getState().sequences.map((item) => item.id),
    );
    const id = editing ? editing.id : uniqueId(name, existing);
    const sequence: Sequence = {
      id,
      name,
      owner: current.owner,
      status: "Draft",
      createdAt: editing ? editing.createdAt : TODAY,
      steps: current.steps.map((step, index) => {
        const original = editing?.steps.find((item) => item.id === step.key);
        return {
          id: `${id}-s${index + 1}`,
          day: Number(step.day),
          channel: step.channel,
          subject: step.subject.trim() || step.channel,
          preview: original?.preview ?? "",
          sent: original?.sent ?? 0,
          opened: original?.opened ?? 0,
          replied: original?.replied ?? 0,
        };
      }),
      enrollments: editing ? editing.enrollments : [],
    };

    handoff.run(
      () => (editing ? updateSequence(sequence) : addSequence(sequence)),
      () => openDetail(sequence.id),
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent
        className="max-w-[560px]"
        onCloseAutoFocus={(event) => {
          setForm(null);
          setNameError(null);
          setStepsError(null);
          setStepErrors({});
          nextKey.current = 2;
          handoff.onCloseAutoFocus(event);
        }}
      >
        <form onSubmit={handleSubmit} noValidate className="flex flex-col">
          <DialogHeader>
            <DialogTitle>
              {editing ? "Edit Sequence" : "New Sequence"}
            </DialogTitle>
            <DialogDescription>
              {editing
                ? "Change the name, owner or steps. It stays a draft until you activate it."
                : "Build the steps. It starts as a draft until you activate it."}
            </DialogDescription>
          </DialogHeader>

          <FormSection title="Sequence">
            <Field
              label="Name"
              htmlFor="new-sequence-name"
              required
              error={nameError ?? undefined}
            >
              <Input
                ref={nameRef}
                id="new-sequence-name"
                value={current.name}
                onChange={(event) => {
                  update({ name: event.target.value });
                  if (nameError) setNameError(null);
                }}
                placeholder="Enterprise cold outreach"
                autoComplete="off"
                aria-invalid={nameError ? true : undefined}
                aria-describedby={
                  nameError ? "new-sequence-name-error" : undefined
                }
                className="aria-invalid:border-danger"
                autoFocus
              />
            </Field>
            <Field label="Owner" htmlFor="new-sequence-owner">
              <Select
                value={current.owner}
                onValueChange={(value) => update({ owner: value })}
              >
                <SelectTrigger id="new-sequence-owner">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {OWNERS.map((owner) => (
                    <SelectItem key={owner.name} value={owner.name}>
                      {owner.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
          </FormSection>

          <FormSection title="Steps">
            {current.steps.length > 0 ? (
              <ol className="flex flex-col gap-3">
                {current.steps.map((step, index) => (
                  <StepFields
                    key={step.key}
                    step={step}
                    index={index}
                    count={current.steps.length}
                    errors={stepErrors[step.key]}
                    onChange={(patch) => updateStep(step.key, patch)}
                    onMove={(direction) => moveStep(index, direction)}
                    onRemove={() => removeStep(step.key)}
                  />
                ))}
              </ol>
            ) : (
              <span
                role={stepsError ? "alert" : undefined}
                className={cn(
                  "caption-style block",
                  stepsError ? "text-danger" : "text-subtle",
                )}
              >
                {stepsError ?? "No steps yet. Add at least one step."}
              </span>
            )}
            <Button
              variant="subtle"
              size="sm"
              onClick={addStep}
              className="self-start"
            >
              <PlusIcon aria-hidden className="size-3" />
              Add step
            </Button>
          </FormSection>

          <DialogFooter>
            <DialogClose asChild>
              <Button variant="subtle" size="sm">
                Cancel
              </Button>
            </DialogClose>
            <Button variant="primary" size="sm" type="submit">
              {editing ? (
                "Save"
              ) : (
                <>
                  <PlusIcon aria-hidden className="size-3" />
                  Create Sequence
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
