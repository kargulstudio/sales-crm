---
name: crm-pipeline-review
description: "Review the Sales CRM pipeline and keep it current: daily or weekly pipeline briefs, finding stale or at-risk accounts, choosing next steps, and recording outcomes after outreach (moving stages, adjusting win probability, logging calls and emails). Use when asked how the pipeline looks, what to work on next, what changed, or to update the CRM after a meeting. Requires the sales-crm skill's MCP server or CLI."
---

# Pipeline review

## Brief the user

1. `get_pipeline_summary` (add `owner` to scope it to one rep) gives totals, weighted value, splits by tag and owner, stale accounts and the top deals.
2. `get_activity` with `since` set to the last review shows what moved and who moved it. Entries from `ui` were made by people; `mcp`, `cli` and `api` entries came from agents and scripts.
3. `list_companies --activityWithinDays 7` lists what's warm. `list_companies --sortBy winProbability --minPipelineValue 100000` lists the deals most worth pushing.

Write a short brief:

- **Headline:** pipeline value, weighted value and change since last time.
- **Needs attention:** stale accounts with large values, high-value deals with low probability, and owners carrying a lopsided load.
- **Next three moves:** one line each, naming a specific company, action and owner.

Base every number on tool output. Don't estimate.

## Record outcomes

After the user reports what happened:

| What happened | Call |
| --- | --- |
| Call, email, demo or meeting | `log_interaction` with `label` (an interaction type when one fits) and `date`, plus `winProbability` if confidence changed |
| Deal moved stage | `update_tags` with the old stage in `remove` and the new one in `add` (in the demo workspace stage is a tag) |
| Deal resized or split | `update_company` with `set.pipelineValue` and/or `set.openDeals` |
| Account reassigned | `update_company` with `set.owner` |
| Lost or dead account | Ask whether to delete it or keep it with lowered `winProbability`. Never delete without a yes |

Bundle related changes into one call where the operation allows it. `log_interaction` can set the interaction, win probability, deals and value together. Then read back the record with `get_company` and confirm in one sentence what changed.

## Stale-account sweep

1. `get_pipeline_summary --staleAfterDays 45` (or the user's threshold).
2. For each stale account, look at `get_company`: value, probability and the last interaction label.
3. Propose an action per account (re-engage, reassign, lower probability, close out) and apply only what the user approves.
