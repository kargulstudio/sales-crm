"use client";

import { useState } from "react";
import Avatar from "@/components/_ui/avatar";
import Button from "@/components/_ui/button";
import CountBadge from "@/components/_ui/count-badge";
import Field from "@/components/_ui/field";
import { ScrollArea } from "@/components/_ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/_ui/select";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/_ui/sheet";
import {
  CONTACT_OWNER_OPTIONS,
  CONTACT_ROLE_OPTIONS,
  CONTACT_SORT_MENU_OPTIONS,
  useContactCompanyOptions,
} from "./filter-options";
import { ownerByName } from "@/data/companies";
import {
  ALL_CONTACT_OWNERS,
  DEFAULT_CONTACT_FILTERS,
  contactActiveFilterCount,
  type ContactSortKey,
} from "@/lib/contacts";
import { cn } from "@/lib/utils";
import { useContactsStore, useVisibleContacts } from "@/stores/contacts-store";
import FilterIcon from "@/public/assets/images/_common/filter.svg";
import XIcon from "@/public/assets/images/companies/detail/x.svg";

type MobileFiltersProps = {
  className?: string;
};

export default function MobileFilters({ className }: MobileFiltersProps) {
  const [open, setOpen] = useState(false);
  const sortBy = useContactsStore((state) => state.sortBy);
  const owner = useContactsStore((state) => state.owner);
  const role = useContactsStore((state) => state.role);
  const company = useContactsStore((state) => state.company);
  const setSortBy = useContactsStore((state) => state.setSortBy);
  const setOwner = useContactsStore((state) => state.setOwner);
  const setRoleFilter = useContactsStore((state) => state.setRoleFilter);
  const setCompany = useContactsStore((state) => state.setCompany);
  const resetFilters = useContactsStore((state) => state.resetFilters);
  const companyOptions = useContactCompanyOptions();
  const resultCount = useVisibleContacts().length;

  const activeCount = contactActiveFilterCount({
    sortBy,
    owner,
    role,
    company,
  });

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <Button
        variant="secondary"
        size="sm"
        onClick={() => setOpen(true)}
        aria-label={
          activeCount > 0 ? `Filters, ${activeCount} active` : "Filters"
        }
        className={cn("data-[active=true]:bg-muted", className)}
        data-active={activeCount > 0}
      >
        <FilterIcon aria-hidden className="size-3" />
        Filters
        {activeCount > 0 && <CountBadge>{activeCount}</CountBadge>}
      </Button>

      <SheetContent side="bottom">
        <SheetHeader className="px-4">
          <SheetTitle>Filters</SheetTitle>
          <SheetDescription className="sr-only">
            Sort and filter the contacts table
          </SheetDescription>
          <SheetClose asChild>
            <Button
              variant="ghost"
              size="icon-sm"
              className="-mr-1"
              aria-label="Close filters"
            >
              <XIcon aria-hidden className="text-foreground size-4" />
            </Button>
          </SheetClose>
        </SheetHeader>

        <ScrollArea fade viewportClassName="max-h-[calc(85dvh-118px)]">
          <div className="flex flex-col gap-4 p-4">
            <Field label="Sort by" htmlFor="mobile-contact-sort">
              <Select
                value={sortBy}
                onValueChange={(value) => setSortBy(value as ContactSortKey)}
              >
                <SelectTrigger id="mobile-contact-sort">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CONTACT_SORT_MENU_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>

            <Field label="Account owner" htmlFor="mobile-contact-owner">
              <Select value={owner} onValueChange={setOwner}>
                <SelectTrigger id="mobile-contact-owner">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CONTACT_OWNER_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.value === ALL_CONTACT_OWNERS ? (
                        option.label
                      ) : (
                        <span className="flex items-center gap-2">
                          <Avatar
                            src={ownerByName(option.value).avatar}
                            alt=""
                          />
                          {option.label}
                        </span>
                      )}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>

            <Field label="Role" htmlFor="mobile-contact-role">
              <Select value={role} onValueChange={setRoleFilter}>
                <SelectTrigger id="mobile-contact-role">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CONTACT_ROLE_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>

            <Field label="Company" htmlFor="mobile-contact-company">
              <Select value={company} onValueChange={setCompany}>
                <SelectTrigger id="mobile-contact-company">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {companyOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
          </div>
        </ScrollArea>

        <SheetFooter className="px-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={resetFilters}
            disabled={
              activeCount === 0 && sortBy === DEFAULT_CONTACT_FILTERS.sortBy
            }
            className="-ml-1.5"
          >
            Reset
          </Button>
          <SheetClose asChild>
            <Button variant="primary" size="sm">
              Show {resultCount} {resultCount === 1 ? "contact" : "contacts"}
            </Button>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
