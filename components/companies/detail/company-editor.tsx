"use client";
import { useState } from "react";
import type { Company } from "@/data/companies";
import { SEGMENTS, STAGES } from "@/data/companies";
import Field from "@/components/_ui/field";
import { Input } from "@/components/_ui/input";
import Button from "@/components/_ui/button";
import LogoUpload from "../new-company/logo-upload";
import { api } from "@/lib/api";
import { useCompaniesStore } from "@/stores/companies-store";
export default function CompanyEditor({ company }: { company: Company }) {
  const owners = useCompaniesStore((s) => s.owners);
  const refresh = useCompaniesStore((s) => s.refresh);
  const close = useCompaniesStore((s) => s.closeDetail);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [logo, setLogo] = useState(company.logo || null);
  async function save(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    setSaving(true);
    setError("");
    try {
      await api(`companies/${company.id}`, "PATCH", {
        name: data.get("name"),
        website: data.get("website"),
        description: data.get("description"),
        industry: data.get("industry"),
        segment: data.get("segment"),
        stage: data.get("stage"),
        owner_id: data.get("owner_id"),
        logo_url: logo,
        tags: String(data.get("tags"))
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
      });
      await refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unable to save");
    } finally {
      setSaving(false);
    }
  }
  async function archive() {
    if (
      !window.confirm(
        `Archive ${company.name}? You can restore it from Archived companies.`,
      )
    )
      return;
    setSaving(true);
    try {
      await api(`companies/${company.id}`, "DELETE");
      close();
      await refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unable to archive");
    } finally {
      setSaving(false);
    }
  }
  return (
    <form id="company-edit" onSubmit={save} className="flex flex-col gap-4">
      <LogoUpload value={logo} onChange={setLogo} companyName={company.name} />
      <Field label="Company name" htmlFor="edit-name">
        <Input
          id="edit-name"
          name="name"
          defaultValue={company.name}
          required
        />
      </Field>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Website" htmlFor="edit-website">
          <Input
            id="edit-website"
            name="website"
            type="url"
            defaultValue={company.website}
          />
        </Field>
        <Field label="Industry" htmlFor="edit-industry">
          <Input
            id="edit-industry"
            name="industry"
            defaultValue={company.industry}
          />
        </Field>
      </div>
      <Field label="Description" htmlFor="edit-description">
        <textarea
          className="crm-select min-h-20"
          id="edit-description"
          name="description"
          defaultValue={company.description}
        />
      </Field>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Segment" htmlFor="edit-segment">
          <select
            className="crm-select"
            id="edit-segment"
            name="segment"
            defaultValue={company.segment}
          >
            {[...new Set([...SEGMENTS, company.segment || "SMB"])].map((v) => (
              <option key={v}>{v}</option>
            ))}
          </select>
        </Field>
        <Field label="Stage" htmlFor="edit-stage">
          <select
            className="crm-select"
            id="edit-stage"
            name="stage"
            defaultValue={company.stage}
          >
            {[...new Set([...STAGES, company.stage || "New Logo"])].map((v) => (
              <option key={v}>{v}</option>
            ))}
          </select>
        </Field>
      </div>
      <Field label="Account owner" htmlFor="edit-owner">
        <select
          className="crm-select"
          id="edit-owner"
          name="owner_id"
          defaultValue={company.ownerId}
        >
          {owners.map((o) => (
            <option key={o.id} value={o.id}>
              {o.name}
            </option>
          ))}
        </select>
      </Field>
      <Field label="Additional tags (comma separated)" htmlFor="edit-tags">
        <Input
          id="edit-tags"
          name="tags"
          defaultValue={company.tags
            .filter((t) => t !== company.segment && t !== company.stage)
            .join(", ")}
        />
      </Field>
      <p className="caption-style text-soft">
        Pipeline value and probability are calculated from opportunities below.
      </p>
      {error && (
        <p role="alert" className="text-danger">
          {error}
        </p>
      )}
      <div className="flex justify-between gap-2">
        <Button variant="ghost" size="sm" disabled={saving} onClick={archive}>
          Archive company
        </Button>
        <Button variant="primary" size="sm" type="submit" disabled={saving}>
          {saving ? "Saving…" : "Save company"}
        </Button>
      </div>
    </form>
  );
}
