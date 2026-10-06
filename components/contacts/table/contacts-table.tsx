"use client";

import { useEffect, useMemo } from "react";
import { Checkbox } from "@/components/_ui/checkbox";
import { ScrollArea } from "@/components/_ui/scroll-area";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/_ui/table";
import ContactRow from "./contact-row";
import ContactsFooter from "./table-footer";
import {
  TABLE_CELL_CLASS,
  TABLE_COLUMNS,
  TABLE_GRID_CLASS,
  TABLE_ROW_CLASS,
} from "./table-columns";
import { contactSummaryFor } from "@/lib/contacts";
import { cn } from "@/lib/utils";
import { useCompanyMap } from "@/stores/companies-store";
import {
  useContactSummaries,
  useContactsStore,
  useVisibleContacts,
} from "@/stores/contacts-store";

export default function ContactsTable() {
  const visible = useVisibleContacts();
  const summaries = useContactSummaries();
  const companyById = useCompanyMap();
  const selectedIds = useContactsStore((state) => state.selectedIds);
  const detailId = useContactsStore((state) => state.detailId);
  const detailOpen = useContactsStore((state) => state.detailOpen);
  const toggleSelected = useContactsStore((state) => state.toggleSelected);
  const setSelected = useContactsStore((state) => state.setSelected);
  const openDetail = useContactsStore((state) => state.openDetail);

  const selectedSet = useMemo(() => new Set(selectedIds), [selectedIds]);

  useEffect(() => {
    const visibleIds = new Set(visible.map((contact) => contact.id));
    const kept = selectedIds.filter((id) => visibleIds.has(id));
    if (kept.length !== selectedIds.length) setSelected(kept);
  }, [visible, selectedIds, setSelected]);

  const selectedVisible = visible.filter((contact) =>
    selectedSet.has(contact.id),
  );
  const allSelected =
    visible.length > 0 && selectedVisible.length === visible.length;
  const someSelected = selectedVisible.length > 0 && !allSelected;

  function toggleAll() {
    setSelected(allSelected ? [] : visible.map((contact) => contact.id));
  }

  return (
    <div className="border-border flex min-h-0 flex-1 flex-col border-t">
      <ScrollArea orientation="both" className="min-h-0 flex-1">
        <Table role="table" className={cn(TABLE_GRID_CLASS, "w-full")}>
          <TableHeader role="rowgroup" className="contents">
            <TableRow
              role="row"
              className={cn(TABLE_ROW_CLASS, "bg-background sticky top-0 z-10")}
            >
              {TABLE_COLUMNS.map((column) => (
                <TableHead
                  key={column.key}
                  role="columnheader"
                  className={cn(TABLE_CELL_CLASS, column.className)}
                >
                  {column.key === "name" ? (
                    <span className="flex items-center gap-5">
                      <Checkbox
                        checked={
                          allSelected
                            ? true
                            : someSelected
                              ? "indeterminate"
                              : false
                        }
                        onCheckedChange={toggleAll}
                        aria-label="Select all contacts"
                      />
                      {column.label}
                    </span>
                  ) : (
                    column.label
                  )}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody role="rowgroup" className="contents">
            {visible.map((contact) => (
              <ContactRow
                key={contact.id}
                contact={contact}
                company={companyById.get(contact.companyId)}
                summary={contactSummaryFor(summaries, contact.id)}
                selected={selectedSet.has(contact.id)}
                active={detailOpen && detailId === contact.id}
                onToggle={() => toggleSelected(contact.id)}
                onOpen={() => openDetail(contact.id)}
              />
            ))}
            {visible.length === 0 && (
              <TableRow role="row" className={TABLE_ROW_CLASS}>
                <td
                  role="cell"
                  className="caption-style text-muted-foreground col-span-full flex h-[120px] items-center justify-center"
                >
                  No contacts match the current filters.
                </td>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </ScrollArea>
      <ContactsFooter contacts={visible} summaries={summaries} />
    </div>
  );
}
