"use client";

import Button from "@/components/_ui/button";
import FilterMenu from "@/components/_common/filter-menu";
import MobileFilters from "./mobile-filters";
import {
  CONTACT_OWNER_OPTIONS,
  CONTACT_ROLE_OPTIONS,
  CONTACT_SORT_MENU_OPTIONS,
  useContactCompanyOptions,
} from "./filter-options";
import { TODAY } from "@/lib/companies";
import { contactsCsvRows, type ContactSortKey } from "@/lib/contacts";
import { downloadCsv } from "@/lib/csv";
import { useCompanyMap } from "@/stores/companies-store";
import {
  useContactSummaries,
  useContactsStore,
  useVisibleContacts,
} from "@/stores/contacts-store";
import PlusIcon from "@/public/assets/images/_common/plus.svg";
import ShareIcon from "@/public/assets/images/companies/toolbar/share.svg";

export default function ContactsToolbar() {
  const sortBy = useContactsStore((state) => state.sortBy);
  const owner = useContactsStore((state) => state.owner);
  const role = useContactsStore((state) => state.role);
  const company = useContactsStore((state) => state.company);
  const setSortBy = useContactsStore((state) => state.setSortBy);
  const setOwner = useContactsStore((state) => state.setOwner);
  const setRoleFilter = useContactsStore((state) => state.setRoleFilter);
  const setCompany = useContactsStore((state) => state.setCompany);
  const setNewContactOpen = useContactsStore(
    (state) => state.setNewContactOpen,
  );
  const companyOptions = useContactCompanyOptions();
  const companyById = useCompanyMap();
  const summaries = useContactSummaries();
  const visible = useVisibleContacts();

  function exportCsv() {
    downloadCsv(
      `contacts-${TODAY}.csv`,
      contactsCsvRows(
        visible,
        summaries,
        (companyId) => companyById.get(companyId)?.name ?? companyId,
      ),
    );
  }

  return (
    <div className="flex shrink-0 flex-wrap items-center justify-between gap-2 px-4 py-4">
      <MobileFilters className="sm:hidden" />

      <div className="hidden min-w-0 flex-wrap gap-2 sm:flex">
        <FilterMenu
          label="Sort by"
          value={sortBy}
          options={CONTACT_SORT_MENU_OPTIONS}
          onChange={(value) => setSortBy(value as ContactSortKey)}
        />
        <FilterMenu
          label="Owner"
          value={owner}
          options={CONTACT_OWNER_OPTIONS}
          onChange={setOwner}
        />
        <FilterMenu
          label="Role"
          value={role}
          options={CONTACT_ROLE_OPTIONS}
          onChange={setRoleFilter}
        />
        <FilterMenu
          label="Company"
          value={company}
          options={companyOptions}
          onChange={setCompany}
        />
      </div>

      <div className="flex shrink-0 items-center gap-1">
        <Button variant="secondary" size="sm" onClick={exportCsv}>
          <ShareIcon aria-hidden className="size-3" />
          Export
        </Button>
        <Button
          variant="primary"
          size="sm"
          onClick={() => setNewContactOpen(true)}
        >
          <PlusIcon aria-hidden className="size-3" />
          New Contact
        </Button>
      </div>
    </div>
  );
}
