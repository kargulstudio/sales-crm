"use client";

import { useMemo, useState, type FormEvent } from "react";
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
import FormSection from "@/components/companies/new-company/form-section";
import { TODAY, formatMoney } from "@/lib/companies";
import {
  ALL_FORECAST_OWNERS,
  quarterById,
  repRollups,
  teamTotals,
} from "@/lib/forecast";
import { useDealsStore } from "@/stores/deals-store";
import { useForecastStore } from "@/stores/forecast-store";
import TargetIcon from "@/public/assets/images/companies/sidebar/target-05.svg";

type FormState = {
  amount: string;
  note: string;
};

export default function SubmitDialog() {
  const open = useForecastStore((state) => state.submitOpen);
  const setOpen = useForecastStore((state) => state.setSubmitOpen);
  const period = useForecastStore((state) => state.period);
  const submission = useForecastStore((state) => state.submissions[period]);
  const submitForecast = useForecastStore((state) => state.submitForecast);
  const deals = useDealsStore((state) => state.deals);
  const [form, setForm] = useState<FormState | null>(null);

  const computedCommit = useMemo(
    () => teamTotals(repRollups(deals, period, ALL_FORECAST_OWNERS)).commit,
    [deals, period],
  );

  const current: FormState = form ?? {
    amount: String(submission?.amount ?? computedCommit),
    note: submission?.note ?? "",
  };

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm({ ...current, [key]: value });
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    submitForecast(period, {
      amount: Math.max(0, Math.round(Number(current.amount) || 0)),
      note: current.note.trim(),
      date: TODAY,
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent
        className="max-w-[480px]"
        onCloseAutoFocus={() => setForm(null)}
      >
        <form onSubmit={handleSubmit} noValidate className="flex flex-col">
          <DialogHeader>
            <DialogTitle>Submit forecast</DialogTitle>
            <DialogDescription>
              Send your commit number for {quarterById(period).label}.
            </DialogDescription>
          </DialogHeader>

          <FormSection title="Commit">
            <Field
              label="Commit amount"
              htmlFor="forecast-amount"
              hint={`Computed from open deals: $${formatMoney(computedCommit)}`}
            >
              <div className="relative">
                <span
                  aria-hidden
                  className="text-subtle pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-[14px] leading-none"
                >
                  $
                </span>
                <Input
                  id="forecast-amount"
                  type="number"
                  min={0}
                  step={1000}
                  inputMode="numeric"
                  value={current.amount}
                  onChange={(event) => update("amount", event.target.value)}
                  className="pl-6 tabular-nums"
                  autoFocus
                />
              </div>
            </Field>
            <Field label="Note" htmlFor="forecast-note">
              <Input
                id="forecast-note"
                value={current.note}
                onChange={(event) => update("note", event.target.value)}
                placeholder="Risks, upside and anything leadership should know"
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
              <TargetIcon aria-hidden className="size-3" />
              {submission ? "Update forecast" : "Submit forecast"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
