# Upstream audit (2026-10-05)

Source: https://github.com/kargulstudio/sales-crm, main at fork time. The original design is a Next.js 16 App Router, React 19, Tailwind 4, Radix, Motion, Zustand application. There is one page and no backend or authentication.

- `data/companies.ts`: 18 sample companies, fake owners/current user, trend patterns, scorecards and presentation options. Company includes name, tags, owner name, deal count, aggregate pipeline/probability, fixed last interaction, trend and activity age. No contact/deal entity exists.
- `data/notifications.ts`: seven fabricated notifications. `data/socials.ts` and `lib/seo.ts` contain starter site metadata.
- `stores/companies-store.ts`: companies live only in memory; creation and notification read state disappear on refresh. Filter, selection, drawer, profile, command palette, sidebar and tab state are also in memory (appropriate for presentation state).
- Detail “Save Update” only closes the drawer. Scorecard/trend period controls do not change source data. Activity counts and pipeline stages are arithmetic inventions in `lib/companies.ts`; its clock is fixed to September 2026.
- Header tabs only change their highlight. Sidebar navigation has no actions, counts are fabricated, and billing/trial/team/email-sequence links are decorative. CSV export and command search already work on client records; CSV formula escaping exists.
- Upload converts a logo to an in-memory data URL. Profiles use fabricated owner records. Table, command palette, profile and notifications all resolve owner names from a static array.
- No migration, test suite, authentication, deployment config or CI exists. `.mcp.json` points to an upstream Supabase project, unused by application code.
- No LICENSE, COPYING or other license grant was found. GitHub reports `licenseInfo: null`. Public visibility is not a license. Original attribution must remain; obtain permission before redistribution or use beyond rights already granted by the author.

## Implementation decisions

Preserve the existing components, SVGs, typography, spacing, responsive table, sheets, dialogs, filters and keyboard palette. Use Cloudflare's current Next.js 16 runtime recommendation (vinext, subject to its compatibility check), D1 prepared statements and Zod. No hosted third-party backend.

Each company belongs to an authenticated user's account (`account_id`); account owner assignment is separate. Child records inherit authorization from the company. This permits multiple independent personal CRMs without organizations or enterprise RBAC. Seed fixtures are optional and never the source of live records.

Retain real features; replace fabricated statistics with aggregates. Decorative enterprise/billing navigation will be repurposed for contacts, tasks, deals and activity views in the same design. Relationship scorecards remain explicitly labelled derived completeness indicators, rather than invented human assessments.
