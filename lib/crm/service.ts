import { randomUUID } from "node:crypto";
import type { Company } from "@/data/companies";
import { slugify } from "@/lib/utils";
import {
  getCrmStore,
  type CrmActor,
  type WorkspaceState,
} from "./store";
import {
  CRM_WORKSPACES,
  DEFAULT_CRM_WORKSPACE_ID,
  type CrmWorkspace,
} from "./workspaces";

export class CrmError extends Error {}

export type CrmContext = { actor: CrmActor };

export function resolveWorkspace(id?: string): CrmWorkspace {
  const workspaceId = id ?? DEFAULT_CRM_WORKSPACE_ID;
  const workspace = CRM_WORKSPACES.find((item) => item.id === workspaceId);
  if (!workspace) {
    throw new CrmError(
      `Unknown workspace "${workspaceId}". Available: ${CRM_WORKSPACES.map((item) => item.id).join(", ")}.`,
    );
  }
  return workspace;
}

export function composeCompanies(
  workspace: CrmWorkspace,
  state: WorkspaceState,
): Company[] {
  const deleted = new Set(state.deleted);
  const base = workspace.companies
    .filter((company) => !deleted.has(company.id))
    .map((company) => {
      const patch = state.patches[company.id];
      return patch ? { ...company, ...patch } : company;
    });
  return [...state.added, ...base];
}

export async function readCompanies(workspace: CrmWorkspace) {
  const state = await getCrmStore().read(workspace.id);
  return { companies: composeCompanies(workspace, state), state };
}

export function findCompany(companies: Company[], ref: string): Company {
  const needle = ref.trim().toLowerCase();
  const byId = companies.find((company) => company.id.toLowerCase() === needle);
  if (byId) return byId;
  const byName = companies.filter(
    (company) => company.name.toLowerCase() === needle,
  );
  if (byName.length === 1) return byName[0];
  if (byName.length > 1) {
    throw new CrmError(
      `"${ref}" matches ${byName.length} companies (${byName.map((company) => company.id).join(", ")}). Pass the id instead.`,
    );
  }
  const partial = companies
    .filter((company) => company.name.toLowerCase().includes(needle))
    .slice(0, 5)
    .map((company) => `${company.name} (${company.id})`);
  throw new CrmError(
    `No company matches "${ref}".${partial.length ? ` Did you mean: ${partial.join(", ")}?` : ""}`,
  );
}

export function uniqueCompanyId(companies: Company[], name: string) {
  const base = slugify(name) || "company";
  const taken = new Set(companies.map((company) => company.id));
  if (!taken.has(base)) return base;
  let suffix = 2;
  while (taken.has(`${base}-${suffix}`)) suffix += 1;
  return `${base}-${suffix}`;
}

export function assertOwner(workspace: CrmWorkspace, owner: string) {
  const match = workspace.owners.find(
    (item) => item.name.toLowerCase() === owner.trim().toLowerCase(),
  );
  if (!match) {
    throw new CrmError(
      `Unknown owner "${owner}". Owners: ${workspace.owners.map((item) => item.name).join(", ")}.`,
    );
  }
  return match.name;
}

export function allowedTags(workspace: CrmWorkspace) {
  return workspace.tagGroups.flatMap((group) => group.tags);
}

export function assertTags(workspace: CrmWorkspace, tags: string[]) {
  const allowed = allowedTags(workspace);
  return tags.map((tag) => {
    const match = allowed.find(
      (item) => item.toLowerCase() === tag.trim().toLowerCase(),
    );
    if (!match) {
      throw new CrmError(
        `Unknown tag "${tag}". Tags: ${workspace.tagGroups.map((group) => `${group.label}: ${group.tags.join(", ")}`).join("; ")}.`,
      );
    }
    return match;
  });
}

export function currentDate() {
  return new Date().toISOString().slice(0, 10);
}

export function daysBetween(from: string, to: string) {
  return Math.max(
    0,
    Math.round((Date.parse(to) - Date.parse(from)) / 86_400_000),
  );
}

export type Mutation = {
  companies: Company[];
  state: WorkspaceState;
  workspace: CrmWorkspace;
  put: (company: Company) => void;
  remove: (id: string) => void;
  log: (operation: string, summary: string, companyId?: string) => void;
};

export async function mutate<T>(
  workspace: CrmWorkspace,
  context: CrmContext,
  change: (mutation: Mutation) => T,
): Promise<T> {
  return getCrmStore().update(workspace.id, (state) => {
    const baseIds = new Set(workspace.companies.map((company) => company.id));
    const mutation: Mutation = {
      workspace,
      state,
      get companies() {
        return composeCompanies(workspace, state);
      },
      put(company) {
        if (baseIds.has(company.id) && !state.deleted.includes(company.id)) {
          const base = workspace.companies.find((item) => item.id === company.id)!;
          const patch: Partial<Company> = {};
          for (const key of Object.keys(company) as (keyof Company)[]) {
            if (JSON.stringify(company[key]) !== JSON.stringify(base[key])) {
              Object.assign(patch, { [key]: company[key] });
            }
          }
          if (Object.keys(patch).length) state.patches[company.id] = patch;
          else delete state.patches[company.id];
          return;
        }
        const index = state.added.findIndex((item) => item.id === company.id);
        if (index >= 0) state.added[index] = company;
        else state.added.unshift(company);
      },
      remove(id) {
        const index = state.added.findIndex((item) => item.id === id);
        if (index >= 0) {
          state.added.splice(index, 1);
          return;
        }
        delete state.patches[id];
        if (!state.deleted.includes(id)) state.deleted.push(id);
      },
      log(operation, summary, companyId) {
        state.activity.push({
          id: randomUUID(),
          at: new Date().toISOString(),
          actor: context.actor,
          operation,
          companyId,
          summary,
        });
      },
    };
    return change(mutation);
  });
}
