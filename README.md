# Kargul Starter

Next.js 16 + React 19 + Tailwind CSS 4 boilerplate. Read `CONVENTIONS.md` before writing any component, section, or page — it is the whole spec for how this repo is built.

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

| Script                 | What it does                                                       |
| ---------------------- | ------------------------------------------------------------------ |
| `npm run dev`          | Start the dev server                                               |
| `npm run build`        | Production build                                                   |
| `npm run start`        | Serve the production build                                         |
| `npm run lint`         | ESLint                                                             |
| `npm run to:avif`      | Convert an image to AVIF and report its inline cost — rule 11      |
| `npm run extract:avif` | Pull the first frame of every `.webm` under `public/` as a poster  |
| `npm run frame:rive`   | Render a still from a `.riv` file for use as its poster            |
| `npm run crm`          | CRM command line (`npm run -s crm -- help`) — see Agent access     |
| `npm run mcp`          | CRM MCP server over stdio — see Agent access                       |

## Agent access (MCP, CLI, skills)

Agents can do everything the UI does, and more, through one set of operations exposed four ways. Every change lands in the same store, is logged with who made it (`ui`, `mcp`, `cli`, `api`), and shows up in the open UI within about 3 seconds.

| Surface | Connect |
| --- | --- |
| MCP (stdio) | `npm --prefix /path/to/sales-crm run -s mcp`. Already registered in `.mcp.json` as `sales-crm` |
| MCP (HTTP) | `http://localhost:3000/api/mcp` while the app runs |
| CLI | `npm run -s crm -- <operation> --field value`. `help` lists operations, `help <operation>` lists fields |
| HTTP | `POST /api/crm/<operation>` with a JSON body. `GET /api/crm` returns every operation with its JSON Schema |

Operations: `list_workspaces`, `describe_workspace`, `list_companies` (search, filter, sort, page), `get_company`, `get_pipeline_summary`, `get_activity`, `get_revision`, `export_companies_csv`, `create_company`, `update_company`, `update_tags`, `log_interaction`, `import_companies` (bulk upsert with dry run), `delete_company`, `reset_workspace`. They're defined once in `lib/crm/operations.ts`; MCP tools, CLI commands and HTTP routes are all generated from that list.

```bash
npm run -s crm -- list_companies --owner "Kate Chen" --sortBy winProbability
npm run -s crm -- log_interaction --company microsoft --label Demo --winProbability 75
npm run -s crm -- import_companies --input leads.csv --dryRun true
```

Any MCP client can connect. For example, in Claude Code: `claude mcp add sales-crm -- npm --prefix /path/to/sales-crm run -s mcp`, or `claude mcp add --transport http sales-crm http://localhost:3000/api/mcp`.

**Skills.** `.agents/skills/` (linked from `.claude/skills/`) ships three Agent Skills that teach an agent the workflow, not just the tools:

- `sales-crm`: connecting, the operation reference and the rules (check the vocabulary first, reference companies by id, ask before deleting)
- `crm-ingest-leads`: mapping any source (CSV, enrichment tools, other MCP servers) onto CRM fields, deduplicating, dry-running, then importing
- `crm-pipeline-review`: pipeline briefs, stale-account sweeps and recording outcomes after outreach

**Storage.** Seed companies stay in `data/companies.ts`. Changes are written to `data/store/<workspace>.json` (git-ignored; set `CRM_DATA_DIR` to move it) with a file lock, so the app, the MCP server and the CLI can all write at the same time. The `CrmStore` interface in `lib/crm/store.ts` is the seam for a database-backed store. Serverless hosts like Vercel don't keep local files, so deployments there need one.

**Security.** Without `CRM_API_TOKEN`, `/api/crm` and `/api/mcp` only answer requests addressed to localhost, and production builds turn them off. Set `CRM_API_TOKEN` to enable them remotely and send `Authorization: Bearer <token>`. The CLI sends it automatically with `--url` or `CRM_URL`. The UI writes through server actions limited to what the UI itself does. The app still has no user auth.

## First things to set on a new project

1. **`lib/seo.ts`** — `SITE_NAME`, `SITE_URL`, `SITE_DESCRIPTION`, `SITE_ROUTES`. Everything in `app/robots.ts`, `app/sitemap.ts`, `app/llms.txt/route.ts` and every page's metadata derives from these (rule 18). Set `NEXT_PUBLIC_SITE_URL` in the environment to override the URL per deploy.
2. **`app/globals.css`** — match the `@layer base` type scale and the `--padding-section-*` tokens to the design before building anything (rules 1 and 3).
3. **`app/opengraph-image.jpg`** — 1200×630, with an `opengraph-image.alt.txt` beside it.
4. **Fonts** — `app/layout.tsx` ships Inter + a local Inter Display; swap them for the design's typeface.

## Docs

| File               | What's in it                                                        |
| ------------------ | ------------------------------------------------------------------- |
| `CONVENTIONS.md`   | The build rules. Read first.                                        |
| `AGENTS.md`        | Next.js version notes for agents                                    |
| `OPTIMIZATION.md`  | Why `Asset`'s Rive loading is gated behind LCP, with the measurements |
