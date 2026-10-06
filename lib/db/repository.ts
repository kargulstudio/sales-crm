import type { Company, Owner } from "../../data/companies";
import type {
  Contact,
  EntityKind,
  EntityMap,
  Interaction,
  Opportunity,
  Task,
  User,
} from "../crm-types";
import type { Notification } from "../../data/notifications";
import {
  companyPatchSchema,
  companySchema,
  entitySchemas,
  idSchema,
  listSchema,
} from "../server/validation";
import { HttpError } from "../server/errors";

type CompanyRow = {
  id: string;
  name: string;
  website: string;
  description: string;
  industry: string;
  segment: string;
  stage: string;
  owner_id: string;
  owner_name: string;
  logo_url: string | null;
  archived_at: string | null;
  pipeline_value: number;
  win_probability: number;
  created_at: string;
  tags_json: string;
  open_deals: number;
  last_date: string | null;
  last_subject: string | null;
  contact_count: number;
  task_count: number;
  activity_json: string;
  discovery: number;
  evaluation: number;
  procurement: number;
};
const summarySql = `SELECT c.*, u.display_name AS owner_name,
 (SELECT json_group_array(t.name) FROM company_tags ct JOIN tags t ON t.id=ct.tag_id WHERE ct.company_id=c.id) AS tags_json,
 (SELECT COUNT(*) FROM opportunities WHERE company_id=c.id AND status='open') AS open_deals,
 (SELECT MAX(occurred_at) FROM interactions WHERE company_id=c.id) AS last_date,
 (SELECT subject FROM interactions WHERE company_id=c.id ORDER BY occurred_at DESC,id DESC LIMIT 1) AS last_subject,
 (SELECT COUNT(*) FROM contacts WHERE company_id=c.id) AS contact_count,
 (SELECT COUNT(*) FROM tasks WHERE company_id=c.id AND completed_at IS NULL) AS task_count,
 (SELECT json_group_array(json_object('day',day,'type',type,'count',n)) FROM
   (SELECT substr(occurred_at,1,10) AS day,type,COUNT(*) AS n FROM interactions WHERE company_id=c.id AND occurred_at >= strftime('%Y-%m-%dT00:00:00.000Z','now','-90 days') GROUP BY day,type)) AS activity_json,
 (SELECT COALESCE(ROUND(AVG(probability)),0) FROM opportunities WHERE company_id=c.id AND status='open' AND stage='Discovery') AS discovery,
 (SELECT COALESCE(ROUND(AVG(probability)),0) FROM opportunities WHERE company_id=c.id AND status='open' AND stage='Evaluation') AS evaluation,
 (SELECT COALESCE(ROUND(AVG(probability)),0) FROM opportunities WHERE company_id=c.id AND status='open' AND stage='Procurement') AS procurement
 FROM companies c JOIN users u ON u.id=c.owner_id`;
