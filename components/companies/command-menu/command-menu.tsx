"use client";

import { useEffect, useRef, useState } from "react";
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandFooter,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/_ui/command";
import Kbd from "@/components/_ui/kbd";
import { CommandCompanyRow, CommandTableHeader } from "./command-table";
import { useCompaniesStore } from "@/stores/companies-store";
import PlusIcon from "@/public/assets/images/_common/plus.svg";

function matchWords(value: string, search: string, keywords?: string[]) {
  const haystack = [value, ...(keywords ?? [])].join(" ").toLowerCase();
  const words = search.toLowerCase().trim().split(/\s+/);
  return words.every((word) => haystack.includes(word)) ? 1 : 0;
}

export default function CommandMenu() {
  const open = useCompaniesStore((state) => state.searchOpen);
  const setOpen = useCompaniesStore((state) => state.setSearchOpen);
  const companies = useCompaniesStore((state) => state.companies);
  const openDetail = useCompaniesStore((state) => state.openDetail);
  const setShortcutsOpen = useCompaniesStore((state) => state.setShortcutsOpen);
  const setNewCompanyOpen = useCompaniesStore(
    (state) => state.setNewCompanyOpen,
  );
  const [query, setQuery] = useState("");
  const actionRan = useRef(false);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key.toLowerCase() !== "k") return;
      if (!(event.metaKey || event.ctrlKey) || event.altKey || event.shiftKey) {
        return;
      }
      event.preventDefault();
      const { searchOpen, setSearchOpen } = useCompaniesStore.getState();
      setSearchOpen(!searchOpen);
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  function run(action: () => void) {
    actionRan.current = true;
    setOpen(false);
    action();
  }

  return (
    <CommandDialog
      open={open}
      onOpenChange={setOpen}
      title="Search"
      description="Search companies by name, owner, segment or stage"
      className="max-w-240"
      onCloseAutoFocus={(event) => {
        if (actionRan.current) event.preventDefault();
        actionRan.current = false;
        setQuery("");
      }}
    >
      <Command filter={matchWords}>
        <CommandInput
          value={query}
          onValueChange={setQuery}
          placeholder="Search companies, owners…"
          trailing={<Kbd className="pointer-coarse:hidden">Esc</Kbd>}
        />
        <CommandTableHeader />
        <CommandList>
          <CommandEmpty>No results for “{query}”</CommandEmpty>
          <CommandGroup>
            {companies.map((company) => (
              <CommandCompanyRow
                key={company.id}
                company={company}
                onSelect={() => run(() => openDetail(company.id))}
              />
            ))}
          </CommandGroup>
          <CommandSeparator />
          <CommandGroup heading="Actions">
            <CommandItem
              value="new-company"
              keywords={["New Company", "Add", "Create"]}
              onSelect={() => run(() => setNewCompanyOpen(true))}
            >
              <span className="bg-muted shadow-hairline flex size-6 shrink-0 items-center justify-center rounded-md">
                <PlusIcon aria-hidden className="text-fg-secondary size-3" />
              </span>
              New Company
            </CommandItem>
            <CommandItem
              value="keyboard-shortcuts"
              keywords={["Keyboard shortcuts", "Help", "Hotkeys"]}
              onSelect={() => run(() => setShortcutsOpen(true))}
            >
              <span className="bg-muted shadow-hairline flex size-6 shrink-0 items-center justify-center rounded-md">
                <Kbd className="h-4 min-w-4 border-0 bg-transparent px-0">
                  ?
                </Kbd>
              </span>
              Keyboard shortcuts
            </CommandItem>
          </CommandGroup>
        </CommandList>
        <CommandFooter className="pointer-coarse:hidden">
          <span className="flex items-center gap-1.5">
            <Kbd>↑</Kbd>
            <Kbd>↓</Kbd>
            Navigate
          </span>
          <span className="flex items-center gap-1.5">
            <Kbd>↵</Kbd>
            Open
          </span>
        </CommandFooter>
      </Command>
    </CommandDialog>
  );
}
