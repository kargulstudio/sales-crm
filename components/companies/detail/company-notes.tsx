"use client";

import { useState, type FormEvent, type KeyboardEvent } from "react";
import Avatar from "@/components/_ui/avatar";
import Button from "@/components/_ui/button";
import EmptyState from "@/components/_ui/empty-state";
import Kbd from "@/components/_ui/kbd";
import Tooltip from "@/components/_ui/tooltip";
import { profileByName } from "@/data/companies";
import { formatTimestamp, type Note } from "@/lib/activity";
import { useCompaniesStore } from "@/stores/companies-store";
import { toast } from "@/stores/toast-store";
import TrashIcon from "@/public/assets/images/companies/table/trash.svg";
import NoteIcon from "@/public/assets/images/companies/detail/note.svg";

const MOD =
  typeof navigator !== "undefined" && navigator.userAgent.includes("Mac")
    ? "⌘"
    : "Ctrl";

type CompanyNotesProps = {
  companyId: string;
  notes: Note[];
};

export default function CompanyNotes({ companyId, notes }: CompanyNotesProps) {
  const addNote = useCompaniesStore((state) => state.addNote);
  const deleteNote = useCompaniesStore((state) => state.deleteNote);
  const [body, setBody] = useState("");
  const sorted = [...notes].sort((a, b) => b.at.localeCompare(a.at));

  function submit(event?: FormEvent) {
    event?.preventDefault();
    const text = body.trim();
    if (!text) return;
    toast("Note added", addNote(companyId, text));
    setBody("");
  }

  function onKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && (event.metaKey || event.ctrlKey)) {
      event.preventDefault();
      submit();
    }
  }

  return (
    <div className="flex flex-col gap-5">
      <form onSubmit={submit} className="flex flex-col gap-2">
        <label htmlFor="note-body" className="sr-only">
          New note
        </label>
        <textarea
          id="note-body"
          value={body}
          onChange={(event) => setBody(event.target.value)}
          onKeyDown={onKeyDown}
          rows={3}
          placeholder="Write a note about this account…"
          className="border-input bg-secondary text-foreground duration-fast ease-power3-out placeholder:text-fg-tertiary focus-visible:border-selected focus-visible:ring-selected/20 field-sizing-content max-h-60 min-h-20 w-full resize-none rounded-lg border px-3 py-2.5 text-sm leading-snug transition-[border-color,box-shadow] outline-none focus-visible:ring-3"
        />
        <div className="flex items-center justify-end gap-3">
          <span className="caption-style text-fg-tertiary flex items-center gap-1 max-sm:hidden">
            <Kbd>{MOD}</Kbd>
            <Kbd>Enter</Kbd>
            to add
          </span>
          <Button
            type="submit"
            variant="primary"
            size="sm"
            disabled={!body.trim()}
          >
            Add note
          </Button>
        </div>
      </form>

      {sorted.length === 0 ? (
        <EmptyState
          icon={NoteIcon}
          title="No notes yet"
          description="Notes you add here stay with this account."
        />
      ) : (
        <ul className="flex flex-col gap-2">
          {sorted.map((note) => {
            const author = profileByName(note.author);
            const pending = note.id.startsWith("pending-");
            return (
              <li
                key={note.id}
                className="border-border group flex flex-col gap-2 rounded-lg border p-3"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="caption-style text-fg-secondary flex min-w-0 items-center gap-1.5">
                    <Avatar
                      src={author.avatar}
                      name={author.name}
                      alt=""
                      className="size-4"
                    />
                    <span className="truncate">{author.name}</span>
                    <span aria-hidden>·</span>
                    <time dateTime={note.at} className="shrink-0 tabular-nums">
                      {formatTimestamp(note.at)}
                    </time>
                  </span>
                  {!pending && (
                    <Tooltip content="Delete note">
                      <Button
                        variant="ghost"
                        size="icon-xs"
                        aria-label="Delete note"
                        onClick={() =>
                          toast("Note deleted", deleteNote(note.id))
                        }
                        className="-my-1 -mr-1"
                      >
                        <TrashIcon aria-hidden className="size-3" />
                      </Button>
                    </Tooltip>
                  )}
                </div>
                <p className="text-foreground text-sm leading-snug break-words whitespace-pre-wrap">
                  {note.body}
                </p>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
