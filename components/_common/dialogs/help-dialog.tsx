"use client";

import Button from "@/components/_ui/button";
import { Kbd } from "@/components/_ui/command";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/_ui/dialog";
import { HELP_SECTIONS, SHORTCUTS, SUPPORT_EMAIL } from "@/data/workspace";
import { useCompaniesStore } from "@/stores/companies-store";
import MailIcon from "@/public/assets/images/companies/detail/mail-04.svg";

export default function HelpDialog() {
  const open = useCompaniesStore((state) => state.appDialog === "help");
  const setAppDialog = useCompaniesStore((state) => state.setAppDialog);

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => setAppDialog(next ? "help" : null)}
    >
      <DialogContent className="max-w-[520px]">
        <DialogHeader>
          <DialogTitle>Help</DialogTitle>
          <DialogDescription>
            Quick answers, shortcuts and a way to reach us.
          </DialogDescription>
        </DialogHeader>

        {HELP_SECTIONS.map((section) => (
          <section
            key={section.title}
            className="flex flex-col gap-3 px-6 py-5 shadow-[inset_0_-1px_0_var(--line-strong)]"
          >
            <span className="eyebrow-style text-soft block">
              {section.title}
            </span>
            <ul className="flex flex-col gap-2">
              {section.topics.map((topic) => (
                <li key={topic.question}>
                  <details className="group border-line-strong rounded-lg border">
                    <summary className="lead-style flex cursor-pointer list-none items-center justify-between gap-3 rounded-lg px-3 py-2.5 transition-colors duration-150 hover:bg-white/4 [&::-webkit-details-marker]:hidden">
                      {topic.question}
                      <span
                        aria-hidden
                        className="text-subtle ease-power3-out transition-transform duration-200 group-open:rotate-45"
                      >
                        +
                      </span>
                    </summary>
                    <p className="text-soft px-3 pb-3">{topic.answer}</p>
                  </details>
                </li>
              ))}
            </ul>
          </section>
        ))}

        <section className="flex flex-col gap-3 px-6 py-5">
          <span className="eyebrow-style text-soft block">
            Keyboard shortcuts
          </span>
          <ul className="flex flex-col gap-2.5">
            {SHORTCUTS.map((shortcut) => (
              <li
                key={shortcut.label}
                className="lead-style flex items-center justify-between gap-3"
              >
                {shortcut.label}
                <span className="flex items-center gap-1">
                  {shortcut.keys.map((key) => (
                    <Kbd key={key}>{key}</Kbd>
                  ))}
                </span>
              </li>
            ))}
          </ul>
        </section>

        <DialogFooter className="justify-between">
          <Button
            variant="secondary"
            size="sm"
            href={`mailto:${SUPPORT_EMAIL}`}
          >
            <MailIcon aria-hidden className="size-3" />
            Email support
          </Button>
          <DialogClose asChild>
            <Button variant="subtle" size="sm">
              Close
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
