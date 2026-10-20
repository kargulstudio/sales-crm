"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/_ui/dialog";
import Kbd from "@/components/_ui/kbd";
import { useCompaniesStore } from "@/stores/companies-store";

const MOD =
  typeof navigator !== "undefined" && navigator.userAgent.includes("Mac")
    ? "⌘"
    : "Ctrl";

const GROUPS = [
  {
    title: "Table",
    items: [
      { keys: ["J", "↓"], label: "Next row" },
      { keys: ["K", "↑"], label: "Previous row" },
      { keys: ["X"], label: "Select row" },
      { keys: ["↵"], label: "Open details" },
      { keys: ["Esc"], label: "Clear selection" },
    ],
  },
  {
    title: "General",
    items: [
      { keys: ["/"], label: "Search" },
      { keys: [MOD, "K"], label: "Search" },
      { keys: [MOD, "Z"], label: "Undo last action" },
      { keys: ["?"], label: "Show shortcuts" },
    ],
  },
];

export default function ShortcutsDialog() {
  const open = useCompaniesStore((state) => state.shortcutsOpen);
  const setOpen = useCompaniesStore((state) => state.setShortcutsOpen);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Keyboard shortcuts</DialogTitle>
          <DialogDescription>
            Move through the pipeline faster.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-5 px-6 py-5">
          {GROUPS.map((group) => (
            <section key={group.title} className="flex flex-col gap-2">
              <h3 className="eyebrow-style text-fg-tertiary">{group.title}</h3>
              <ul className="flex flex-col">
                {group.items.map((item) => (
                  <li
                    key={`${item.label}-${item.keys.join("")}`}
                    className="flex h-8 items-center justify-between gap-4"
                  >
                    <span className="lead-style text-fg-secondary">
                      {item.label}
                    </span>
                    <span className="flex items-center gap-1">
                      {item.keys.map((key) => (
                        <Kbd key={key}>{key}</Kbd>
                      ))}
                    </span>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
