"use client";
import { useEffect, useState } from "react";
import { useCompaniesStore } from "@/stores/companies-store";
import type { Company } from "@/data/companies";
import { api } from "@/lib/api";
import Button from "@/components/_ui/button";
import { formatMoney } from "@/lib/companies";
import type { EntityMap } from "@/lib/crm-types";
type RecordRow = EntityMap[keyof EntityMap] & { company_name: string };
const titles: Record<string, string> = {
  deals: "Opportunity pipeline",
  contacts: "Contacts",
  activities: "Company timeline",
  tasks: "Tasks & follow-ups",
  archived: "Archived companies",
};
export default function Overview({ view }: { view: string }) {
  const companies = useCompaniesStore((s) => s.companies);
  const revision = useCompaniesStore((s) => s.revision);
  const openDetail = useCompaniesStore((s) => s.openDetail);
  const refresh = useCompaniesStore((s) => s.refresh);
  const [rows, setRows] = useState<RecordRow[]>([]);
  const [archived, setArchived] = useState<Company[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const kind = {
    deals: "opportunities",
    contacts: "contacts",
    activities: "interactions",
    tasks: "tasks",
  }[view];
  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        if (view === "forecast") {
          if (active) setLoading(false);
          return;
        }
        const url =
          view === "archived"
            ? "companies?archived=true&limit=100"
            : "records/" + kind;
        const result = await api<{ items: RecordRow[] | Company[] }>(url);
        if (active) {
          if (view === "archived") setArchived(result.items as Company[]);
          else setRows(result.items as RecordRow[]);
          setPage(1);
          setHasMore(result.items.length === 100);
          setError("");
          setLoading(false);
        }
      } catch (e) {
        if (active) {
          setError(e instanceof Error ? e.message : "Unable to load");
          setLoading(false);
        }
      }
    };
    void load();
    return () => {
      active = false;
    };
  }, [view, kind, revision]);
  async function more() {
    try {
      const next = page + 1;
      const url =
        view === "archived"
          ? `companies?archived=true&limit=100&page=${next}`
          : `records/${kind}?page=${next}`;
      const result = await api<{ items: RecordRow[] | Company[] }>(url);
      if (view === "archived")
        setArchived((r) => [...r, ...(result.items as Company[])]);
      else setRows((r) => [...r, ...(result.items as RecordRow[])]);
      setPage(next);
      setHasMore(result.items.length === 100);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unable to load");
    }
  }
  if (view === "forecast") {
    const pipeline = companies.reduce((n, c) => n + c.pipelineValue, 0);
    const weighted = companies.reduce(
      (n, c) => n + (c.pipelineValue * c.winProbability) / 100,
      0,
    );
    return (
      <div className="overflow-auto p-5">
        <h2>Forecast</h2>
        <p className="text-soft mt-2">
          Expected revenue weighted by each company’s open opportunity
          probabilities.
        </p>
        <div className="my-5 grid gap-3 sm:grid-cols-3">
          {[
            ["Open pipeline", pipeline],
            ["Weighted forecast", weighted],
            ["Open deals", companies.reduce((n, c) => n + c.openDeals, 0)],
          ].map(([label, value]) => (
            <article
              key={label}
              className="bg-card border-line-strong rounded-lg border p-5"
            >
              <p className="text-soft">{label}</p>
              <p className="mt-3 text-2xl">
                {label === "Open deals" ? "" : "$"}
                {formatMoney(Number(value))}
              </p>
            </article>
          ))}
        </div>
        {companies.map((c) => (
          <button
            className="border-line-strong flex w-full justify-between gap-3 border-b p-3 text-left"
            key={c.id}
            onClick={() => openDetail(c.id)}
          >
            <span>{c.name}</span>
            <span>
              $
              {formatMoney(
                Math.round((c.pipelineValue * c.winProbability) / 100),
              )}
            </span>
          </button>
        ))}
      </div>
    );
  }
  return (
    <div className="min-h-0 overflow-auto p-5">
      <h2>{titles[view] || view}</h2>
      <p className="text-soft my-3">
        {view === "archived"
          ? "Restore a company to return it to your pipeline."
          : "Open a company to add or edit its records."}
      </p>
      {error && (
        <p role="alert" className="text-danger">
          {error}
        </p>
      )}
      {loading && <p role="status">Loading…</p>}
      {view === "archived"
        ? archived.map((c) => (
            <article
              key={c.id}
              className="border-line-strong flex justify-between border-b py-3"
            >
              <span>{c.name}</span>
              <Button
                variant="secondary"
                size="sm"
                onClick={async () => {
                  try {
                    await api(`companies/${c.id}`, "PATCH", {
                      archived: false,
                    });
                    await refresh();
                  } catch (e) {
                    setError(
                      e instanceof Error ? e.message : "Unable to restore",
                    );
                  }
                }}
              >
                Restore
              </Button>
            </article>
          ))
        : rows.map((r) => (
            <button
              key={r.id}
              onClick={() => openDetail(r.company_id)}
              className="border-line-strong bg-card hover:bg-muted my-2 flex w-full flex-col gap-2 rounded-lg border p-4 text-left"
            >
              <span className="font-medium">
                {"full_name" in r
                  ? r.full_name
                  : "subject" in r
                    ? r.subject
                    : "title" in r
                      ? r.title
                      : r.name}
              </span>
              <span className="text-soft caption-style">
                {r.company_name}
                {"email" in r && ` · ${r.email} · ${r.role}`}
                {"value" in r &&
                  ` · $${formatMoney(r.value)} · ${r.stage} · ${r.status} · ${r.probability}%`}
                {"due_at" in r &&
                  ` · ${r.completed_at ? "Completed" : r.due_at ? new Date(r.due_at).toLocaleString() : "No due date"} · ${r.priority}`}
                {"occurred_at" in r &&
                  ` · ${r.type} · ${new Date(r.occurred_at).toLocaleString()}`}
              </span>
            </button>
          ))}
      {!loading &&
        !error &&
        (view === "archived" ? archived : rows).length === 0 && (
          <p className="text-subtle py-8">No records yet.</p>
        )}
      {hasMore && (
        <Button variant="secondary" size="sm" onClick={more}>
          Load more
        </Button>
      )}
    </div>
  );
}