function present(row: CompanyRow): Company {
  const activityByDay = JSON.parse(row.activity_json || "[]") as NonNullable<
    Company["activityByDay"]
  >;
  const today = Date.now();
  return {
    id: row.id,
    name: row.name,
    website: row.website,
    description: row.description,
    industry: row.industry,
    segment: row.segment,
    stage: row.stage,
    ownerId: row.owner_id,
    owner: row.owner_name,
    logo: row.logo_url ?? undefined,
    tags: [
      ...new Set([
        row.segment,
        row.stage,
        ...JSON.parse(row.tags_json || "[]"),
      ]),
    ],
    openDeals: row.open_deals,
    pipelineValue: row.pipeline_value,
    winProbability: row.win_probability,
    lastInteraction: {
      date: row.last_date?.slice(0, 10) || "",
      label: row.last_subject || "No interactions",
    },
    activityDays: Math.max(
      0,
      Math.floor(
        (today - Date.parse(row.last_date || row.created_at)) / 86400000,
      ),
    ),
    trend: Array.from({ length: 14 }, (_, i) => {
      const day = new Date(today - (13 - i) * 86400000)
        .toISOString()
        .slice(0, 10);
      return activityByDay
        .filter((a) => a.day === day)
        .reduce((n, a) => n + a.count, 0);
    }),
    activityByDay,
    contactCount: row.contact_count,
    taskCount: row.task_count,
    health: {
      discovery: row.discovery,
      evaluation: row.evaluation,
      procurement: row.procurement,
    },
    archivedAt: row.archived_at,
  };
}
function provided<T extends object>(parsed: T, raw: unknown): T {
  // Zod defaults apply to omitted optional fields; PATCH must preserve omitted columns.
  return Object.fromEntries(
    Object.entries(parsed).filter(([key]) => Object.hasOwn(raw as object, key)),
  ) as T;
}
// SQL identifiers are fixed in this module. All user-controlled values are bound parameters.
export class CrmRepository {
  constructor(
    readonly db: D1Database,
    readonly user: User,
  ) {}
  async owners(): Promise<(Owner & { id: string })[]> {
    const { results } = await this.db
      .prepare(
        "SELECT id,display_name,email,avatar_url FROM users WHERE id=? OR managed_by=? ORDER BY display_name",
      )
      .bind(this.user.id, this.user.id)
      .all<Pick<User, "id" | "display_name" | "email" | "avatar_url">>();
    return results
      .sort(
        (a, b) => Number(b.id === this.user.id) - Number(a.id === this.user.id),
      )
      .map((u) => ({
        id: u.id,
        name: u.display_name,
        email: u.email,
        avatar: u.avatar_url || "/assets/images/_common/avatar-placeholder.svg",
        phone: "",
        role:
          u.id === this.user.id ? "Personal CRM owner" : "Demo account owner",
      }));
  }
  async owned(id: string, includeArchived = false) {
    idSchema.parse(id);
    const found = await this.db
      .prepare(
        `SELECT id FROM companies WHERE id=? AND account_id=? ${includeArchived ? "" : "AND archived_at IS NULL"}`,
      )
      .bind(id, this.user.id)
      .first();
    if (!found) throw new HttpError(404, "Company not found");
  }
  async validOwner(id: string) {
    const owner = await this.db
      .prepare("SELECT id FROM users WHERE id=? AND (id=? OR managed_by=?)")
      .bind(id, this.user.id, this.user.id)
      .first();
    if (!owner) throw new HttpError(400, "Owner is not part of your account");
  }
  async company(id: string) {
    const row = await this.db
      .prepare(`${summarySql} WHERE c.id=? AND c.account_id=?`)
      .bind(idSchema.parse(id), this.user.id)
      .first<CompanyRow>();
    if (!row) throw new HttpError(404, "Company not found");
    return present(row);
  }
  async list(raw: unknown) {
    const q = listSchema.parse(raw);
    const where = [
      "c.account_id=?",
      q.archived === "true"
        ? "c.archived_at IS NOT NULL"
        : "c.archived_at IS NULL",
    ];
    const values: (string | number)[] = [this.user.id];
    if (q.search) {
      where.push("(c.name LIKE ? ESCAPE '\\' OR c.website LIKE ? ESCAPE '\\')");
      const v = `%${q.search.replace(/[\\%_]/g, "\\$&")}%`;
      values.push(v, v);
    }
    if (q.owner !== "all") {
      where.push("u.display_name=?");
      values.push(q.owner);
    }
    if (q.stage !== "any") {
      where.push(
        "(c.stage=? OR c.segment=? OR EXISTS (SELECT 1 FROM company_tags ct JOIN tags t ON t.id=ct.tag_id WHERE ct.company_id=c.id AND t.name=?))",
      );
      values.push(q.stage, q.stage, q.stage);
    }
    if (q.days) {
      where.push(
        "COALESCE((SELECT MAX(occurred_at) FROM interactions WHERE company_id=c.id),c.created_at)>=?",
      );
      values.push(new Date(Date.now() - q.days * 86400000).toISOString());
    }
    const sorts = {
      name: "c.name COLLATE NOCASE ASC",
      pipelineValue: "c.pipeline_value DESC",
      openDeals: "open_deals DESC",
      winProbability: "c.win_probability DESC",
      lastInteraction: "last_date DESC",
    };
    const filter = where.join(" AND ");
    const count = await this.db
      .prepare(
        `SELECT COUNT(*) AS total FROM companies c JOIN users u ON u.id=c.owner_id WHERE ${filter}`,
      )
      .bind(...values)
      .first<{ total: number }>();
    const { results } = await this.db
      .prepare(
        `${summarySql} WHERE ${filter} ORDER BY ${sorts[q.sort]},c.id LIMIT ? OFFSET ?`,
      )
      .bind(...values, q.limit, (q.page - 1) * q.limit)
      .all<CompanyRow>();
    return {
      items: results.map(present),
      total: count?.total || 0,
      page: q.page,
      limit: q.limit,
    };
  }
  private tagStatements(companyId: string, tags: string[]) {
    const unique = [...new Set(tags)];
    return [
      this.db
        .prepare("DELETE FROM company_tags WHERE company_id=?")
        .bind(companyId),
      ...unique.flatMap((name) => [
        this.db
          .prepare(
            "INSERT INTO tags (id,account_id,name) VALUES (?,?,?) ON CONFLICT(account_id,name) DO NOTHING",
          )
          .bind(crypto.randomUUID(), this.user.id, name),
        this.db
          .prepare(
            "INSERT INTO company_tags (company_id,tag_id) SELECT ?,id FROM tags WHERE account_id=? AND name=?",
          )
          .bind(companyId, this.user.id, name),
      ]),
    ];
  }
  async createCompany(raw: unknown) {
    const c = companySchema.parse(raw);
    const id = crypto.randomUUID();
    const owner = c.owner_id || this.user.id;
    await this.validOwner(owner);
    const statements = [
      this.db
        .prepare(
          "INSERT INTO companies (id,account_id,name,website,description,industry,segment,stage,owner_id,logo_url) VALUES (?,?,?,?,?,?,?,?,?,?)",
        )
        .bind(
          id,
          this.user.id,
          c.name,
          c.website,
          c.description,
          c.industry,
          c.segment,
          c.stage,
          owner,
          c.logo_url,
        ),
      ...this.tagStatements(id, c.tags),
    ];
    // The original create dialog's aggregate fields initialize concrete opportunities.
    const deals = c.open_deals || (c.pipeline_value > 0 ? 1 : 0);
    for (let i = 0; i < deals; i++)
      statements.push(
        this.db
          .prepare(
            "INSERT INTO opportunities (id,company_id,name,value,probability) VALUES (?,?,?,?,?)",
          )
          .bind(
            crypto.randomUUID(),
            id,
            `${c.name} opportunity${deals > 1 ? ` ${i + 1}` : ""}`,
            (Math.floor((c.pipeline_value * 100) / deals) +
              (i === deals - 1
                ? Math.round(c.pipeline_value * 100) % deals
                : 0)) /
              100,
            c.win_probability,
          ),
      );
    if (c.interaction_date && c.interaction_subject)
      statements.push(
        this.db
          .prepare(
            "INSERT INTO interactions (id,company_id,user_id,type,subject,occurred_at) VALUES (?,?,?,?,?,?)",
          )
          .bind(
            crypto.randomUUID(),
            id,
            this.user.id,
            "other",
            c.interaction_subject,
            `${c.interaction_date}T12:00:00.000Z`,
          ),
      );
    await this.db.batch(statements);
    return this.company(id);
  }
  async updateCompany(id: string, raw: unknown) {
    const c = provided(companyPatchSchema.parse(raw), raw);
    await this.owned(id, true);
    if (c.owner_id) await this.validOwner(c.owner_id);
    const fields: string[] = [];
    const values: (string | number | null)[] = [];
    for (const key of [
      "name",
      "website",
      "description",
      "industry",
      "segment",
      "stage",
      "owner_id",
      "logo_url",
    ] as const)
      if (c[key] !== undefined) {
        fields.push(`${key}=?`);
        values.push(c[key]!);
      }
    if (c.archived !== undefined) {
      fields.push("archived_at=?");
      values.push(c.archived ? new Date().toISOString() : null);
    }
    const statements = [
      this.db
        .prepare(
          `UPDATE companies SET ${fields.length ? fields.join(",") + "," : ""}updated_at=strftime('%Y-%m-%dT%H:%M:%fZ','now') WHERE id=? AND account_id=?`,
        )
        .bind(...values, id, this.user.id),
    ];
    if (c.tags) statements.push(...this.tagStatements(id, c.tags));
    await this.db.batch(statements);
    return this.company(id);
  }
  async allEntities(kind: EntityKind, page: number) {
    const order = {
      contacts: "r.full_name",
      interactions: "r.occurred_at DESC",
      tasks: "r.completed_at ASC,r.due_at ASC",
      opportunities: "r.status,r.stage,r.value DESC",
    }[kind];
    const { results } = await this.db
      .prepare(
        `SELECT r.*,c.name AS company_name FROM ${kind} r JOIN companies c ON c.id=r.company_id WHERE c.account_id=? AND c.archived_at IS NULL ORDER BY ${order},r.id LIMIT 100 OFFSET ?`,
      )
      .bind(this.user.id, (page - 1) * 100)
      .all();
    return { items: results };
  }
  async entities<K extends EntityKind>(
    kind: K,
    companyId: string,
    page = 1,
  ): Promise<EntityMap[K][]> {
    await this.owned(companyId, true);
    const order = {
      contacts: "full_name",
      interactions: "occurred_at DESC,id",
      tasks: "completed_at ASC,due_at ASC,id",
      opportunities: "created_at DESC,id",
    }[kind];
    const { results } = await this.db
      .prepare(
        `SELECT * FROM ${kind} WHERE company_id=? ORDER BY ${order} LIMIT 100 OFFSET ?`,
      )
      .bind(companyId, (page - 1) * 100)
      .all<EntityMap[K]>();
    return results;
  }
  async saveEntity<K extends EntityKind>(
    kind: K,
    companyId: string,
    raw: unknown,
    id?: string,
  ) {
    await this.owned(companyId);
    const schema = entitySchemas[kind];
    const parsed = id
      ? provided(schema.partial().parse(raw), raw)
      : schema.parse(raw);
    const values: Record<string, string | number | null> = { ...parsed };
    if ("contact_id" in values && values.contact_id) {
      if (
        !(await this.db
          .prepare("SELECT id FROM contacts WHERE id=? AND company_id=?")
          .bind(values.contact_id, companyId)
          .first())
      )
        throw new HttpError(400, "Contact must belong to this company");
    }
    if (kind === "tasks") {
      if (!id && !values.assigned_to) values.assigned_to = this.user.id;
      if (values.assigned_to) await this.validOwner(String(values.assigned_to));
    }
    if (id) {
      idSchema.parse(id);
      if (
        !(await this.db
          .prepare(`SELECT id FROM ${kind} WHERE id=? AND company_id=?`)
          .bind(id, companyId)
          .first())
      )
        throw new HttpError(404, "Record not found");
      if (["contacts", "opportunities"].includes(kind))
        values.updated_at = new Date().toISOString();
      const keys = Object.keys(values);
      if (keys.length)
        await this.db
          .prepare(
            `UPDATE ${kind} SET ${keys.map((k) => `${k}=?`).join(",")} WHERE id=? AND company_id=?`,
          )
          .bind(...Object.values(values), id, companyId)
          .run();
    } else {
      id = crypto.randomUUID();
      values.id = id;
      values.company_id = companyId;
      if (kind === "interactions") values.user_id = this.user.id;
      const keys = Object.keys(values);
      await this.db
        .prepare(
          `INSERT INTO ${kind} (${keys.join(",")}) VALUES (${keys.map(() => "?").join(",")})`,
        )
        .bind(...Object.values(values))
        .run();
    }
    return this.db
      .prepare(`SELECT * FROM ${kind} WHERE id=? AND company_id=?`)
      .bind(id, companyId)
      .first<EntityMap[K]>();
  }
  async deleteEntity(kind: EntityKind, companyId: string, id: string) {
    await this.owned(companyId);
    idSchema.parse(id);
    const result = await this.db
      .prepare(`DELETE FROM ${kind} WHERE id=? AND company_id=?`)
      .bind(id, companyId)
      .run();
    if (!result.meta.changes) throw new HttpError(404, "Record not found");
  }
  async detail(id: string) {
    const company = await this.company(id);
    const [contacts, interactions, tasks, opportunities] = await Promise.all([
      this.entities("contacts", id),
      this.entities("interactions", id),
      this.entities("tasks", id),
      this.entities("opportunities", id),
    ]);
    return { company, contacts, interactions, tasks, opportunities };
  }
  async notifications(): Promise<Notification[]> {
    const { results } = await this.db
      .prepare(
        `SELECT t.id,t.company_id,t.title,t.due_at,c.name,r.read_at FROM tasks t JOIN companies c ON c.id=t.company_id LEFT JOIN notification_reads r ON r.task_id=t.id AND r.user_id=? WHERE c.account_id=? AND c.archived_at IS NULL AND t.completed_at IS NULL AND t.due_at<=strftime('%Y-%m-%dT23:59:59.999Z','now','+7 days') ORDER BY t.due_at LIMIT 100`,
      )
      .bind(this.user.id, this.user.id)
      .all<{
        id: string;
        company_id: string;
        title: string;
        due_at: string;
        name: string;
        read_at: string | null;
      }>();
    return results.map((t) => ({
      id: t.id,
      kind: "alert",
      companyId: t.company_id,
      message: `${t.title} · ${t.name}`,
      time: new Date(t.due_at).toISOString().slice(0, 10),
      unread: !t.read_at,
    }));
  }
  async readNotifications(ids: string[]) {
    if (!ids.length) return;
    await this.db.batch(
      ids.map((id) =>
        this.db
          .prepare(
            `INSERT INTO notification_reads(user_id,task_id) SELECT ?,t.id FROM tasks t JOIN companies c ON c.id=t.company_id WHERE t.id=? AND c.account_id=? ON CONFLICT(user_id,task_id) DO NOTHING`,
          )
          .bind(this.user.id, idSchema.parse(id), this.user.id),
      ),
    );
  }
}
export type { Contact, Interaction, Task, Opportunity };
