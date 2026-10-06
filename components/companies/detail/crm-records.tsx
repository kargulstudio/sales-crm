"use client";
import { useEffect, useState } from "react";
import Button from "@/components/_ui/button";
import { Input } from "@/components/_ui/input";
import Field from "@/components/_ui/field";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/_ui/dialog";
import DetailSection from "./detail-section";
import { api } from "@/lib/api";
import type { CompanyDetail, EntityKind, EntityMap } from "@/lib/crm-types";
import { useCompaniesStore } from "@/stores/companies-store";
import { formatMoney } from "@/lib/companies";

type FieldDef = {
  key: string;
  label: string;
  type?: string;
  required?: boolean;
  options?: string[];
};
const definitions: Record<EntityKind, FieldDef[]> = {
  contacts: [
    { key: "full_name", label: "Full name", required: true },
    { key: "first_name", label: "First name" },
    { key: "last_name", label: "Last name" },
    { key: "email", label: "Email", type: "email" },
    { key: "phone", label: "Phone" },
    { key: "role", label: "Role" },
    { key: "linkedin_url", label: "LinkedIn URL", type: "url" },
    { key: "x_url", label: "X URL", type: "url" },
    { key: "notes", label: "Notes", type: "textarea" },
  ],
  interactions: [
    {
      key: "type",
      label: "Type",
      options: [
        "email",
        "call",
        "linkedin",
        "x",
        "meeting",
        "note",
        "demo",
        "follow-up",
        "other",
      ],
    },
    { key: "subject", label: "Subject", required: true },
    { key: "content", label: "Content", type: "textarea" },
    {
      key: "occurred_at",
      label: "Occurred at",
      type: "datetime-local",
      required: true,
    },
  ],
  tasks: [
    { key: "title", label: "Task", required: true },
    { key: "description", label: "Description", type: "textarea" },
    { key: "due_at", label: "Due at", type: "datetime-local" },
    { key: "priority", label: "Priority", options: ["low", "medium", "high"] },
  ],
  opportunities: [
    { key: "name", label: "Opportunity name", required: true },
    {
      key: "stage",
      label: "Stage",
      options: ["Discovery", "Evaluation", "Procurement"],
    },
    { key: "value", label: "Value ($)", type: "number", required: true },
    {
      key: "probability",
      label: "Probability (%)",
      type: "number",
      required: true,
    },
    { key: "expected_close_date", label: "Expected close date", type: "date" },
    { key: "status", label: "Status", options: ["open", "won", "lost"] },
  ],
};
const labels: Record<EntityKind, string> = {
  contacts: "contact",
  interactions: "interaction",
  tasks: "task",
  opportunities: "opportunity",
};
function localTime(value: string) {
  const date = new Date(value);
  return new Date(date.getTime() - date.getTimezoneOffset() * 60000)
    .toISOString()
    .slice(0, 16);
}
export default function CrmRecords({ companyId }: { companyId: string }) {
  const revision = useCompaniesStore((s) => s.revision);
  const refresh = useCompaniesStore((s) => s.refresh);
  const [detail, setDetail] = useState<CompanyDetail | null>(null);
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const [editor, setEditor] = useState<{
    kind: EntityKind;
    record?: EntityMap[EntityKind];
  } | null>(null);
  const [contactFilter, setContactFilter] = useState("");
  const [more, setMore] = useState<Partial<Record<EntityKind, number>>>({});
  useEffect(() => {
    let active = true;
    api<CompanyDetail>(`companies/${companyId}`)
      .then((d) => {
        if (active) {
          setDetail(d);
          setMore({});
          setError("");
        }
      })
      .catch((e) => {
        if (active) setError(e.message);
      });
    return () => {
      active = false;
    };
  }, [companyId, revision]);
  async function act(work: () => Promise<unknown>) {
    setPending(true);
    setError("");
    try {
      await work();
      await refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unable to save");
    } finally {
      setPending(false);
    }
  }
  async function loadMore(kind: EntityKind) {
    const page = (more[kind] || 1) + 1;
    try {
      const records = await api<EntityMap[typeof kind][]>(
        `companies/${companyId}/${kind}?page=${page}`,
      );
      setDetail((d) => (d ? { ...d, [kind]: [...d[kind], ...records] } : d));
      setMore((s) => ({ ...s, [kind]: page }));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unable to load");
    }
  }
  if (!detail)
    return (
      <DetailSection title="Records">
        <p role="status">{error || "Loading records…"}</p>
      </DetailSection>
    );
  const edit = (kind: EntityKind, record: EntityMap[EntityKind]) =>
    setEditor({ kind, record });
  const remove = (kind: EntityKind, id: string) => {
    if (window.confirm(`Delete this ${labels[kind]}?`))
      void act(() => api(`companies/${companyId}/${kind}/${id}`, "DELETE"));
  };
  const actions = (kind: EntityKind, record: EntityMap[EntityKind]) => (
    <span className="flex gap-1">
      <Button
        variant="ghost"
        size="sm"
        disabled={pending}
        onClick={() => edit(kind, record)}
      >
        Edit
      </Button>
      <Button
        variant="ghost"
        size="sm"
        disabled={pending}
        onClick={() => remove(kind, record.id)}
      >
        Delete
      </Button>
    </span>
  );
  const add = (kind: EntityKind) => (
    <Button
      size="sm"
      variant="secondary"
      disabled={!!detail.company.archivedAt}
      onClick={() => setEditor({ kind })}
    >
      Add {labels[kind]}
    </Button>
  );
  const contactName = (id: string | null) =>
    detail.contacts.find((c) => c.id === id)?.full_name;
  const loadButton = (kind: EntityKind) =>
    detail[kind].length > 0 && detail[kind].length % 100 === 0 ? (
      <Button variant="ghost" size="sm" onClick={() => loadMore(kind)}>
        Load more {kind}
      </Button>
    ) : null;
  return (
    <>
      {error && (
        <p role="alert" className="text-danger px-5 py-3">
          {error}
        </p>
      )}
      <DetailSection title="Contacts" action={add("contacts")}>
        {detail.contacts.length === 0 && (
          <p className="text-subtle">Add your first contact.</p>
        )}
        {detail.contacts.map((c) => (
          <article
            key={c.id}
            className="border-line-strong flex flex-col gap-2 rounded-lg border p-3"
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <h3>{c.full_name}</h3>
                <p className="text-soft">{c.role}</p>
              </div>
              {actions("contacts", c)}
            </div>
            <div className="text-soft flex flex-wrap gap-3">
              {c.email && <a href={`mailto:${c.email}`}>{c.email}</a>}
              {c.phone && (
                <a href={`tel:${c.phone.replace(/[^\d+]/g, "")}`}>{c.phone}</a>
              )}
              {c.linkedin_url && (
                <a
                  href={c.linkedin_url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  LinkedIn
                </a>
              )}
              {c.x_url && (
                <a href={c.x_url} target="_blank" rel="noopener noreferrer">
                  X
                </a>
              )}
            </div>
            {c.notes && (
              <p className="break-words whitespace-pre-wrap">{c.notes}</p>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setContactFilter(c.id)}
            >
              View timeline
            </Button>
          </article>
        ))}
        {loadButton("contacts")}
      </DetailSection>
      <DetailSection title="Tasks & follow-ups" action={add("tasks")}>
        {detail.tasks.length === 0 && (
          <p className="text-subtle">
            Create a follow-up with a date and contact.
          </p>
        )}
        {detail.tasks.map((t) => (
          <article
            key={t.id}
            className="border-line-strong flex flex-col gap-2 rounded-lg border p-3"
          >
            <div className="flex items-start justify-between gap-2">
              <label className="flex items-start gap-2">
                <input
                  type="checkbox"
                  checked={!!t.completed_at}
                  disabled={pending}
                  onChange={() =>
                    void act(() =>
                      api(`companies/${companyId}/tasks/${t.id}`, "PATCH", {
                        completed_at: t.completed_at
                          ? null
                          : new Date().toISOString(),
                      }),
                    )
                  }
                  aria-label={`Complete ${t.title}`}
                />
                <span
                  className={t.completed_at ? "text-subtle line-through" : ""}
                >
                  {t.title}
                </span>
              </label>
              {actions("tasks", t)}
            </div>
            <p className="caption-style text-soft">
              {t.priority} priority ·{" "}
              {t.due_at ? new Date(t.due_at).toLocaleString() : "No due date"}
              {contactName(t.contact_id) && ` · ${contactName(t.contact_id)}`}
            </p>
            {t.description && (
              <p className="break-words whitespace-pre-wrap">{t.description}</p>
            )}
          </article>
        ))}
        {loadButton("tasks")}
      </DetailSection>
      <DetailSection title="Opportunities" action={add("opportunities")}>
        {detail.opportunities.length === 0 && (
          <p className="text-subtle">
            Add an opportunity to build this company’s pipeline.
          </p>
        )}
        {detail.opportunities.map((o) => (
          <article
            key={o.id}
            className="border-line-strong flex flex-col gap-2 rounded-lg border p-3"
          >
            <div className="flex items-start justify-between gap-2">
              <h3>{o.name}</h3>
              {actions("opportunities", o)}
            </div>
            <p>
              ${formatMoney(o.value)} · {o.probability}% · {o.stage} ·{" "}
              {o.status}
            </p>
            {o.expected_close_date && (
              <p className="text-soft">
                Expected close {o.expected_close_date}
              </p>
            )}
          </article>
        ))}
        {loadButton("opportunities")}
      </DetailSection>
      <DetailSection title="Timeline" action={add("interactions")}>
        <label className="caption-style text-soft">
          Contact
          <select
            className="crm-select mt-2"
            aria-label="Timeline contact"
            value={contactFilter}
            onChange={(e) => setContactFilter(e.target.value)}
          >
            <option value="">All contacts</option>
            {detail.contacts.map((c) => (
              <option key={c.id} value={c.id}>
                {c.full_name}
              </option>
            ))}
          </select>
        </label>
        {detail.interactions
          .filter((i) => !contactFilter || i.contact_id === contactFilter)
          .map((i) => (
            <article
              key={i.id}
              className="border-line-strong flex flex-col gap-2 rounded-lg border p-3"
            >
              <div className="flex items-start justify-between gap-2">
                <h3>{i.subject}</h3>
                {actions("interactions", i)}
              </div>
              <p className="caption-style text-soft">
                {i.type} · {new Date(i.occurred_at).toLocaleString()}
                {contactName(i.contact_id) && ` · ${contactName(i.contact_id)}`}
              </p>
              <p className="break-words whitespace-pre-wrap">{i.content}</p>
            </article>
          ))}
        {detail.interactions.length === 0 && (
          <p className="text-subtle">Log a call, email, meeting or note.</p>
        )}
        {loadButton("interactions")}
      </DetailSection>
      {editor && (
        <RecordEditor
          key={`${editor.kind}-${editor.record?.id || "new"}`}
          companyId={companyId}
          kind={editor.kind}
          record={editor.record}
          contacts={detail.contacts}
          onClose={() => setEditor(null)}
          onSaved={refresh}
        />
      )}
    </>
  );
}
function RecordEditor({
  companyId,
  kind,
  record,
  contacts,
  onClose,
  onSaved,
}: {
  companyId: string;
  kind: EntityKind;
  record?: EntityMap[EntityKind];
  contacts: CompanyDetail["contacts"];
  onClose: () => void;
  onSaved: () => Promise<void>;
}) {
  const source = record as unknown as
    | Record<string, string | number | null>
    | undefined;
  const [values, setValues] = useState<Record<string, string>>(() =>
    Object.fromEntries([
      ...definitions[kind].map((f) => [
        f.key,
        source?.[f.key]
          ? f.type === "datetime-local"
            ? localTime(String(source[f.key]))
            : String(source[f.key])
          : f.key === "occurred_at"
            ? localTime(new Date().toISOString())
            : f.key === "priority"
              ? "medium"
              : f.type === "number"
                ? "0"
                : f.options?.[0] || "",
      ]),
      ["contact_id", String(source?.contact_id || "")],
    ]),
  );
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  async function save(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    setError("");
    try {
      const body: Record<string, unknown> = {};
      for (const f of definitions[kind]) {
        const v = values[f.key];
        body[f.key] =
          f.type === "number"
            ? Number(v)
            : f.type === "datetime-local"
              ? v
                ? new Date(v).toISOString()
                : null
              : f.type === "date"
                ? v || null
                : v;
      }
      if (kind === "tasks" || kind === "interactions")
        body.contact_id = values.contact_id || null;
      await api(
        `companies/${companyId}/${kind}${record ? `/${record.id}` : ""}`,
        record ? "PATCH" : "POST",
        body,
      );
      await onSaved();
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unable to save");
    } finally {
      setSaving(false);
    }
  }
  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open && !saving) onClose();
      }}
    >
      <DialogContent className="max-w-[560px]">
        <form onSubmit={save}>
          <DialogHeader>
            <DialogTitle>
              {record ? "Edit" : "Add"} {labels[kind]}
            </DialogTitle>
            <DialogDescription>
              Saved to this company’s records.
            </DialogDescription>
          </DialogHeader>
          <div className="flex max-h-[65dvh] flex-col gap-4 overflow-y-auto p-5">
            {definitions[kind].map((f) => (
              <Field
                key={f.key}
                label={f.label}
                htmlFor={`record-${f.key}`}
                required={f.required}
              >
                {f.options ? (
                  <select
                    className="crm-select"
                    id={`record-${f.key}`}
                    value={values[f.key]}
                    onChange={(e) =>
                      setValues((v) => ({ ...v, [f.key]: e.target.value }))
                    }
                  >
                    {f.options.map((v) => (
                      <option key={v}>{v}</option>
                    ))}
                  </select>
                ) : f.type === "textarea" ? (
                  <textarea
                    className="crm-select min-h-24"
                    id={`record-${f.key}`}
                    value={values[f.key]}
                    onChange={(e) =>
                      setValues((v) => ({ ...v, [f.key]: e.target.value }))
                    }
                  />
                ) : (
                  <Input
                    id={`record-${f.key}`}
                    type={f.type || "text"}
                    required={f.required}
                    value={values[f.key]}
                    min={f.type === "number" ? 0 : undefined}
                    max={f.key === "probability" ? 100 : undefined}
                    step={f.type === "number" ? "any" : undefined}
                    onChange={(e) =>
                      setValues((v) => ({ ...v, [f.key]: e.target.value }))
                    }
                  />
                )}
              </Field>
            ))}
            {(kind === "tasks" || kind === "interactions") && (
              <Field label="Contact (optional)" htmlFor="record-contact">
                <select
                  id="record-contact"
                  className="crm-select"
                  value={values.contact_id}
                  onChange={(e) =>
                    setValues((v) => ({ ...v, contact_id: e.target.value }))
                  }
                >
                  <option value="">Company only</option>
                  {contacts.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.full_name}
                    </option>
                  ))}
                </select>
              </Field>
            )}
            {error && (
              <p role="alert" className="text-danger">
                {error}
              </p>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="subtle"
              size="sm"
              disabled={saving}
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit" disabled={saving}>
              {saving ? "Saving…" : "Save"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
