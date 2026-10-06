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
import { CONTACT_ROLES, type Contact, type ContactRole } from "@/data/contacts";
import { ACTIVITY_EFFECTS, isOpenStage } from "@/lib/deals";
import { slugify } from "@/lib/utils";
import { useCompaniesStore } from "@/stores/companies-store";
import { useContactsStore } from "@/stores/contacts-store";
import { useDealsStore } from "@/stores/deals-store";
import PlusIcon from "@/public/assets/images/_common/plus.svg";

type FormState = {
  companyId: string;
  name: string;
  title: string;
  role: ContactRole;
  email: string;
  phone: string;
  dealId: string;
};

const NO_DEAL = "none";

export default function NewContactDialog() {
  const open = useContactsStore((state) => state.newContactOpen);
  const setOpen = useContactsStore((state) => state.setNewContactOpen);
  const addContact = useContactsStore((state) => state.addContact);
  const linkToDeal = useContactsStore((state) => state.linkToDeal);
  const companies = useCompaniesStore((state) => state.companies);
  const deals = useDealsStore((state) => state.deals);
  const logActivity = useDealsStore((state) => state.logActivity);
  const [form, setForm] = useState<FormState | null>(null);
  const [nameError, setNameError] = useState<string | null>(null);
  const [companyError, setCompanyError] = useState<string | null>(null);
  const nameRef = useRef<HTMLInputElement>(null);
  const companyRef = useRef<HTMLButtonElement>(null);
  const submitted = useRef(false);

  useEffect(() => {
    if (open) submitted.current = false;
  }, [open]);

  const current: FormState = form ?? {
    companyId: "",
    name: "",
    title: "",
    role: CONTACT_ROLES[0],
    email: "",
    phone: "",
    dealId: "",
  };
  const companyDeals = deals.filter(
    (deal) => deal.companyId === current.companyId && isOpenStage(deal.stage),
  );

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm({ ...current, [key]: value });
  }

  function selectCompany(companyId: string) {
    setForm({ ...current, companyId, dealId: "" });
    setCompanyError(null);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!open || submitted.current) return;
    const name = current.name.trim();
    if (!current.companyId) setCompanyError("Choose a company.");
    if (!name) setNameError("Enter a name.");
    if (!current.companyId) {
      companyRef.current?.focus();
      return;
    }
    if (!name) {
      nameRef.current?.focus();
      return;
    }

    submitted.current = true;
    const existingIds = new Set(
      useContactsStore.getState().contacts.map((item) => item.id),
    );
    let id = `${slugify(name)}-${Date.now()}`;
    for (let n = 2; existingIds.has(id); n += 1) {
      id = `${slugify(name)}-${Date.now()}-${n}`;
    }

    const contact: Contact = {
      id,
      name,
      title: current.title.trim(),
      companyId: current.companyId,
      email: current.email.trim(),
      phone: current.phone.trim(),
      role: current.role,
      dealIds: [],
    };

    addContact(contact);
    if (current.dealId) {
      linkToDeal(contact.id, current.dealId);
      if (current.role === "Decision maker") {
        logActivity(current.dealId, "decisionMaker", {
          contactId: contact.id,
        });
      }
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent
        className="max-w-[560px]"
        onCloseAutoFocus={() => {
          setForm(null);
          setNameError(null);
          setCompanyError(null);
        }}
      >
        <form onSubmit={handleSubmit} noValidate className="flex flex-col">
          <DialogHeader>
            <DialogTitle>New Contact</DialogTitle>
            <DialogDescription>
              Add a person to an account. They show up in Contacts right away.
            </DialogDescription>
          </DialogHeader>

          <FormSection title="Person">
            <Field
              label="Company"
              htmlFor="contact-company"
              required
              error={companyError ?? undefined}
            >
              <Select value={current.companyId} onValueChange={selectCompany}>
                <SelectTrigger
                  ref={companyRef}
                  id="contact-company"
                  aria-invalid={companyError ? true : undefined}
                  aria-describedby={
                    companyError ? "contact-company-error" : undefined
                  }
                  className="aria-invalid:border-danger"
                >
                  <SelectValue placeholder="Choose a company" />
                </SelectTrigger>
                <SelectContent>
                  {companies.map((company) => (
                    <SelectItem key={company.id} value={company.id}>
                      {company.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>

            <Field
              label="Name"
              htmlFor="contact-name"
              required
              error={nameError ?? undefined}
            >
              <Input
                ref={nameRef}
                id="contact-name"
                value={current.name}
                onChange={(event) => {
                  update("name", event.target.value);
                  if (nameError) setNameError(null);
                }}
                placeholder="Jordan Rivera"
                autoComplete="off"
                aria-invalid={nameError ? true : undefined}
                aria-describedby={nameError ? "contact-name-error" : undefined}
                className="aria-invalid:border-danger"
                autoFocus
              />
            </Field>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Title" htmlFor="contact-title">
                <Input
                  id="contact-title"
                  value={current.title}
                  onChange={(event) => update("title", event.target.value)}
                  placeholder="VP of Sales"
                  autoComplete="off"
                />
              </Field>
              <Field label="Role" htmlFor="contact-role">
                <Select
                  value={current.role}
                  onValueChange={(value) =>
                    update("role", value as ContactRole)
                  }
                >
                  <SelectTrigger id="contact-role">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CONTACT_ROLES.map((role) => (
                      <SelectItem key={role} value={role}>
                        {role}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
            </div>
          </FormSection>

          <FormSection title="Reach & deal">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Email" htmlFor="contact-email">
                <Input
                  id="contact-email"
                  type="email"
                  value={current.email}
                  onChange={(event) => update("email", event.target.value)}
                  placeholder="jordan@acme.com"
                  autoComplete="off"
                />
              </Field>
              <Field label="Phone" htmlFor="contact-phone">
                <Input
                  id="contact-phone"
                  type="tel"
                  value={current.phone}
                  onChange={(event) => update("phone", event.target.value)}
                  placeholder="+1 (212) 555-0100"
                  autoComplete="off"
                />
              </Field>
            </div>

            <Field
              label="Add to deal"
              htmlFor="contact-deal"
              hint={
                current.role === "Decision maker" && current.dealId
                  ? `Logs Decision-maker added on the deal, +${ACTIVITY_EFFECTS.decisionMaker.delta} to win chance.`
                  : undefined
              }
            >
              <Select
                value={current.dealId || NO_DEAL}
                onValueChange={(value) =>
                  update("dealId", value === NO_DEAL ? "" : value)
                }
                disabled={!current.companyId}
              >
                <SelectTrigger id="contact-deal">
                  <SelectValue
                    placeholder={
                      current.companyId
                        ? "Choose a deal"
                        : "Choose a company first"
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={NO_DEAL}>No deal yet</SelectItem>
                  {companyDeals.map((deal) => (
                    <SelectItem key={deal.id} value={deal.id}>
                      {deal.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
              Create Contact
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
