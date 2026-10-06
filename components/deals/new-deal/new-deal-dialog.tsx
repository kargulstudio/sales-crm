"use client";

import { useRef, useState, type FormEvent } from "react";
import Avatar from "@/components/_ui/avatar";
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
import { OWNERS, STAGES, type Stage } from "@/data/companies";
import {
  DEAL_STAGES,
  OPEN_STAGES,
  REGIONS,
  type Deal,
  type DealStage,
  type Region,
} from "@/data/deals";
import { TODAY } from "@/lib/companies";
import { slugify } from "@/lib/utils";
import { useCompaniesStore } from "@/stores/companies-store";
import { useDealsStore } from "@/stores/deals-store";
import PlusIcon from "@/public/assets/images/_common/plus.svg";

type FormState = {
  companyId: string;
  name: string;
  value: string;
  stage: DealStage;
  owner: string;
  region: Region;
  closeDate: string;
  motion: Stage;
};

export default function NewDealDialog() {
  const open = useDealsStore((state) => state.newDealOpen);
  const setOpen = useDealsStore((state) => state.setNewDealOpen);
  const addDeal = useDealsStore((state) => state.addDeal);
  const newDealRegion = useDealsStore((state) => state.newDealRegion);
  const companies = useCompaniesStore((state) => state.companies);
  const [form, setForm] = useState<FormState | null>(null);
  const [nameError, setNameError] = useState<string | null>(null);
  const [companyError, setCompanyError] = useState<string | null>(null);
  const nameRef = useRef<HTMLInputElement>(null);
  const companyRef = useRef<HTMLButtonElement>(null);

  const current: FormState = form ?? {
    companyId: "",
    name: "",
    value: "",
    stage: OPEN_STAGES[0],
    owner: OWNERS[0].name,
    region: newDealRegion,
    closeDate: TODAY,
    motion: STAGES[0],
  };

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm({ ...current, [key]: value });
  }

  function selectCompany(companyId: string) {
    const company = companies.find((item) => item.id === companyId);
    setForm({
      ...current,
      companyId,
      owner: company?.owner ?? current.owner,
    });
    setCompanyError(null);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const name = current.name.trim();
    if (!current.companyId) setCompanyError("Choose a company.");
    if (!name) setNameError("Enter a deal name.");
    if (!current.companyId) {
      companyRef.current?.focus();
      return;
    }
    if (!name) {
      nameRef.current?.focus();
      return;
    }

    const deal: Deal = {
      id: `${slugify(name)}-${Date.now()}`,
      name,
      companyId: current.companyId,
      region: current.region,
      owner: current.owner,
      value: Math.max(0, Math.round(Number(current.value) || 0)),
      stage: current.stage,
      stageChangedAt: TODAY,
      activity: [],
      closeDate: current.closeDate || TODAY,
      motion: current.motion,
      nextStep: "Schedule the first call.",
    };

    addDeal(deal);
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
            <DialogTitle>New Deal</DialogTitle>
            <DialogDescription>
              Add a deal to the board. It appears in its stage right away.
            </DialogDescription>
          </DialogHeader>

          <FormSection title="Deal">
            <Field
              label="Company"
              htmlFor="deal-company"
              required
              error={companyError ?? undefined}
            >
              <Select value={current.companyId} onValueChange={selectCompany}>
                <SelectTrigger
                  ref={companyRef}
                  id="deal-company"
                  aria-invalid={companyError ? true : undefined}
                  aria-describedby={
                    companyError ? "deal-company-error" : undefined
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
              label="Deal name"
              htmlFor="deal-name"
              required
              error={nameError ?? undefined}
            >
              <Input
                ref={nameRef}
                id="deal-name"
                value={current.name}
                onChange={(event) => {
                  update("name", event.target.value);
                  if (nameError) setNameError(null);
                }}
                placeholder="Acme — Platform expansion"
                autoComplete="off"
                aria-invalid={nameError ? true : undefined}
                aria-describedby={nameError ? "deal-name-error" : undefined}
                className="aria-invalid:border-danger"
                autoFocus
              />
            </Field>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Deal value" htmlFor="deal-value">
                <div className="relative">
                  <span
                    aria-hidden
                    className="text-subtle pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-[14px] leading-none"
                  >
                    $
                  </span>
                  <Input
                    id="deal-value"
                    type="number"
                    min={0}
                    step={1000}
                    inputMode="numeric"
                    value={current.value}
                    onChange={(event) => update("value", event.target.value)}
                    placeholder="120000"
                    className="pl-6 tabular-nums"
                  />
                </div>
              </Field>
              <Field label="Stage" htmlFor="deal-stage">
                <Select
                  value={current.stage}
                  onValueChange={(value) => update("stage", value as DealStage)}
                >
                  <SelectTrigger id="deal-stage">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {DEAL_STAGES.map((stage) => (
                      <SelectItem key={stage} value={stage}>
                        {stage}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
            </div>
          </FormSection>

          <FormSection title="Ownership & timing">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Deal owner" htmlFor="deal-owner">
                <Select
                  value={current.owner}
                  onValueChange={(value) => update("owner", value)}
                >
                  <SelectTrigger id="deal-owner">
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
              <Field label="Region" htmlFor="deal-region">
                <Select
                  value={current.region}
                  onValueChange={(value) => update("region", value as Region)}
                >
                  <SelectTrigger id="deal-region">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {REGIONS.map((region) => (
                      <SelectItem key={region} value={region}>
                        {region}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Close date" htmlFor="deal-close-date">
                <Input
                  id="deal-close-date"
                  type="date"
                  value={current.closeDate}
                  onChange={(event) => update("closeDate", event.target.value)}
                  className="tabular-nums"
                />
              </Field>
              <Field label="Motion" htmlFor="deal-motion">
                <Select
                  value={current.motion}
                  onValueChange={(value) => update("motion", value as Stage)}
                >
                  <SelectTrigger id="deal-motion">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {STAGES.map((motion) => (
                      <SelectItem key={motion} value={motion}>
                        {motion}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
            </div>
          </FormSection>

          <DialogFooter>
            <DialogClose asChild>
              <Button variant="subtle" size="sm">
                Cancel
              </Button>
            </DialogClose>
            <Button variant="primary" size="sm" type="submit">
              <PlusIcon aria-hidden className="size-3" />
              Create Deal
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
