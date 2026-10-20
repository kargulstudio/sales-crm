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
import { profileByName } from "@/data/companies";
import { useAuthActions } from "@convex-dev/auth/react";
import { ALL_OWNERS, formatMoney } from "@/lib/companies";
import { useCompaniesStore } from "@/stores/companies-store";
import UsersIcon from "@/public/assets/images/companies/sidebar/users.svg";
import XIcon from "@/public/assets/images/companies/detail/x.svg";
import MailIcon from "@/public/assets/images/companies/detail/mail-04.svg";
import PhoneIcon from "@/public/assets/images/companies/detail/phone.svg";

export default function Profile() {
  const profileName = useCompaniesStore((state) => state.profileName);
  const profileOpen = useCompaniesStore((state) => state.profileOpen);
  const companies = useCompaniesStore((state) => state.companies);
  const closeProfile = useCompaniesStore((state) => state.closeProfile);
  const openDetail = useCompaniesStore((state) => state.openDetail);
  const setOwner = useCompaniesStore((state) => state.setOwner);

  const viewer = useCompaniesStore((state) => state.viewer);
  const { signOut } = useAuthActions();
  const person = profileName ? profileByName(profileName, viewer) : null;
  const isCurrentUser = viewer !== null && person?.name === viewer.name;
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
      <SheetContent side="right" className="sm:w-120 sm:max-w-120">
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
              className="-mr-2"
              aria-label="Close profile"
            >
              <XIcon aria-hidden className="text-foreground size-4" />
            </Button>
          </SheetClose>
        </SheetHeader>

        {person && (
          <ScrollArea className="min-h-0 flex-1">
            <div className="shadow-divider flex items-center gap-3 px-6 py-5">
              <Avatar
                src={person.avatar}
                name={person.name}
                alt=""
                className="shadow-tile size-12.5"
              />
              <div className="flex min-w-0 flex-col gap-2">
                <h2 className="truncate">{person.name}</h2>
                <span className="caption-style text-fg-secondary block truncate">
                  {person.role}
                </span>
              </div>
            </div>

            <DetailSection title="Contact">
              <div className="lead-style flex flex-wrap items-center gap-x-4 gap-y-3">
                {person.email && (
                  <a
                    href={`mailto:${person.email}`}
                    className="hover:text-fg-secondary ease-power3-in-out duration-fast flex items-center gap-1 transition-colors"
                  >
                    <MailIcon
                      aria-hidden
                      className="text-fg-secondary size-3"
                    />
                    {person.email}
                  </a>
                )}
                {person.phone && (
                  <a
                    href={`tel:${person.phone.replace(/[^\d+]/g, "")}`}
                    className="hover:text-fg-secondary ease-power3-in-out duration-fast flex items-center gap-1 transition-colors"
                  >
                    <PhoneIcon
                      aria-hidden
                      className="text-fg-secondary size-3"
                    />
                    {person.phone}
                  </a>
                )}
              </div>
            </DetailSection>

            <DetailSection title={isCurrentUser ? "Team pipeline" : "Pipeline"}>
              <div className="grid grid-cols-2 gap-2">
                {stats.map((stat) => (
                  <div
                    key={stat.label}
                    className="border-line-strong flex flex-col gap-3 rounded-lg border p-2.75"
                  >
                    <span className="caption-style text-fg-secondary block">
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
              title={isCurrentUser ? "Team accounts" : "Accounts"}
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
                <span className="caption-style text-fg-tertiary block">
                  No accounts assigned yet.
                </span>
              )}
            </DetailSection>
          </ScrollArea>
        )}

        <SheetFooter>
          {isCurrentUser ? (
            <Button
              variant="subtle"
              size="sm"
              onClick={() => {
                closeProfile();
                void signOut();
              }}
            >
              Sign out
            </Button>
          ) : (
            <SheetClose asChild>
              <Button variant="subtle" size="sm">
                Close
              </Button>
            </SheetClose>
          )}
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
