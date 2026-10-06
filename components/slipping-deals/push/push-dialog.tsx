"use client";

import { useState, type FormEvent } from "react";
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
import { TODAY, formatDate } from "@/lib/companies";
import { ACTIVITY_EFFECTS, addDays, isOpenStage } from "@/lib/deals";
import { endOfNextQuarter, minPushDate, pushCapped } from "@/lib/slipping";
import { useDealsStore } from "@/stores/deals-store";

const QUICK_PICKS = [
  { key: "week", label: "+1 week", date: (base: string) => addDays(base, 7) },
  {
    key: "weeks",
    label: "+2 weeks",
    date: (base: string) => addDays(base, 14),
  },
  {
    key: "month",
    label: "+30 days",
    date: (base: string) => addDays(base, 30),
  },
  { key: "quarter", label: "End of next quarter", date: endOfNextQuarter },
];

export default function PushDialog() {
  const open = useDealsStore((state) => state.pushOpen);
  const setOpen = useDealsStore((state) => state.setPushOpen);
  const pushId = useDealsStore((state) => state.pushId);
  const deals = useDealsStore((state) => state.deals);
  const pushCloseDate = useDealsStore((state) => state.pushCloseDate);
  const [picked, setPicked] = useState<{ id: string | null; date: string }>({
    id: null,
    date: "",
  });

  const deal = deals.find(
    (item) => item.id === pushId && isOpenStage(item.stage),
  );
  const min = deal ? minPushDate(deal) : "";
  const date = picked.id === pushId ? picked.date : "";
  const valid = deal !== undefined && date >= min && date !== "";
  const error =
    date !== "" && !valid && deal
      ? `Pick ${formatDate(min)} or later.`
      : undefined;

  function handleOpenChange(next: boolean) {
    if (!next) setPicked({ id: null, date: "" });
    setOpen(next);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!deal || !valid) return;
    pushCloseDate(deal.id, date);
    handleOpenChange(false);
  }

  return (
    <Dialog open={open && deal !== undefined} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-[480px]">
        <form onSubmit={handleSubmit} noValidate className="flex flex-col">
          <DialogHeader>
            <DialogTitle>Push close date</DialogTitle>
            <DialogDescription>
              {deal
                ? `Move the close date for ${deal.name}. The old and new date are recorded.`
                : "Move the close date for this deal."}
            </DialogDescription>
          </DialogHeader>

          {deal && (
            <FormSection title="New close date">
              <div className="flex flex-col gap-1.5">
                <span className="caption-style text-soft">
                  Current close date
                </span>
                <span className="lead-style text-foreground tabular-nums">
                  {formatDate(deal.closeDate)}
                </span>
              </div>

              <Field
                label="New close date"
                htmlFor="push-date"
                required
                error={error}
                hint={
                  deal.winOverride !== undefined
                    ? "Win chance stays at the manual value."
                    : pushCapped(deal)
                      ? "Win chance won't drop. A pushed close date is already counted twice this stage."
                      : `Win chance drops ${Math.abs(ACTIVITY_EFFECTS.closePushed.delta)}%.`
                }
              >
                <Input
                  id="push-date"
                  type="date"
                  min={min}
                  value={date}
                  onChange={(event) =>
                    setPicked({ id: deal.id, date: event.target.value })
                  }
                  aria-invalid={error ? true : undefined}
                  aria-describedby={error ? "push-date-error" : undefined}
                  className="aria-invalid:border-danger tabular-nums"
                />
              </Field>

              <div className="flex flex-wrap gap-2">
                {QUICK_PICKS.map((pick) => {
                  const target = pick.date(
                    deal.closeDate > TODAY ? deal.closeDate : TODAY,
                  );
                  return (
                    <Button
                      key={pick.key}
                      type="button"
                      variant="secondary"
                      size="sm"
                      disabled={target < min}
                      title={
                        target < min
                          ? "Before the earliest allowed date"
                          : undefined
                      }
                      onClick={() => setPicked({ id: deal.id, date: target })}
                    >
                      {pick.label}
                    </Button>
                  );
                })}
              </div>
            </FormSection>
          )}

          <DialogFooter>
            <DialogClose asChild>
              <Button variant="subtle" size="sm">
                Cancel
              </Button>
            </DialogClose>
            <Button variant="primary" size="sm" type="submit" disabled={!valid}>
              Save
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
