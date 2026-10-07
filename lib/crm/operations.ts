import * as z from "zod";
import {
  DEFAULT_TREND,
  SORT_OPTIONS,
  type Company,
  type SortKey,
  type Tag,
} from "@/data/companies";
import {
  ALL_OWNERS,
  ANY_STAGE,
  companiesCsvRows,
  filterCompanies,
} from "@/lib/companies";
import { toCsv } from "@/lib/csv";
import {
  CrmError,
  assertOwner,
  assertTags,
  currentDate,
  daysBetween,
  findCompany,
  mutate,
  readCompanies,
  resolveWorkspace,
  uniqueCompanyId,
  type CrmContext,
} from "./service";
import { getCrmStore } from "./store";
import { CRM_WORKSPACES, type CrmWorkspace } from "./workspaces";

export type CrmOperation<Input extends z.ZodObject = z.ZodObject> = {
  name: string;
  title: string;
  description: string;
  input: Input;
  readOnly?: boolean;
  destructive?: boolean;
  idempotent?: boolean;
  run: (input: z.output<Input>, context: CrmContext) => Promise<unknown>;
};

function operation<Input extends z.ZodObject>(definition: CrmOperation<Input>) {
  return definition as unknown as CrmOperation;
}

const SORT_KEYS = SORT_OPTIONS.map((option) => option.value) as [
  SortKey,
  ...SortKey[],
];

const workspaceField = z
  .string()
  .optional()
  .describe(
    "Workspace id from list_workspaces. Defaults to the first workspace.",
  );

const companyRef = z
  .string()
  .min(1)
  .describe("Company id (preferred) or exact company name.");

const isoDate = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Use YYYY-MM-DD")
  .describe("Date as YYYY-MM-DD.");

const interaction = z.object({
  label: z
    .string()
    .min(1)
    .describe(
      "What happened, e.g. a value from interactionTypes (Discovery, Demo, QBR Call) or a short note.",
    ),
  date: isoDate.optional().describe("Defaults to today."),
});

const companyFields = {
  name: z.string().trim().min(1).describe("Company name."),
  owner: z
    .string()
    .describe("Account owner name. Must be one of the workspace owners."),
  tags: z
    .array(z.string())
    .describe(
      "Tags from the workspace tag groups (segment and stage in the demo workspace).",
    ),
  openDeals: z.coerce.number().int().min(0).describe("Number of open deals."),
  pipelineValue: z.coerce
    .number()
    .min(0)
    .describe("Pipeline value in dollars."),
  winProbability: z.coerce
    .number()
    .int()
    .min(0)
    .max(100)
    .describe("Win probability, 0-100."),
  lastInteraction: interaction.describe("Most recent touchpoint."),
  logo: z.string().describe("Logo URL or path."),
  trend: z
    .array(z.number())
    .describe("Activity sparkline values, oldest first."),
};

const companyInput = z.object({
  ...companyFields,
  owner: companyFields.owner.optional(),
  tags: companyFields.tags.optional(),
  openDeals: companyFields.openDeals.optional(),
  pipelineValue: companyFields.pipelineValue.optional(),
  winProbability: companyFields.winProbability.optional(),
  lastInteraction: companyFields.lastInteraction.optional(),
  logo: companyFields.logo.optional(),
  trend: companyFields.trend.optional(),
  id: z
    .string()
    .regex(/^[a-z0-9_][a-z0-9_-]*$/, "Use a lowercase slug")
    .optional()
    .describe(
      "Stable id (lowercase slug). Generated from the name when omitted.",
    ),
});

const companyPatch = z
  .object(companyFields)
  .partial()
  .refine((patch) => Object.keys(patch).length > 0, "Set at least one field.");

const listFilters = {
  query: z
    .string()
    .optional()
    .describe("Case-insensitive match on name, id, owner or tags."),
  owner: z.string().optional().describe("Only companies owned by this owner."),
  tag: z.string().optional().describe("Only companies carrying this tag."),
  activityWithinDays: z.coerce
    .number()
    .int()
    .min(0)
    .optional()
    .describe(
      "Only companies touched within this many days (the UI's activity window).",
    ),
  minWinProbability: z.coerce.number().min(0).max(100).optional(),
  minPipelineValue: z.coerce.number().min(0).optional(),
  sortBy: z
    .enum(SORT_KEYS)
    .optional()
    .describe("Defaults to pipelineValue (descending)."),
};

