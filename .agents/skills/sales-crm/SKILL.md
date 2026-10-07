---
name: sales-crm
description: "Read and change this Sales CRM's data (companies, owners, tags, deal values, win probability, interactions) through its MCP server or CLI. Use whenever a task touches the CRM: looking up an account, creating or editing companies, moving a deal, logging a call or email, exporting, or checking what changed. Pair with crm-ingest-leads for bulk imports and crm-pipeline-review for pipeline triage."
---

# Sales CRM

The CRM holds **companies** (accounts and leads) inside **workspaces** (separate pipelines). Every change made by the web UI, the MCP server, the CLI or the HTTP API goes into one store, gets logged with its source, and shows up in the open UI within about 3 seconds.

## Connect

Use whichever surface your harness supports. All three expose the same operations with the same inputs.

| Surface | How |
| --- | --- |
| MCP over stdio | `npm --prefix <repo> run -s mcp` (already in the repo's `.mcp.json` as `sales-crm`) |
| MCP over HTTP | `http://localhost:3000/api/mcp` while `npm run dev` runs. Remote: set `CRM_API_TOKEN` on the server and send `Authorization: Bearer <token>` |
| CLI | `npm run -s crm -- <operation> --field value` from the repo root. `help` lists operations; `help <operation>` lists fields |
| HTTP | `POST /api/crm/<operation>` with a JSON body. `GET /api/crm` lists operations with JSON Schemas |

CLI flags are parsed as JSON when they can be: `--tags '["SMB","Pilot"]'`, `--winProbability 70`, `--dryRun true`. Dotted flags nest: `--set.owner "Kate Chen"`. `--input file.json|file.csv` loads input from a file, and `--pick csv` prints one result key raw. `--url http://host:3000` (or `CRM_URL`) targets a running server instead of the local files.

## Operations

| Operation | Use it to | Writes |
| --- | --- | --- |
| `list_workspaces` | See the pipelines and their sizes | |
| `describe_workspace` | Get the valid owners, tags, interaction types, sort keys and company fields | |
| `list_companies` | Search (`query`), filter (`owner`, `tag`, `activityWithinDays`, `minWinProbability`, `minPipelineValue`), sort (`sortBy`) and page (`limit`, `offset`) | |
| `get_company` | Read one full record and its recent activity | |
| `get_pipeline_summary` | Get totals, weighted value, splits by tag and owner, stale accounts and top deals | |
| `get_activity` | See what changed, by whom (`ui`, `mcp`, `cli`, `api`), optionally `since` a timestamp | |
| `get_revision` | Cheaply check whether anything changed | |
| `export_companies_csv` | Export the same columns as the toolbar's Export button | |
| `create_company` | Add one company (the New Company dialog) | yes |
| `update_company` | Change any fields under `set` | yes |
| `update_tags` | `add` / `remove` tags without replacing the rest | yes |
| `log_interaction` | Record a touchpoint, optionally adjusting win probability, deals or value | yes |
| `import_companies` | Bulk upsert from any source | yes |
| `delete_company` | Remove a company | destructive |
| `reset_workspace` | Throw away every change and return to seed data (`confirm: true`) | destructive |

## Rules

1. **Learn the vocabulary first.** Call `describe_workspace` before any write. Owners and tags are closed lists. Owner and tag matching ignores case, but a value outside the list is rejected and the error names the valid options.
2. **Reference companies by `id`.** Exact names work, but ids never collide. When a name is ambiguous the error lists the matching ids.
3. **Check before you create.** Run `list_companies --query <name>` first. `create_company` refuses a duplicate id, and `import_companies` matches on id and then on exact name.
4. **Use `log_interaction` after any outreach** (call, email, demo, meeting) rather than editing `lastInteraction` by hand. It keeps recency correct.
5. **Ask before destructive operations.** Get explicit user approval before calling `delete_company` or `reset_workspace`. Prefer tags or `update_company` when a record should only be archived.
6. **Verify writes.** Each write returns the updated record. For bulk work, compare `get_activity` or `get_pipeline_summary` before and after.

## Fields

`name`, `owner`, `tags[]`, `openDeals`, `pipelineValue` (dollars), `winProbability` (0-100), `lastInteraction {label, date YYYY-MM-DD}`, `logo` (URL), `trend[]` (sparkline). `activityDays` is computed from `lastInteraction.date`. In the demo workspace, segment (Enterprise, Mid-Market, SMB, Strategic) and stage (New Logo, Upsell, Expansion, Renewal, Pilot, Co-Sell, Land & Expand) are both tags.

## Examples

```bash
npm run -s crm -- list_companies --owner "Mark Darnalds" --sortBy winProbability --limit 5
npm run -s crm -- update_company --company microsoft --set.winProbability 80 --set.owner "Kate Chen"
npm run -s crm -- update_tags --company acme-robotics --add '["Expansion"]' --remove '["Pilot"]'
npm run -s crm -- log_interaction --company microsoft --label Demo --date 2026-10-07 --winProbability 75
npm run -s crm -- export_companies_csv --tag Enterprise --pick csv > enterprise.csv
```

Data lives in `data/store/<workspace>.json` (git-ignored; change the location with `CRM_DATA_DIR`). Seed records come from the code in `data/`, and the store keeps only the changes on top of them.
