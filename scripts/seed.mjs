import { readFileSync, writeFileSync, mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createHash } from "node:crypto";
import { spawnSync } from "node:child_process";
const remote = process.argv.includes("--remote");
const email = (
  process.env.SEED_EMAIL || (remote ? "" : "developer@localhost.test")
).toLowerCase();
if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
  throw new Error(
    "Set SEED_EMAIL to the Access login email when seeding production.",
  );
const fixture = JSON.parse(
  readFileSync(new URL("../seed/demo.json", import.meta.url), "utf8"),
);
const q = (v) =>
  v === null
    ? "NULL"
    : typeof v === "number"
      ? String(v)
      : `'${String(v).replaceAll("'", "''")}'`;
const prefix = createHash("sha256").update(email).digest("hex").slice(0, 16);
const userId = `seed-user-${prefix}`;
const sql = [
  `INSERT INTO users(id,email,display_name) VALUES(${q(userId)},${q(email)},${q(email.split("@")[0])}) ON CONFLICT(email) DO NOTHING;`,
];
const account = `(SELECT id FROM users WHERE email=${q(email)})`;
for (const [i, owner] of fixture.owners.entries())
  sql.push(
    `INSERT OR IGNORE INTO users(id,email,display_name,avatar_url,managed_by) VALUES(${q(`${prefix}-owner-${i}`)},${q(`${prefix}-${i}@demo.invalid`)},${q(owner.name)},${q(owner.avatar)},${account});`,
  );
for (const [ci, c] of fixture.companies.entries()) {
  const segments = ["Enterprise", "Mid-Market", "SMB", "Strategic"];
  const segment = c.tags.find((t) => segments.includes(t)) || "SMB";
  const stage = c.tags.find((t) => !segments.includes(t)) || "New Logo";
  const id = `${prefix}-${c.id}`;
  const ownerIndex = fixture.owners.findIndex((o) => o.name === c.owner);
  const date = new Date(Date.now() - ci * 86400000).toISOString();
  sql.push(
    `INSERT OR IGNORE INTO companies(id,account_id,name,segment,stage,owner_id,logo_url,description) VALUES(${q(id)},${account},${q(c.name)},${q(segment)},${q(stage)},${q(`${prefix}-owner-${ownerIndex}`)},${q(c.logo)},'Optional sample company from the upstream design.');`,
  );
  for (const tag of c.tags) {
    const tid = `${prefix}-tag-${createHash("sha256").update(tag).digest("hex").slice(0, 10)}`;
    sql.push(
      `INSERT OR IGNORE INTO tags(id,account_id,name) VALUES(${q(tid)},${account},${q(tag)});`,
      `INSERT OR IGNORE INTO company_tags(company_id,tag_id) VALUES(${q(id)},${q(tid)});`,
    );
  }
  for (let i = 0; i < c.openDeals; i++)
    sql.push(
      `INSERT OR IGNORE INTO opportunities(id,company_id,name,stage,value,probability) VALUES(${q(`${id}-deal-${i}`)},${q(id)},${q(`${c.name} sample opportunity ${i + 1}`)},${q(["Discovery", "Evaluation", "Procurement"][i % 3])},${q((Math.floor((c.pipelineValue * 100) / c.openDeals) + (i === c.openDeals - 1 ? Math.round(c.pipelineValue * 100) % c.openDeals : 0)) / 100)},${q(c.winProbability)});`,
    );
  sql.push(
    `INSERT OR IGNORE INTO interactions(id,company_id,user_id,type,subject,content,occurred_at) VALUES(${q(`${id}-interaction`)},${q(id)},${account},'call',${q(c.lastInteraction.label)},'Sample interaction from the upstream design.',${q(date)});`,
  );
}
const dir = mkdtempSync(join(tmpdir(), "sales-crm-seed-"));
const file = join(dir, "seed.sql");
writeFileSync(file, sql.join("\n"));
try {
  const result = spawnSync(
    "npx",
    [
      "wrangler",
      "d1",
      "execute",
      "DB",
      remote ? "--remote" : "--local",
      "--file",
      file,
    ],
    { encoding: "utf8" },
  );
  if (result.status) process.stderr.write(result.stderr || result.stdout);
  else
    console.log(
      `Seeded ${fixture.companies.length} sample companies for ${email} (${remote ? "production" : "local"}).`,
    );
  process.exitCode = result.status || 0;
} finally {
  rmSync(dir, { recursive: true, force: true });
}