type ListFilters = {
  query?: string;
  owner?: string;
  tag?: string;
  activityWithinDays?: number;
  minWinProbability?: number;
  minPipelineValue?: number;
  sortBy?: SortKey;
};

function applyFilters(
  workspace: CrmWorkspace,
  companies: Company[],
  filters: ListFilters,
) {
  const owner = filters.owner ? assertOwner(workspace, filters.owner) : null;
  const tag = filters.tag?.toLowerCase();
  const query = filters.query?.trim().toLowerCase();
  const matches = companies.filter((company) => {
    if (owner && company.owner !== owner) return false;
    if (tag && !company.tags.some((item) => item.toLowerCase() === tag))
      return false;
    if (
      filters.activityWithinDays !== undefined &&
      company.activityDays > filters.activityWithinDays
    ) {
      return false;
    }
    if (
      filters.minWinProbability !== undefined &&
      company.winProbability < filters.minWinProbability
    ) {
      return false;
    }
    if (
      filters.minPipelineValue !== undefined &&
      company.pipelineValue < filters.minPipelineValue
    ) {
      return false;
    }
    if (query) {
      const haystack = [
        company.name,
        company.id,
        company.owner,
        ...company.tags,
      ]
        .join(" ")
        .toLowerCase();
      if (!haystack.includes(query)) return false;
    }
    return true;
  });
  return filterCompanies(matches, {
    sortBy: filters.sortBy ?? "pipelineValue",
    owner: ALL_OWNERS,
    stage: ANY_STAGE,
    activityWindow: Number.POSITIVE_INFINITY,
  });
}

function summarize(company: Company) {
  return {
    id: company.id,
    name: company.name,
    owner: company.owner,
    tags: company.tags,
    pipelineValue: company.pipelineValue,
    winProbability: company.winProbability,
    openDeals: company.openDeals,
    lastInteraction: company.lastInteraction,
    activityDays: company.activityDays,
  };
}

function withInteraction(
  workspace: CrmWorkspace,
  company: Company,
  next: { label: string; date?: string },
): Company {
  const date = next.date ?? currentDate();
  return {
    ...company,
    lastInteraction: { date, label: next.label },
    activityDays: daysBetween(date, workspace.today),
  };
}

function buildCompany(
  workspace: CrmWorkspace,
  companies: Company[],
  input: z.output<typeof companyInput>,
): Company {
  const id = input.id ?? uniqueCompanyId(companies, input.name);
  if (companies.some((company) => company.id === id)) {
    throw new CrmError(`A company with id "${id}" already exists.`);
  }
  const base: Company = {
    id,
    name: input.name,
    tags: assertTags(workspace, input.tags ?? []) as Tag[],
    owner: assertOwner(workspace, input.owner ?? workspace.owners[0].name),
    openDeals: input.openDeals ?? 0,
    pipelineValue: Math.round(input.pipelineValue ?? 0),
    winProbability: input.winProbability ?? 50,
    trend: input.trend ?? DEFAULT_TREND,
    lastInteraction: { date: currentDate(), label: "" },
    activityDays: 0,
    ...(input.logo ? { logo: input.logo } : {}),
  };
  return withInteraction(
    workspace,
    base,
    input.lastInteraction ?? {
      label: workspace.interactionTypes[0] ?? "Created",
    },
  );
}

function applyPatch(
  workspace: CrmWorkspace,
  company: Company,
  patch: Partial<z.output<z.ZodObject<typeof companyFields>>>,
): Company {
  const { lastInteraction, ...rest } = patch;
  let next: Company = { ...company, ...(rest as Partial<Company>) };
  if (patch.owner !== undefined)
    next.owner = assertOwner(workspace, patch.owner);
  if (patch.tags !== undefined)
    next.tags = assertTags(workspace, patch.tags) as Tag[];
  if (patch.pipelineValue !== undefined)
    next.pipelineValue = Math.round(patch.pipelineValue);
  if (lastInteraction) next = withInteraction(workspace, next, lastInteraction);
  return next;
}

