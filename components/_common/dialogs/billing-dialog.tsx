"use client";

import { useState } from "react";
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
import { Tabs, TabsList, TabsTrigger } from "@/components/_ui/tabs";
import { ANNUAL_DISCOUNT, PLANS, TRIAL_DAYS_LEFT } from "@/data/workspace";
import { formatMoney } from "@/lib/companies";
import { cn } from "@/lib/utils";
import { useCompaniesStore } from "@/stores/companies-store";
import WalletIcon from "@/public/assets/images/companies/sidebar/wallet.svg";

type Period = "monthly" | "annual";

export default function BillingDialog() {
  const open = useCompaniesStore((state) => state.appDialog === "billing");
  const setAppDialog = useCompaniesStore((state) => state.setAppDialog);
  const planId = useCompaniesStore((state) => state.planId);
  const setPlanId = useCompaniesStore((state) => state.setPlanId);
  const [selected, setSelected] = useState(planId ?? PLANS[1].id);
  const [period, setPeriod] = useState<Period>("annual");
  const [seats, setSeats] = useState("8");
  const [confirmed, setConfirmed] = useState(false);

  const plan = PLANS.find((item) => item.id === selected) ?? PLANS[0];
  const seatCount = Math.max(1, Math.round(Number(seats) || 1));
  const seatPrice =
    period === "annual"
      ? Math.round(plan.seatPrice * (1 - ANNUAL_DISCOUNT))
      : plan.seatPrice;
  const monthly = seatPrice * seatCount;

  function confirm() {
    setPlanId(plan.id);
    setConfirmed(true);
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => setAppDialog(next ? "billing" : null)}
    >
      <DialogContent
        className="max-w-[560px]"
        onCloseAutoFocus={() => setConfirmed(false)}
      >
        <DialogHeader>
          <DialogTitle>{confirmed ? "Plan saved" : "Add billing"}</DialogTitle>
          <DialogDescription>
            {confirmed
              ? `${plan.name} starts when your trial ends in ${TRIAL_DAYS_LEFT} days.`
              : `Pick a plan now. You won't be charged until your trial ends in ${TRIAL_DAYS_LEFT} days.`}
          </DialogDescription>
        </DialogHeader>

        {confirmed ? (
          <div className="flex flex-col gap-3 px-6 py-5">
            {[
              { label: "Plan", value: plan.name },
              { label: "Seats", value: String(seatCount) },
              {
                label: "Billed",
                value: period === "annual" ? "Yearly" : "Monthly",
              },
              { label: "Per month", value: `$${formatMoney(monthly)}` },
            ].map((row) => (
              <div
                key={row.label}
                className="lead-style flex items-center justify-between gap-3"
              >
                <span className="text-soft">{row.label}</span>
                <span className="tabular-nums">{row.value}</span>
              </div>
            ))}
          </div>
        ) : (
          <>
            <div className="flex flex-col gap-4 px-6 py-5 shadow-[inset_0_-1px_0_var(--line-strong)]">
              <Tabs
                value={period}
                onValueChange={(value) => setPeriod(value as Period)}
              >
                <TabsList className="border-line-strong border-b">
                  <TabsTrigger value="annual" className="py-3">
                    Yearly · save {ANNUAL_DISCOUNT * 100}%
                  </TabsTrigger>
                  <TabsTrigger value="monthly" className="py-3">
                    Monthly
                  </TabsTrigger>
                </TabsList>
              </Tabs>

              <div
                role="radiogroup"
                aria-label="Plan"
                className="grid gap-2 sm:grid-cols-3"
              >
                {PLANS.map((item) => {
                  const active = item.id === selected;
                  const price =
                    period === "annual"
                      ? Math.round(item.seatPrice * (1 - ANNUAL_DISCOUNT))
                      : item.seatPrice;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      role="radio"
                      aria-checked={active}
                      onClick={() => setSelected(item.id)}
                      className={cn(
                        "border-line-strong ease-power3-out focus-visible:ring-ring/60 flex cursor-pointer flex-col gap-3 rounded-lg border p-3 text-left transition-[background-color,border-color] duration-150 outline-none hover:bg-white/4 focus-visible:ring-2",
                        active && "border-foreground bg-card",
                      )}
                    >
                      <span className="lead-style block font-medium">
                        {item.name}
                      </span>
                      <span className="block text-[20px] leading-none tabular-nums">
                        ${price}
                        <span className="caption-style text-subtle">
                          {" "}
                          / seat / mo
                        </span>
                      </span>
                      <span className="caption-style text-soft block leading-[1.3]">
                        {item.summary}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex items-end justify-between gap-4 px-6 py-5">
              <Field label="Seats" htmlFor="billing-seats" className="w-28">
                <Input
                  id="billing-seats"
                  type="number"
                  min={1}
                  inputMode="numeric"
                  value={seats}
                  onChange={(event) => setSeats(event.target.value)}
                  className="tabular-nums"
                />
              </Field>
              <div className="flex flex-col items-end gap-2">
                <span className="caption-style text-soft block">
                  Total per month
                </span>
                <span className="block text-[24px] leading-none tabular-nums">
                  ${formatMoney(monthly)}
                </span>
              </div>
            </div>
          </>
        )}

        <DialogFooter>
          <DialogClose asChild>
            <Button variant={confirmed ? "primary" : "subtle"} size="sm">
              {confirmed ? "Done" : "Cancel"}
            </Button>
          </DialogClose>
          {!confirmed && (
            <Button variant="primary" size="sm" onClick={confirm}>
              <WalletIcon aria-hidden className="size-3" />
              Choose {plan.name}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
