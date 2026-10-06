import { beforeEach, afterEach, describe, expect, it } from "vitest";
import { DatabaseSync } from "node:sqlite";
import { readFileSync } from "node:fs";
import { CrmRepository } from "../lib/db/repository";
import {
  companySchema,
  companyPatchSchema,
  contactSchema,
  interactionSchema,
  urlSchema,
  logoSchema,
} from "../lib/server/validation";
import { filterCompanies, DEFAULT_FILTERS } from "../lib/companies";
import { toCsv } from "../lib/csv";
import type { User } from "../lib/crm-types";
// Exercise production SQL and migrations on SQLite. Runtime D1 is additionally smoke-tested via Wrangler.
function sqliteD1(sqlite: DatabaseSync): D1Database {
  const prepare = (sql: string) => {
    let params: (string | number | null)[] = [];
    const stmt = {
      bind(...v: typeof params) {
        params = v;
        return stmt;
      },
      async first() {
        return sqlite.prepare(sql).get(...params) || null;
      },
      async all() {
        return { results: sqlite.prepare(sql).all(...params) };
      },
      async run() {
        const r = sqlite.prepare(sql).run(...params);
        return { success: true, meta: { changes: Number(r.changes) } };
      },
    };
    return stmt;
  };
  return {
    prepare,
    async batch(statements: { run: () => Promise<unknown> }[]) {
      sqlite.exec("BEGIN");
      try {
        const result = [];
        for (const stmt of statements) result.push(await stmt.run());
        sqlite.exec("COMMIT");
        return result;
      } catch (e) {
        sqlite.exec("ROLLBACK");
        throw e;
      }
    },
  } as unknown as D1Database;
}
const user: User = {
  id: "user-one",
  email: "one@example.com",
  display_name: "One",
  avatar_url: null,
  created_at: "",
  updated_at: "",
};
let sqlite: DatabaseSync;
let db: D1Database;
let repo: CrmRepository;
beforeEach(() => {
  sqlite = new DatabaseSync(":memory:");
  sqlite.exec(
    readFileSync(
      new URL("../migrations/0001_crm.sql", import.meta.url),
      "utf8",
    ),
  );
  sqlite
    .prepare("INSERT INTO users(id,email,display_name) VALUES (?,?,?)")
    .run(user.id, user.email, user.display_name);
  sqlite
    .prepare("INSERT INTO users(id,email,display_name) VALUES (?,?,?)")
    .run("user-two", "two@example.com", "Two");
  db = sqliteD1(sqlite);
  repo = new CrmRepository(db, user);
});
afterEach(() => sqlite.close());
describe("persistent CRM records", () => {
  it("creates and modifies a company, and derives pipeline from opportunities", async () => {
    const c = await repo.createCompany({
      name: "Acme",
      open_deals: 2,
      pipeline_value: 2000,
      win_probability: 40,
    });
    expect(c.pipelineValue).toBe(2000);
    expect(c.openDeals).toBe(2);
    await repo.updateCompany(c.id, {
      name: "Acme Inc",
      website: "https://acme.example",
      tags: ["Founder"],
    });
    const reloaded = await new CrmRepository(db, user).company(c.id);
    expect(reloaded.name).toBe("Acme Inc");
    expect(reloaded.tags).toContain("Founder");
    const deals = await repo.entities("opportunities", c.id);
    await repo.saveEntity(
      "opportunities",
      c.id,
      { value: 3000, probability: 80 },
      deals[0].id,
    );
    expect((await repo.company(c.id)).pipelineValue).toBe(4000);
    expect((await repo.company(c.id)).winProbability).toBe(70);
  });
  it("preserves fields when patching only one field", async () => {
    const c = await repo.createCompany({
      name: "Acme",
      website: "https://acme.example",
      segment: "Enterprise",
    });
    await repo.updateCompany(c.id, { description: "Updated" });
    expect((await repo.company(c.id)).website).toBe("https://acme.example");
    const t = await repo.saveEntity("tasks", c.id, {
      title: "Follow up",
      priority: "high",
      due_at: "2026-10-10T12:00:00.000Z",
    });
    await repo.saveEntity(
      "tasks",
      c.id,
      { completed_at: "2026-10-11T12:00:00.000Z" },
      t!.id,
    );
    expect((await repo.entities("tasks", c.id))[0].priority).toBe("high");
  });
  it("persists contacts and their interaction timeline", async () => {
    const c = await repo.createCompany({ name: "Acme" });
    const contact = await repo.saveEntity("contacts", c.id, {
      full_name: "Sarah",
      email: "sarah@example.com",
      notes: "Plain text <script>test</script>",
    });
    await repo.saveEntity("contacts", c.id, { role: "Founder" }, contact!.id);
    const activity = await repo.saveEntity("interactions", c.id, {
      contact_id: contact!.id,
      type: "call",
      subject: "Introduction",
      occurred_at: new Date().toISOString(),
    });
    const detail = await new CrmRepository(db, user).detail(c.id);
    expect(detail.contacts[0].role).toBe("Founder");
    expect(detail.interactions[0].id).toBe(activity!.id);
    expect(detail.company.activityByDay?.[0].count).toBe(1);
  });
  it("persists follow-ups, notification reads, and completion", async () => {
    const c = await repo.createCompany({ name: "Acme" });
    const t = await repo.saveEntity("tasks", c.id, {
      title: "Follow up with Sarah",
      due_at: new Date().toISOString(),
    });
    expect((await repo.notifications())[0].unread).toBe(true);
    await repo.readNotifications([t!.id]);
    expect((await repo.notifications())[0].unread).toBe(false);
    await repo.saveEntity(
      "tasks",
      c.id,
      { completed_at: new Date().toISOString() },
      t!.id,
    );
    expect(await repo.notifications()).toEqual([]);
  });
  it("rejects cross-user reads, edits, assignment and child record access", async () => {
    const c = await repo.createCompany({ name: "Private" });
    const other = new CrmRepository(db, { ...user, id: "user-two" });
    expect((await other.list({})).items).toEqual([]);
    await expect(other.company(c.id)).rejects.toThrow("not found");
    await expect(other.updateCompany(c.id, { name: "Stolen" })).rejects.toThrow(
      "not found",
    );
    await expect(
      other.saveEntity("contacts", c.id, { full_name: "No" }),
    ).rejects.toThrow("not found");
    await expect(
      repo.updateCompany(c.id, { owner_id: "user-two" }),
    ).rejects.toThrow("not part");
  });
  it("rejects contact IDs from a different company", async () => {
    const a = await repo.createCompany({ name: "A" });
    const b = await repo.createCompany({ name: "B" });
    const contact = await repo.saveEntity("contacts", a.id, {
      full_name: "Sarah",
    });
    await expect(
      repo.saveEntity("interactions", b.id, {
        contact_id: contact!.id,
        type: "note",
        subject: "No",
        occurred_at: new Date().toISOString(),
      }),
    ).rejects.toThrow("belong");
    expect(() =>
      sqlite
        .prepare(
          "INSERT INTO tasks(id,company_id,contact_id,assigned_to,title) VALUES(?,?,?,?,?)",
        )
        .run("bad", b.id, contact!.id, user.id, "No"),
    ).toThrow("belong");
  });
  it("filters, searches literally, sorts and paginates without SQL injection", async () => {
    await repo.createCompany({
      name: "O'Reilly %",
      segment: "Enterprise",
      stage: "Pilot",
    });
    await repo.createCompany({ name: "Beta", segment: "SMB" });
    expect((await repo.list({ search: "O'Reilly %" })).total).toBe(1);
    expect((await repo.list({ search: "' OR 1=1 --" })).total).toBe(0);
    expect((await repo.list({ stage: "Pilot" })).total).toBe(1);
    expect(
      (await repo.list({ sort: "name", limit: 1, page: 1 })).items[0].name,
    ).toBe("Beta");
    expect(
      (await repo.list({ sort: "name", limit: 1, page: 2 })).items[0].name,
    ).toBe("O'Reilly %");
    await expect(repo.list({ sort: "DROP TABLE users" })).rejects.toThrow();
  });
  it("archives and restores without deleting child records", async () => {
    const c = await repo.createCompany({ name: "Archive" });
    await repo.saveEntity("contacts", c.id, { full_name: "Sarah" });
    await repo.updateCompany(c.id, { archived: true });
    expect((await repo.list({})).total).toBe(0);
    expect((await repo.list({ archived: "true" })).total).toBe(1);
    await expect(
      repo.saveEntity("contacts", c.id, { full_name: "No" }),
    ).rejects.toThrow("not found");
    await repo.updateCompany(c.id, { archived: false });
    expect((await repo.detail(c.id)).contacts).toHaveLength(1);
  });
  it("preserves client filtering and safe CSV export", async () => {
    const c = await repo.createCompany({ name: "Acme" });
    expect(
      filterCompanies([c], { ...DEFAULT_FILTERS, owner: "Nobody" }),
    ).toEqual([]);
    expect(filterCompanies([c], DEFAULT_FILTERS)).toHaveLength(1);
    expect(toCsv([["=1+1", "a,b"]])).toBe(`'=1+1,"a,b"`);
  });
});
describe("input validation", () => {
  it("rejects unsafe URLs, SVG uploads, malformed email and unbounded values", () => {
    for (const url of [
      "javascript:alert(1)",
      "data:text/html,test",
      "https://user:password@example.com",
    ])
      expect(urlSchema.safeParse(url).success).toBe(false);
    expect(logoSchema.safeParse("data:image/svg+xml;base64,abcd").success).toBe(
      false,
    );
    expect(
      contactSchema.safeParse({ full_name: "Sarah", email: "bad" }).success,
    ).toBe(false);
    expect(
      companySchema.safeParse({ name: "Acme", win_probability: 101 }).success,
    ).toBe(false);
    expect(
      companySchema.safeParse({ name: "Acme", pipeline_value: -1 }).success,
    ).toBe(false);
    expect(
      companyPatchSchema.safeParse({ account_id: "user-two" }).success,
    ).toBe(false);
    expect(
      interactionSchema.safeParse({
        subject: "Test",
        type: "unknown",
        occurred_at: "not a date",
      }).success,
    ).toBe(false);
  });
});