function changedKeys(before: Company, after: Company) {
  return (Object.keys(after) as (keyof Company)[]).filter(
    (key) => JSON.stringify(before[key]) !== JSON.stringify(after[key]),
  );
}

function groupTotals(
  companies: Company[],
  keyOf: (company: Company) => string[],
) {
  const groups = new Map<
    string,
    { companies: number; pipelineValue: number; openDeals: number }
  >();
  for (const company of companies) {
    for (const key of keyOf(company)) {
      const group = groups.get(key) ?? {
        companies: 0,
        pipelineValue: 0,
        openDeals: 0,
      };
      group.companies += 1;
      group.pipelineValue += company.pipelineValue;
      group.openDeals += company.openDeals;
      groups.set(key, group);
    }
  }
  return [...groups.entries()]
    .map(([key, totals]) => ({ key, ...totals }))
    .sort((a, b) => b.pipelineValue - a.pipelineValue);
}

export const CRM_OPERATIONS: CrmOperation[] = [
  operation({
    name: "list_workspaces",
    title: "List workspaces",
    description:
      "List the CRM workspaces (separate pipelines) with company counts. Start here.",
    input: z.object({}),
    readOnly: true,
    async run() {
      return Promise.all(
        CRM_WORKSPACES.map(async (workspace) => {
          const { companies, state } = await readCompanies(workspace);
          return {
            id: workspace.id,
            name: workspace.name,
            description: workspace.description,
            companies: companies.length,
            revision: state.revision,
          };
        }),
      );
    },
  }),
  operation({
    name: "describe_workspace",
    title: "Describe workspace",
    description:
      "Return the vocabulary a workspace accepts: owners, tag groups, interaction types, sort keys and company fields. Call before creating, importing or updating companies.",
    input: z.object({ workspace: workspaceField }),
    readOnly: true,
    async run({ workspace: id }) {
      const workspace = resolveWorkspace(id);
      const { companies, state } = await readCompanies(workspace);
      return {
        id: workspace.id,
        name: workspace.name,
        description: workspace.description,
        today: workspace.today,
        revision: state.revision,
        companies: companies.length,
        owners: workspace.owners.map(({ name, role, email }) => ({
          name,
          role,
          email,
        })),
        tagGroups: workspace.tagGroups,
        interactionTypes: workspace.interactionTypes,
        sortKeys: SORT_KEYS,
        companyFields: z.toJSONSchema(companyInput),
      };
    },
  }),
  operation({
    name: "list_companies",
    title: "List companies",
    description:
      "Search, filter and sort companies like the Companies table does. Returns summaries; use get_company for one full record.",
    input: z.object({
      workspace: workspaceField,
      ...listFilters,
      limit: z.coerce.number().int().min(1).max(1000).default(50),
      offset: z.coerce.number().int().min(0).default(0),
      detail: z
        .enum(["summary", "full"])
        .default("summary")
        .describe("full returns every field, including logo and trend."),
    }),
    readOnly: true,
    async run({ workspace: id, limit, offset, detail, ...filters }) {
      const workspace = resolveWorkspace(id);
      const { companies, state } = await readCompanies(workspace);
      const matches = applyFilters(workspace, companies, filters);
      return {
        workspace: workspace.id,
        revision: state.revision,
        total: matches.length,
        offset,
        companies: matches
          .slice(offset, offset + limit)
          .map((company) => (detail === "full" ? company : summarize(company))),
      };
    },
  }),
  operation({
    name: "get_company",
    title: "Get company",
    description:
      "Fetch one company with every field, plus its recent activity log.",
    input: z.object({ workspace: workspaceField, company: companyRef }),
    readOnly: true,
    async run({ workspace: id, company: ref }) {
      const workspace = resolveWorkspace(id);
      const { companies, state } = await readCompanies(workspace);
      const company = findCompany(companies, ref);
      return {
        company,
        activity: state.activity
          .filter((entry) => entry.companyId === company.id)
          .slice(-10)
          .reverse(),
      };
    },
  }),
  operation({
    name: "get_pipeline_summary",
    title: "Pipeline summary",
    description:
      "Totals for the pipeline: value, weighted value, open deals, breakdowns by tag and owner, stale accounts and the biggest opportunities.",
    input: z.object({
      workspace: workspaceField,
      ...listFilters,
      staleAfterDays: z.coerce.number().int().min(1).default(60),
    }),
    readOnly: true,
    async run({ workspace: id, staleAfterDays, ...filters }) {
      const workspace = resolveWorkspace(id);
      const { companies } = await readCompanies(workspace);
      const matches = applyFilters(workspace, companies, filters);
      const pipelineValue = matches.reduce(
        (sum, company) => sum + company.pipelineValue,
        0,
      );
      const stale = matches.filter(
        (company) => company.activityDays > staleAfterDays,
      );
      return {
        workspace: workspace.id,
        companies: matches.length,
        openDeals: matches.reduce((sum, company) => sum + company.openDeals, 0),
        pipelineValue,
        weightedPipelineValue: Math.round(
          matches.reduce(
            (sum, company) =>
              sum + (company.pipelineValue * company.winProbability) / 100,
            0,
          ),
        ),
        averageWinProbability: matches.length
          ? Math.round(
              matches.reduce(
                (sum, company) => sum + company.winProbability,
                0,
              ) / matches.length,
            )
          : 0,
        byTag: groupTotals(matches, (company) => company.tags),
        byOwner: groupTotals(matches, (company) => [company.owner]),
        stale: {
          afterDays: staleAfterDays,
          count: stale.length,
          companies: stale.slice(0, 10).map(summarize),
        },
        topByValue: [...matches]
          .sort((a, b) => b.pipelineValue - a.pipelineValue)
          .slice(0, 5)
          .map(summarize),
      };
    },
  }),
  operation({
    name: "get_activity",
    title: "Activity log",
    description:
      "Recent changes made through the UI, MCP, CLI or API, newest first. Use it to see what changed since you last looked.",
    input: z.object({
      workspace: workspaceField,
      company: companyRef.optional(),
      since: z
        .string()
        .optional()
        .describe("ISO timestamp; only entries after it."),
      limit: z.coerce.number().int().min(1).max(500).default(25),
    }),
    readOnly: true,
    async run({ workspace: id, company: ref, since, limit }) {
      const workspace = resolveWorkspace(id);
      const { companies, state } = await readCompanies(workspace);
      const companyId = ref ? findCompany(companies, ref).id : undefined;
      return {
        revision: state.revision,
        entries: state.activity
          .filter((entry) => !companyId || entry.companyId === companyId)
          .filter((entry) => !since || entry.at > since)
          .slice(-limit)
          .reverse(),
      };
    },
  }),
  operation({
    name: "get_revision",
    title: "Get revision",
    description:
      "Cheap change counter for a workspace. It increases on every write.",
    input: z.object({ workspace: workspaceField }),
    readOnly: true,
    async run({ workspace: id }) {
      const workspace = resolveWorkspace(id);
      const state = await getCrmStore().read(workspace.id);
      return { workspace: workspace.id, revision: state.revision };
    },
  }),
  operation({
    name: "export_companies_csv",
    title: "Export CSV",
    description:
      "Export companies as CSV with the same columns as the toolbar's Export button.",
    input: z.object({ workspace: workspaceField, ...listFilters }),
    readOnly: true,
    async run({ workspace: id, ...filters }) {
      const workspace = resolveWorkspace(id);
      const { companies } = await readCompanies(workspace);
      const matches = applyFilters(workspace, companies, filters);
      return {
        filename: `companies-${workspace.id}-${currentDate()}.csv`,
        rows: matches.length,
        csv: toCsv(companiesCsvRows(matches)),
      };
    },
  }),
  operation({
    name: "create_company",
    title: "Create company",
    description:
      "Add a company, the same as the New Company dialog. Fails if the id already exists; use import_companies to upsert.",
    input: z.object({ workspace: workspaceField, ...companyInput.shape }),
    async run({ workspace: id, ...input }, context) {
      const workspace = resolveWorkspace(id);
      return mutate(workspace, context, (mutation) => {
        const company = buildCompany(workspace, mutation.companies, input);
        mutation.put(company);
        mutation.log("create_company", `Created ${company.name}`, company.id);
        return { company };
      });
    },
  }),
  operation({
    name: "update_company",
    title: "Update company",
    description:
      "Change any fields on a company: owner, tags, deal counts, value, win probability, last interaction, logo or trend. Only the fields in `set` change.",
    input: z.object({
      workspace: workspaceField,
      company: companyRef,
      set: companyPatch,
    }),
    idempotent: true,
    async run({ workspace: id, company: ref, set }, context) {
      const workspace = resolveWorkspace(id);
      return mutate(workspace, context, (mutation) => {
        const before = findCompany(mutation.companies, ref);
        const after = applyPatch(workspace, before, set);
        const changed = changedKeys(before, after);
        if (changed.length) {
          mutation.put(after);
          mutation.log(
            "update_company",
            `Updated ${after.name}: ${changed.join(", ")}`,
            after.id,
          );
        }
        return { company: after, changed };
      });
    },
  }),
  operation({
    name: "update_tags",
    title: "Add or remove tags",
    description:
      "Add and/or remove tags on a company without replacing the rest. In the demo workspace stage (New Logo, Pilot, Renewal...) and segment are tags.",
    input: z.object({
      workspace: workspaceField,
      company: companyRef,
      add: z.array(z.string()).default([]),
      remove: z.array(z.string()).default([]),
    }),
    idempotent: true,
    async run({ workspace: id, company: ref, add, remove }, context) {
      const workspace = resolveWorkspace(id);
      return mutate(workspace, context, (mutation) => {
        const before = findCompany(mutation.companies, ref);
        const adding = assertTags(workspace, add);
        const removing = new Set(remove.map((tag) => tag.toLowerCase()));
        const tags = [
          ...before.tags.filter((tag) => !removing.has(tag.toLowerCase())),
          ...adding,
        ].filter((tag, index, all) => all.indexOf(tag) === index) as Tag[];
        const after = { ...before, tags };
        if (changedKeys(before, after).length) {
          mutation.put(after);
          mutation.log(
            "update_tags",
            `Tags on ${after.name}: ${tags.join(", ") || "none"}`,
            after.id,
          );
        }
        return { company: after };
      });
    },
  }),
  operation({
    name: "log_interaction",
    title: "Log interaction",
    description:
      "Record a touchpoint (call, email, demo, meeting). Sets last interaction and recency; optionally adjusts win probability, open deals or pipeline value in the same write.",
    input: z.object({
      workspace: workspaceField,
      company: companyRef,
      ...interaction.shape,
      winProbability: companyFields.winProbability.optional(),
      openDeals: companyFields.openDeals.optional(),
      pipelineValue: companyFields.pipelineValue.optional(),
    }),
    async run({ workspace: id, company: ref, label, date, ...rest }, context) {
      const workspace = resolveWorkspace(id);
      return mutate(workspace, context, (mutation) => {
        const before = findCompany(mutation.companies, ref);
        const after = applyPatch(workspace, before, {
          ...Object.fromEntries(
            Object.entries(rest).filter(([, value]) => value !== undefined),
          ),
          lastInteraction: { label, date },
        });
        mutation.put(after);
        mutation.log(
          "log_interaction",
          `${label} with ${after.name} on ${after.lastInteraction.date}`,
          after.id,
        );
        return { company: after };
      });
    },
  }),
  operation({
    name: "delete_company",
    title: "Delete company",
    description:
      "Remove a company from the workspace. reset_workspace brings seeded companies back.",
    input: z.object({ workspace: workspaceField, company: companyRef }),
    destructive: true,
    async run({ workspace: id, company: ref }, context) {
      const workspace = resolveWorkspace(id);
      return mutate(workspace, context, (mutation) => {
        const company = findCompany(mutation.companies, ref);
        mutation.remove(company.id);
        mutation.log("delete_company", `Deleted ${company.name}`, company.id);
        return { deleted: { id: company.id, name: company.name } };
      });
    },
  }),
  operation({
    name: "import_companies",
    title: "Import companies",
    description:
      "Bulk-ingest companies from any source (CSV rows, enrichment results, scraped lists). Matches existing companies by id, then by exact name; existing ones are updated with the fields you pass (or skipped). Bad rows are reported and the rest still import. Use dryRun first on large batches.",
    input: z.object({
      workspace: workspaceField,
      companies: z.array(companyInput).min(1).max(5000),
      onExisting: z.enum(["update", "skip"]).default("update"),
      dryRun: z.boolean().default(false),
    }),
    async run({ workspace: id, companies: rows, onExisting, dryRun }, context) {
      const workspace = resolveWorkspace(id);
      const apply = (mutation: {
        companies: Company[];
        put: (company: Company) => void;
      }) => {
        const result = {
          dryRun,
          created: [] as string[],
          updated: [] as string[],
          unchanged: [] as string[],
          skipped: [] as string[],
          errors: [] as { index: number; name: string; error: string }[],
        };
        rows.forEach((row, index) => {
          try {
            const companies = mutation.companies;
            const existing =
              (row.id && companies.find((company) => company.id === row.id)) ||
              companies.find(
                (company) =>
                  company.name.toLowerCase() === row.name.toLowerCase(),
              );
            if (!existing) {
              const company = buildCompany(workspace, companies, row);
              mutation.put(company);
              result.created.push(company.id);
              return;
            }
            if (onExisting === "skip") {
              result.skipped.push(existing.id);
              return;
            }
            const patch = Object.fromEntries(
              Object.entries(row).filter(([key]) => key !== "id"),
            ) as Parameters<typeof applyPatch>[2];
            const after = applyPatch(workspace, existing, patch);
            if (changedKeys(existing, after).length) {
              mutation.put(after);
              result.updated.push(existing.id);
            } else {
              result.unchanged.push(existing.id);
            }
          } catch (error) {
            result.errors.push({
              index,
              name: row.name,
              error: error instanceof Error ? error.message : String(error),
            });
          }
        });
        return result;
      };

      if (dryRun) {
        const { companies } = await readCompanies(workspace);
        const scratch = [...companies];
        return apply({
          get companies() {
            return scratch;
          },
          put(company) {
            const index = scratch.findIndex((item) => item.id === company.id);
            if (index >= 0) scratch[index] = company;
            else scratch.unshift(company);
          },
        });
      }

      return mutate(workspace, context, (mutation) => {
        const result = apply(mutation);
        mutation.log(
          "import_companies",
          `Imported ${rows.length} rows: ${result.created.length} created, ${result.updated.length} updated, ${result.skipped.length} skipped, ${result.errors.length} errors`,
        );
        return result;
      });
    },
  }),
  operation({
    name: "reset_workspace",
    title: "Reset workspace",
    description:
      "Discard every change made through the UI, MCP, CLI or API and return the workspace to its seed data. Irreversible.",
    input: z.object({
      workspace: workspaceField,
      confirm: z.literal(true).describe("Must be true."),
    }),
    destructive: true,
    async run({ workspace: id }, context) {
      const workspace = resolveWorkspace(id);
      return mutate(workspace, context, (mutation) => {
        const discarded = {
          added: mutation.state.added.length,
          edited: Object.keys(mutation.state.patches).length,
          deleted: mutation.state.deleted.length,
        };
        mutation.state.added = [];
        mutation.state.patches = {};
        mutation.state.deleted = [];
        mutation.log("reset_workspace", `Reset to seed data`);
        return { discarded };
      });
    },
  }),
];

export function findOperation(name: string) {
  const normalized = name.replace(/-/g, "_");
  return CRM_OPERATIONS.find((item) => item.name === normalized);
}

export async function runCrmOperation(
  name: string,
  input: unknown,
  context: CrmContext,
) {
  const definition = findOperation(name);
  if (!definition) {
    throw new CrmError(
      `Unknown operation "${name}". Operations: ${CRM_OPERATIONS.map((item) => item.name).join(", ")}.`,
    );
  }
  const parsed = definition.input.safeParse(input ?? {});
  if (!parsed.success) {
    throw new CrmError(
      `Invalid input for ${definition.name}: ${z.prettifyError(parsed.error)}`,
    );
  }
  return definition.run(parsed.data, context);
}
