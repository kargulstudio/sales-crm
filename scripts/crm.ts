import { readFileSync } from "node:fs";
import * as z from "zod";
import { csvRowsToCompanies, parseCsv } from "@/lib/crm/csv-import";
import {
  CRM_OPERATIONS,
  findOperation,
  runCrmOperation,
} from "@/lib/crm/operations";
import { CrmError } from "@/lib/crm/service";

const USAGE = `Usage: npm run -s crm -- <command> [--field value ...] [options]

Options:
  --json '<object>'     Input as a JSON object (merged with --field flags)
  --input <file>        Read input from a .json file, or a .csv file of companies (for import_companies)
  --pick <key>          Print one key of the result raw (e.g. --pick csv)
  --url <url>           Call a running app instead of the local data files (or set CRM_URL)
                        Sends CRM_API_TOKEN as a bearer token when set

Field flags: values are parsed as JSON when possible, so --tags '["Enterprise","Pilot"]',
--winProbability 70 and --dryRun true work. Dotted flags nest: --set.owner "Kate Chen".
CRM_WORKSPACE sets the default workspace.

Run "npm run -s crm -- help <command>" for a command's fields.`;

function parseValue(raw: string): unknown {
  try {
    return JSON.parse(raw);
  } catch {
    return raw;
  }
}

function assign(target: Record<string, unknown>, path: string, value: unknown) {
  const keys = path.split(".");
  let node = target;
  for (const key of keys.slice(0, -1)) {
    node[key] ??= {};
    node = node[key] as Record<string, unknown>;
  }
  const last = keys[keys.length - 1];
  if (last in node) {
    const existing = node[last];
    node[last] = Array.isArray(existing)
      ? [...existing, value]
      : [existing, value];
  } else {
    node[last] = value;
  }
}

function readInputFile(file: string, command: string): Record<string, unknown> {
  const text = readFileSync(file, "utf8");
  if (file.toLowerCase().endsWith(".csv")) {
    const { companies, ignoredColumns } = csvRowsToCompanies(parseCsv(text));
    if (ignoredColumns.length) {
      console.error(`Ignored CSV columns: ${ignoredColumns.join(", ")}`);
    }
    return { companies };
  }
  const data = JSON.parse(text);
  if (Array.isArray(data)) {
    if (command !== "import_companies") {
      throw new CrmError(
        "A JSON array input only works with import_companies.",
      );
    }
    return { companies: data };
  }
  return data;
}

function describeCommand(name: string) {
  const operation = findOperation(name);
  if (!operation) throw new CrmError(`Unknown command "${name}".`);
  const schema = z.toJSONSchema(operation.input, { io: "input" }) as {
    properties?: Record<
      string,
      { description?: string; type?: string; enum?: unknown[] }
    >;
    required?: string[];
  };
  const lines = [`${operation.name} — ${operation.description}`, ""];
  for (const [key, field] of Object.entries(schema.properties ?? {})) {
    const required = schema.required?.includes(key) ? " (required)" : "";
    const type = field.enum ? field.enum.join("|") : (field.type ?? "object");
    lines.push(
      `  --${key} <${type}>${required}${field.description ? `  ${field.description}` : ""}`,
    );
  }
  return lines.join("\n");
}

async function callRemote(url: string, command: string, input: unknown) {
  const response = await fetch(`${url.replace(/\/$/, "")}/api/crm/${command}`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-crm-actor": "cli",
      ...(process.env.CRM_API_TOKEN
        ? { authorization: `Bearer ${process.env.CRM_API_TOKEN}` }
        : {}),
    },
    body: JSON.stringify(input),
  });
  const body = await response
    .json()
    .catch(() => ({ error: response.statusText }));
  if (!response.ok) throw new CrmError(body.error ?? `HTTP ${response.status}`);
  return body;
}

async function main(argv: string[]) {
  const [rawCommand, ...rest] = argv;
  if (!rawCommand || rawCommand === "help" || rawCommand === "--help") {
    if (rest[0]) {
      console.log(describeCommand(rest[0]));
      return;
    }
    console.log(USAGE, "\n\nCommands:");
    for (const operation of CRM_OPERATIONS) {
      console.log(`  ${operation.name.padEnd(22)} ${operation.title}`);
    }
    return;
  }

  const command = rawCommand.replace(/-/g, "_");
  if (!findOperation(command))
    throw new CrmError(`Unknown command "${rawCommand}". Run "help".`);

  let input: Record<string, unknown> = {};
  let pick: string | undefined;
  let url = process.env.CRM_URL;

  for (let i = 0; i < rest.length; i++) {
    const flag = rest[i];
    if (!flag.startsWith("--"))
      throw new CrmError(`Unexpected argument "${flag}".`);
    const key = flag.slice(2);
    if (key === "help") {
      console.log(describeCommand(command));
      return;
    }
    const value = rest[i + 1];
    if (value === undefined || value.startsWith("--")) {
      assign(input, key, true);
      continue;
    }
    i++;
    if (key === "json") input = { ...input, ...JSON.parse(value) };
    else if (key === "input")
      input = { ...input, ...readInputFile(value, command) };
    else if (key === "pick") pick = value;
    else if (key === "url") url = value;
    else assign(input, key, parseValue(value));
  }

  if (input.workspace === undefined && process.env.CRM_WORKSPACE) {
    input.workspace = process.env.CRM_WORKSPACE;
  }

  const result = url
    ? await callRemote(url, command, input)
    : await runCrmOperation(command, input, { actor: "cli" });

  if (pick) {
    const value = (result as Record<string, unknown>)[pick];
    console.log(
      typeof value === "string" ? value : JSON.stringify(value, null, 2),
    );
    return;
  }
  console.log(JSON.stringify(result, null, 2));
}

main(process.argv.slice(2)).catch((error) => {
  console.error(error instanceof CrmError ? error.message : error);
  process.exit(1);
});
