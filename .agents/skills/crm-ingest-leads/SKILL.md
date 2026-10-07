---
name: crm-ingest-leads
description: "Ingest companies or leads into the Sales CRM from any source: a CSV or spreadsheet export, an enrichment or scraping tool's output, another MCP server (Apollo, Leadfeeder, Clay, LinkedIn, a database), or a list pasted into chat. Use when asked to import, load, sync, ingest, upsert or bulk-add leads or accounts to the CRM. Requires the sales-crm skill's MCP server or CLI."
---

# Ingest leads into the CRM

The goal is a clean upsert: new companies created, existing ones updated with only the fields the source actually knows, nothing duplicated and every rejected row explained.

## Workflow

1. **Get the vocabulary.** Call `describe_workspace` (with `workspace` if there is more than one). Note the owners, every tag group, the interaction types and `companyFields`.
2. **Pull the source data.** Read the file, call the other tool, or parse the pasted list. Keep the raw rows so you can explain mismatches later.
3. **Map each row to a company.** Only `name` is required.

   | CRM field | Typical source columns | Notes |
   | --- | --- | --- |
   | `name` | company, account, organization | Trim it. Use the legal or brand name the CRM already uses when you can tell. |
   | `id` | domain, external id | Optional. A slug of the domain (`acme-com`) keeps re-imports stable. |
   | `owner` | owner, rep, assignee | Must be one of the workspace owners. Leave it out to keep the existing owner, or to default to the first owner on create. |
   | `tags` | segment, tier, stage, status, size | Map source values onto the workspace's tag groups (for example 1,000+ employees → `Enterprise`, new lead → `New Logo`). Drop values with no match rather than inventing tags. |
   | `pipelineValue` | deal size, ARR, budget | Whole dollars. |
   | `winProbability` | score, likelihood, intent | 0-100. Rescale other ranges. |
   | `openDeals` | opportunities, deals | Integer. |
   | `lastInteraction` | last activity / last touch | `{ "label": "...", "date": "YYYY-MM-DD" }` |

   Leave a field out when the source doesn't know it. On existing companies, any field you pass overwrites the stored value.
4. **Check for duplicates the matcher can't see.** `import_companies` matches on `id`, then on exact name (ignoring case). For near-matches ("Acme" vs "Acme Inc."), search with `list_companies --query` and either reuse the existing `id` in the row or drop the row.
5. **Dry run.** Call `import_companies` with `dryRun: true`. Read `created`, `updated`, `unchanged`, `skipped` and `errors`. Fix the mapping for rejected rows (an unknown owner or tag is the usual cause) and run the dry run again.
6. **Confirm when the batch is large or overwrites data.** If more than about 25 existing companies would be updated, or values like owner or pipeline value would be overwritten, show the user the dry-run counts and a few sample changes before committing. Use `onExisting: "skip"` when the user only wants new companies added.
7. **Commit.** Run the same call with `dryRun: false`. Batches can be up to 5,000 rows; split larger sources.
8. **Verify and report.** Call `get_activity --limit 1` for the import summary and `get_pipeline_summary` for the new totals. Tell the user what was created, updated, skipped and rejected, and why.

## CSV shortcut (CLI)

The CLI reads CSV files directly. It recognizes the CRM's own export headers (`Company`, `Account Owner`, `Segment & Stage`, `Open Deals`, `Pipeline Value`, `Win Probability (%)`, `Last Interaction Date`, `Last Interaction`) and plain field names (`name`, `owner`, `tags`, `pipelineValue`...). Tags split on `;` or `|`. Unknown columns are listed on stderr and ignored.

```bash
npm run -s crm -- import_companies --input leads.csv --dryRun true
npm run -s crm -- import_companies --input leads.csv --onExisting skip
```

When the headers don't match, convert the rows to JSON with the mapping above and pass that instead: `--input rows.json` accepts an array of companies.

## MCP example

```json
{
  "companies": [
    { "id": "globex-com", "name": "Globex", "owner": "Lina Wong", "tags": ["Enterprise", "New Logo"], "pipelineValue": 250000, "winProbability": 40, "lastInteraction": { "label": "Discovery", "date": "2026-10-06" } },
    { "name": "Initech", "tags": ["SMB"] }
  ],
  "dryRun": true
}
```
