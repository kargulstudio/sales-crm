"use client";

import { useEffect, useState, type RefObject } from "react";

type Options = {
  ids: string[];
  tableRef: RefObject<HTMLElement | null>;
  hasSelection: boolean;
  onOpen: (id: string) => void;
  onToggle: (id: string) => void;
  onClearSelection: () => void;
  onSearch: () => void;
  onHelp: () => void;
};

const OVERLAY_SELECTOR =
  "[role=dialog], [role=menu], [role=listbox], [data-slot=popover-content]";

function isEditable(target: EventTarget | null) {
  return (
    target instanceof HTMLElement &&
    (target.isContentEditable ||
      ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName))
  );
}

export function useTableKeyboard({
  ids,
  tableRef,
  hasSelection,
  onOpen,
  onToggle,
  onClearSelection,
  onSearch,
  onHelp,
}: Options) {
  const [cursor, setCursor] = useState<number | null>(null);
  const current = cursor !== null && cursor < ids.length ? cursor : null;

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.metaKey || event.ctrlKey || event.altKey) return;
      if (
        isEditable(event.target) ||
        document.querySelector(OVERLAY_SELECTOR)
      ) {
        return;
      }

      const insideTable = tableRef.current?.contains(document.activeElement);
      const move = (delta: number) => {
        if (ids.length === 0) return;
        event.preventDefault();
        setCursor(
          current === null
            ? 0
            : Math.min(ids.length - 1, Math.max(0, current + delta)),
        );
      };

      switch (event.key) {
        case "j":
          return move(1);
        case "k":
          return move(-1);
        case "ArrowDown":
          if (current !== null || insideTable) move(1);
          return;
        case "ArrowUp":
          if (current !== null || insideTable) move(-1);
          return;
        case "x":
          if (current === null) return;
          event.preventDefault();
          return onToggle(ids[current]);
        case "Enter":
        case "o":
          if (
            current === null ||
            (event.key === "Enter" &&
              !(document.activeElement as HTMLElement | null)?.dataset.rowIndex)
          ) {
            return;
          }
          event.preventDefault();
          return onOpen(ids[current]);
        case "Escape":
          if (hasSelection) return onClearSelection();
          if (current !== null) {
            setCursor(null);
            (document.activeElement as HTMLElement | null)?.blur();
          }
          return;
        case "/":
          event.preventDefault();
          return onSearch();
        case "?":
          event.preventDefault();
          return onHelp();
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    ids,
    current,
    tableRef,
    hasSelection,
    onOpen,
    onToggle,
    onClearSelection,
    onSearch,
    onHelp,
  ]);

  useEffect(() => {
    if (current === null) return;
    // The desktop table and the mobile card list both render; pick the visible one.
    const row = [
      ...(tableRef.current?.querySelectorAll<HTMLElement>(
        `[data-row-index="${current}"]`,
      ) ?? []),
    ].find((element) => element.offsetParent !== null);
    row?.focus({ preventScroll: true });
    row?.scrollIntoView({ block: "nearest" });
  }, [current, tableRef]);

  return [current, setCursor] as const;
}
