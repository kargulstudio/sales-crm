"use client";

import { AnimatePresence, motion } from "motion/react";
import Avatar from "@/components/_ui/avatar";
import Button from "@/components/_ui/button";
import Tooltip from "@/components/_ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/_ui/dropdown-menu";
import { OWNERS } from "@/data/companies";
import { TODAY, companiesCsvRows } from "@/lib/companies";
import { downloadCsv } from "@/lib/csv";
import { useCompaniesStore } from "@/stores/companies-store";
import { toast } from "@/stores/toast-store";
import UsersIcon from "@/public/assets/images/companies/sidebar/users.svg";
import ShareIcon from "@/public/assets/images/companies/toolbar/share.svg";
import TrashIcon from "@/public/assets/images/companies/table/trash.svg";
import XIcon from "@/public/assets/images/companies/detail/x.svg";

function plural(count: number) {
  return `${count} ${count === 1 ? "company" : "companies"}`;
}

export default function BulkActions({ visibleIds }: { visibleIds: string[] }) {
  const companies = useCompaniesStore((state) => state.companies);
  const allSelectedIds = useCompaniesStore((state) => state.selectedIds);
  const selectedIds = allSelectedIds.filter((id) => visibleIds.includes(id));
  const setSelected = useCompaniesStore((state) => state.setSelected);
  const assignOwner = useCompaniesStore((state) => state.assignOwner);
  const deleteCompanies = useCompaniesStore((state) => state.deleteCompanies);

  const count = selectedIds.length;

  function exportSelected() {
    const selected = companies.filter((company) =>
      selectedIds.includes(company.id),
    );
    downloadCsv(`companies-selected-${TODAY}.csv`, companiesCsvRows(selected));
    toast(`Exported ${plural(selected.length)}`);
  }

  function handleAssign(owner: string) {
    const ids = selectedIds;
    toast(
      `Assigned ${plural(ids.length)} to ${owner}`,
      assignOwner(ids, owner),
    );
  }

  function handleDelete() {
    const ids = selectedIds;
    const undo = deleteCompanies(ids);
    toast(`Deleted ${plural(ids.length)}`, () => {
      undo();
      setSelected([
        ...new Set([...useCompaniesStore.getState().selectedIds, ...ids]),
      ]);
    });
  }

  return (
    <AnimatePresence initial={false}>
      {count > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 8 }}
          transition={{ type: "spring", duration: 0.3, bounce: 0 }}
          className="z-floating pointer-events-none absolute inset-x-0 bottom-3 flex justify-center px-3"
        >
          <div
            role="toolbar"
            aria-label="Bulk actions"
            className="bg-popover border-line-strong shadow-overlay pointer-events-auto flex items-center gap-0.5 rounded-full border p-1 pl-3.5"
          >
            <span
              aria-live="polite"
              className="caption-style text-foreground pr-2 whitespace-nowrap tabular-nums"
            >
              {count} selected
            </span>
            <span aria-hidden className="bg-line-strong mr-1 h-4 w-px" />

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  aria-label="Assign owner"
                  className="text-fg-secondary data-[state=open]:text-foreground data-[state=open]:bg-overlay-2"
                >
                  <UsersIcon aria-hidden className="size-3" />
                  <span className="max-sm:sr-only">Assign</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent side="top" align="center" sideOffset={10}>
                <DropdownMenuLabel>Assign to</DropdownMenuLabel>
                {OWNERS.map((owner) => (
                  <DropdownMenuItem
                    key={owner.name}
                    onSelect={() => handleAssign(owner.name)}
                  >
                    <Avatar src={owner.avatar} alt="" className="size-4" />
                    {owner.name}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <Button
              variant="ghost"
              size="sm"
              aria-label="Export selected"
              className="text-fg-secondary"
              onClick={exportSelected}
            >
              <ShareIcon aria-hidden className="size-3" />
              <span className="max-sm:sr-only">Export</span>
            </Button>

            <Button
              variant="ghost"
              size="sm"
              aria-label="Delete"
              className="text-fg-secondary hover:text-danger"
              onClick={handleDelete}
            >
              <TrashIcon aria-hidden className="size-3" />
              <span className="max-sm:sr-only">Delete</span>
            </Button>

            <Tooltip content="Clear selection" side="top">
              <Button
                variant="ghost"
                size="icon-sm"
                aria-label="Clear selection"
                className="text-fg-secondary ml-0.5"
                onClick={() => setSelected([])}
              >
                <XIcon aria-hidden className="size-3.5" />
              </Button>
            </Tooltip>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
