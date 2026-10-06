"use client";

import Avatar from "@/components/_ui/avatar";
import Button from "@/components/_ui/button";
import { ScrollArea } from "@/components/_ui/scroll-area";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/_ui/sheet";
import DetailSection from "../detail/detail-section";
import ProfileAccount from "./profile-account";
import { useOwner } from "@/stores/companies-store";
import { ALL_OWNERS, formatMoney } from "@/lib/companies";
import { useCompaniesStore } from "@/stores/companies-store";
import UsersIcon from "@/assets/icons/companies/sidebar/users.svg?react";
import XIcon from "@/assets/icons/companies/detail/x.svg?react";
import MailIcon from "@/assets/icons/companies/detail/mail-04.svg?react";
import PhoneIcon from "@/assets/icons/companies/detail/phone.svg?react";

export default function Profile() {
  const profileName = useCompaniesStore((state) => state.profileName);
  const profileOpen = useCompaniesStore((state) => state.profileOpen);
  const companies = useCompaniesStore((state) => state.companies);
  const closeProfile = useCompaniesStore((state) => state.closeProfile);
  const openDetail = useCompaniesStore((state) => state.openDetail);
  const setOwner = useCompaniesStore((state) => state.setOwner);

  const person = useOwner(profileName);
  const currentUser = useCompaniesStore((s) => s.user);
  const isCurrentUser = person.id === currentUser?.id;
  const accounts = person
    ? companies
        .filter((company) => isCurrentUser || company.owner === person.name)
        .sort((a, b) => b.pipelineValue - a.pipelineValue)
    : [];

  const openDeals = accounts.reduce(
    (sum, company) => sum + company.openDeals,
    0,
  );
  const pipeline = accounts.reduce(
    (sum, company) => sum + company.pipelineValue,
    0,
  );
  const avgWin = accounts.length
    ? Math.round(
        accounts.reduce((sum, company) => sum + company.winProbability, 0) /
          accounts.length,
      )
    : 0;

  const stats = [
    { label: "Accounts", value: String(accounts.length) },
    { label: "Open deals", value: String(openDeals) },
    { label: "Pipeline", value: `$${formatMoney(pipeline)}` },
    { label: "Avg. win", value: `${avgWin}%` },
  ];

  function showAccounts() {
    setOwner(isCurrentUser || !person ? ALL_OWNERS : person.name);
    closeProfile();
  }

  return (
    <Sheet
      open={profileOpen && person !== null}
      onOpenChange={(open) => !open && closeProfile()}
    >
      <SheetContent side="right" className="sm:w-[480px] sm:max-w-[480px]">
        <SheetHeader>
          <div className="flex items-center gap-2">
            <UsersIcon aria-hidden className="text-icon size-3.5" />
            <SheetTitle>
              {isCurrentUser ? "My Profile" : "Owner Profile"}
            </SheetTitle>
          </div>
          <SheetDescription className="sr-only">
            Contact details, pipeline summary and assigned accounts
          </SheetDescription>
          <SheetClose asChild>
            <Button
              variant="ghost"
              size="icon-sm"
              className="-mr-1"
              aria-label="Close profile"
            >
              <XIcon aria-hidden className="text-foreground size-4" />
            </Button>
          </SheetClose>
        </SheetHeader>

        {person && (
          <ScrollArea className="min-h-0 flex-1">
            <div className="flex items-center gap-3 p-5 shadow-[inset_0_-1px_0_var(--line-strong)]">
              <Avatar
                src={person.avatar}
                alt=""
                className="size-[50px] shadow-[0px_6.25px_6.25px_0px_rgba(15,15,15,0.24),0px_0px_0px_1.563px_#232323]"
              />
              <div className="flex min-w-0 flex-col gap-2">
                <h2 className="truncate">{person.name}</h2>
                <span className="caption-style text-soft block truncate">
                  {person.role}
                </span>
              </div>
            </div>

            <DetailSection title="Contact">
              <div className="lead-style flex flex-wrap items-center gap-x-4 gap-y-3">
                <a
                  href={`mailto:${person.email}`}
                  className="hover:text-soft ease-power3-in-out flex items-center gap-1 transition-colors duration-150"
                >
                  <MailIcon aria-hidden className="text-soft size-3" />
                  {person.email}
                </a>
                <a
                  href={`tel:${person.phone.replace(/[^\d+]/g, "")}`}
                  className="hover:text-soft ease-power3-in-out flex items-center gap-1 transition-colors duration-150"
                >
                  <PhoneIcon aria-hidden className="text-soft size-3" />
                  {person.phone}
                </a>
              </div>
            </DetailSection>

            <DetailSection title={isCurrentUser ? "My pipeline" : "Pipeline"}>
              <div className="grid grid-cols-2 gap-2">
                {stats.map((stat) => (
                  <div
                    key={stat.label}
                    className="border-line-strong flex flex-col gap-3 rounded-lg border p-[11px]"
                  >
                    <span className="caption-style text-soft block">
                      {stat.label}
                    </span>
                    <span className="lead-style block tabular-nums">
                      {stat.value}
                    </span>
                  </div>
                ))}
              </div>
            </DetailSection>

            <DetailSection
              title={isCurrentUser ? "My accounts" : "Accounts"}
              className="shadow-none"
            >
              {accounts.length > 0 ? (
                <ul className="-mx-2 flex flex-col gap-0.5">
                  {accounts.map((company) => (
                    <ProfileAccount
                      key={company.id}
                      company={company}
                      onOpen={() => openDetail(company.id)}
                    />
                  ))}
                </ul>
              ) : (
                <span className="caption-style text-subtle block">
                  No accounts assigned yet.
                </span>
              )}
            </DetailSection>
          </ScrollArea>
        )}

        <SheetFooter>
          {isCurrentUser && (
            <Button variant="ghost" size="sm" href="/cdn-cgi/access/logout">
              Sign out
            </Button>
          )}
          <SheetClose asChild>
            <Button variant="subtle" size="sm">
              Close
            </Button>
          </SheetClose>
          <Button
            variant="primary"
            size="sm"
            onClick={showAccounts}
            disabled={accounts.length === 0}
          >
            {isCurrentUser ? "Show all accounts" : "Filter table by owner"}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
