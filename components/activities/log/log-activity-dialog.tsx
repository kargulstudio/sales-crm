"use client";

import { useMemo, useRef, useState, type FormEvent } from "react";
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
import { DEAL_ACTIVITY_TYPES, type DealActivityType } from "@/data/deals";
import { formatDelta } from "@/lib/activities";
import { TODAY, formatDate } from "@/lib/companies";
import { dealContacts } from "@/lib/contacts";
import { ACTIVITY_EFFECTS, isOpenStage } from "@/lib/deals";
import { useHandoff } from "@/lib/use-handoff";
import { useActivitiesStore } from "@/stores/activities-store";
import { useCompaniesStore } from "@/stores/companies-store";
import { useContactsStore } from "@/stores/contacts-store";
import { useDealsStore } from "@/stores/deals-store";
import PlusIcon from "@/public/assets/images/_common/plus.svg";

type FormState = {
  companyId: string;
  dealId: string;
  contactId: string;
  type: DealActivityType;
  date: string;
  note: string;
};

type Errors = {
  company?: string;
  deal?: string;
  date?: string;
};

const NOTE_LIMIT = 140;
const NO_CONTACT = "none";

export default function LogActivityDialog() {
  const open = useActivitiesStore((state) => state.logOpen);
  const setOpen = useActivitiesStore((state) => state.setLogOpen);
  const logDealId = useActivitiesStore((state) => state.logDealId);
  const logContactId = useActivitiesStore((state) => state.logContactId);
  const contacts = useContactsStore((state) => state.contacts);
  const deals = useDealsStore((state) => state.deals);
  const logActivity = useDealsStore((state) => state.logActivity);
  const openPush = useDealsStore((state) => state.openPush);
  const handoff = useHandoff();
  const companies = useCompaniesStore((state) => state.companies);
  const [form, setForm] = useState<FormState | null>(null);
  const [errors, setErrors] = useState<Errors>({});
  const companyRef = useRef<HTMLButtonElement>(null);
  const dealRef = useRef<HTMLButtonElement>(null);
  const dateRef = useRef<HTMLInputElement>(null);

  const openDeals = useMemo(
    () => deals.filter((deal) => isOpenStage(deal.stage)),
    [deals],
  );
  const companyOptions = useMemo(() => {
    const withOpen = new Set(openDeals.map((deal) => deal.companyId));
    return companies
      .filter((company) => withOpen.has(company.id))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [companies, openDeals]);

  const preset = openDeals.find((deal) => deal.id === logDealId);
  const presetHasContact = preset
    ? dealContacts(preset.id, contacts).some(
        (contact) => contact.id === logContactId,
      )
    : false;
  const current: FormState = form ?? {
    companyId: preset?.companyId ?? "",
    dealId: preset?.id ?? "",
    contactId: presetHasContact ? (logContactId ?? "") : "",
    type: DEAL_ACTIVITY_TYPES[0],
    date: TODAY,
    note: "",
  };
  const companyDeals = openDeals.filter(
    (deal) => deal.companyId === current.companyId,
  );
  const selectedDeal = companyDeals.find((deal) => deal.id === current.dealId);
  const dealPeople = selectedDeal
    ? dealContacts(selectedDeal.id, contacts)
    : [];

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm({ ...current, [key]: value });
  }

  function selectCompany(companyId: string) {
    const matches = openDeals.filter((deal) => deal.companyId === companyId);
    setForm({
      ...current,
      companyId,
      dealId: matches.length === 1 ? matches[0].id : "",
      contactId: "",
    });
    setErrors((existing) => ({
      ...existing,
      company: undefined,
      deal: undefined,
    }));
  }

  function resetForm() {
    setForm(null);
    setErrors({});
  }

  function handleOpenChange(next: boolean) {
    if (!next) resetForm();
    setOpen(next);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const next: Errors = {};
    if (!current.companyId) next.company = "Choose a company.";
    else if (!current.dealId) next.deal = "Choose a deal.";
    const pushing = current.type === "closePushed";
    if (pushing) next.date = undefined;
    else if (!current.date) next.date = "Pick a date.";
    else if (current.date > TODAY)
      next.date = "The date can't be in the future.";
    else if (selectedDeal && current.date < selectedDeal.stageChangedAt)
      next.date = `Pick ${formatDate(selectedDeal.stageChangedAt)} or later, when the deal reached ${selectedDeal.stage}.`;
    setErrors(next);
    if (next.company) return companyRef.current?.focus();
    if (next.deal) return dealRef.current?.focus();
    if (next.date) return dateRef.current?.focus();

    if (current.type === "closePushed") {
      const dealId = current.dealId;
      handoff.run(
        () => handleOpenChange(false),
        () => openPush(dealId),
      );
      return;
    }

    logActivity(current.dealId, current.type, {
      date: current.date,
      note: current.note.trim(),
      contactId: current.contactId || undefined,
    });
    resetForm();
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        className="max-w-[560px]"
        onCloseAutoFocus={handoff.onCloseAutoFocus}
      >
        <form onSubmit={handleSubmit} noValidate className="flex flex-col">
          <DialogHeader>
            <DialogTitle>Log activity</DialogTitle>
            <DialogDescription>
              Record what happened on an open deal. It updates the deal&apos;s
              win chance right away.
            </DialogDescription>
          </DialogHeader>

          <FormSection title="Deal">
            <Field
              label="Company"
              htmlFor="activity-company"
              required
              error={errors.company}
            >
              <Select value={current.companyId} onValueChange={selectCompany}>
                <SelectTrigger
                  ref={companyRef}
                  id="activity-company"
                  aria-invalid={errors.company ? true : undefined}
                  aria-describedby={
                    errors.company ? "activity-company-error" : undefined
                  }
                  className="aria-invalid:border-danger"
                >
                  <SelectValue placeholder="Choose a company" />
                </SelectTrigger>
                <SelectContent>
                  {companyOptions.map((company) => (
                    <SelectItem key={company.id} value={company.id}>
                      {company.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>

            <Field
              label="Deal"
              htmlFor="activity-deal"
              required
              error={errors.deal}
            >
              <Select
                value={current.dealId}
                onValueChange={(value) => {
                  setForm({ ...current, dealId: value, contactId: "" });
                  setErrors((existing) => ({ ...existing, deal: undefined }));
                }}
                disabled={!current.companyId}
              >
                <SelectTrigger
                  ref={dealRef}
                  id="activity-deal"
                  aria-invalid={errors.deal ? true : undefined}
                  aria-describedby={
                    errors.deal ? "activity-deal-error" : undefined
                  }
                  className="aria-invalid:border-danger"
                >
                  <SelectValue
                    placeholder={
                      current.companyId
                        ? "Choose a deal"
                        : "Choose a company first"
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {companyDeals.map((deal) => (
                    <SelectItem key={deal.id} value={deal.id}>
                      {deal.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>

            <Field
              label="Contact"
              htmlFor="activity-contact"
              hint="Optional. Credit the activity to a person on the deal."
            >
              <Select
                value={current.contactId || NO_CONTACT}
                onValueChange={(value) =>
                  update("contactId", value === NO_CONTACT ? "" : value)
                }
                disabled={!current.dealId}
              >
                <SelectTrigger id="activity-contact">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={NO_CONTACT}>
                    No specific contact
                  </SelectItem>
                  {dealPeople.map((contact) => (
                    <SelectItem key={contact.id} value={contact.id}>
                      {contact.name} · {contact.role}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
          </FormSection>

          <FormSection title="Activity">
            <Field
              label="Type"
              htmlFor="activity-type"
              hint={
                current.type === "closePushed"
                  ? "Opens Push close date to pick the new date."
                  : undefined
              }
            >
              <Select
                value={current.type}
                onValueChange={(value) =>
                  update("type", value as DealActivityType)
                }
              >
                <SelectTrigger id="activity-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DEAL_ACTIVITY_TYPES.map((type) => (
                    <SelectItem key={type} value={type}>
                      {ACTIVITY_EFFECTS[type].label} ·{" "}
                      {formatDelta(ACTIVITY_EFFECTS[type].delta)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>

            <Field
              label="Date"
              htmlFor="activity-date"
              required
              error={errors.date}
              hint={
                selectedDeal
                  ? `Counts toward win chance from ${formatDate(selectedDeal.stageChangedAt)}.`
                  : undefined
              }
            >
              <Input
                ref={dateRef}
                id="activity-date"
                type="date"
                min={selectedDeal?.stageChangedAt}
                max={TODAY}
                value={current.date}
                onChange={(event) => {
                  update("date", event.target.value);
                  setErrors((existing) => ({ ...existing, date: undefined }));
                }}
                aria-invalid={errors.date ? true : undefined}
                aria-describedby={
                  errors.date ? "activity-date-error" : undefined
                }
                className="aria-invalid:border-danger tabular-nums"
              />
            </Field>

            <Field label="Note" htmlFor="activity-note">
              <Input
                id="activity-note"
                value={current.note}
                onChange={(event) => update("note", event.target.value)}
                maxLength={NOTE_LIMIT}
                placeholder="What happened?"
                autoComplete="off"
              />
            </Field>
          </FormSection>

          <DialogFooter>
            <DialogClose asChild>
              <Button variant="subtle" size="sm">
                Cancel
              </Button>
            </DialogClose>
            <Button variant="primary" size="sm" type="submit">
              <PlusIcon aria-hidden className="size-3" />
              Log activity
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
