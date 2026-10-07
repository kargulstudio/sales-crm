export function parseCsv(text: string): Record<string, string>[] {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let quoted = false;
  const source = text.replace(/^﻿/, "");

  for (let i = 0; i < source.length; i++) {
    const char = source[i];
    if (quoted) {
      if (char === '"' && source[i + 1] === '"') {
        cell += '"';
        i++;
      } else if (char === '"') {
        quoted = false;
      } else {
        cell += char;
      }
    } else if (char === '"') {
      quoted = true;
    } else if (char === ",") {
      row.push(cell);
      cell = "";
    } else if (char === "\n" || char === "\r") {
      if (char === "\r" && source[i + 1] === "\n") i++;
      row.push(cell);
      rows.push(row);
      row = [];
      cell = "";
    } else {
      cell += char;
    }
  }
  if (cell || row.length) {
    row.push(cell);
    rows.push(row);
  }

  const [header = [], ...body] = rows.filter((cells) =>
    cells.some((value) => value.trim()),
  );
  return body.map((cells) =>
    Object.fromEntries(
      header.map((key, index) => [key.trim(), (cells[index] ?? "").trim()]),
    ),
  );
}

const COLUMN_ALIASES: Record<string, string> = {
  id: "id",
  company: "name",
  "company name": "name",
  name: "name",
  owner: "owner",
  "account owner": "owner",
  tags: "tags",
  "segment & stage": "tags",
  "open deals": "openDeals",
  opendeals: "openDeals",
  "pipeline value": "pipelineValue",
  pipelinevalue: "pipelineValue",
  value: "pipelineValue",
  "win probability (%)": "winProbability",
  "win probability": "winProbability",
  winprobability: "winProbability",
  "last interaction date": "lastInteractionDate",
  "last interaction": "lastInteractionLabel",
  logo: "logo",
};

function unquoteFormula(value: string) {
  return /^'[=+\-@]/.test(value) ? value.slice(1) : value;
}

export function csvRowsToCompanies(rows: Record<string, string>[]) {
  const ignored = new Set<string>();
  const companies = rows.map((row) => {
    const company: Record<string, unknown> = {};
    let date: string | undefined;
    let label: string | undefined;
    for (const [column, raw] of Object.entries(row)) {
      const field = COLUMN_ALIASES[column.toLowerCase()];
      const value = unquoteFormula(raw);
      if (!field) {
        ignored.add(column);
        continue;
      }
      if (!value) continue;
      if (field === "tags") {
        company.tags = value
          .split(/[;|]/)
          .map((tag) => tag.trim())
          .filter(Boolean);
      } else if (field === "lastInteractionDate") {
        date = value;
      } else if (field === "lastInteractionLabel") {
        label = value;
      } else {
        company[field] = value;
      }
    }
    if (label) company.lastInteraction = { label, ...(date ? { date } : {}) };
    return company;
  });
  return { companies, ignoredColumns: [...ignored] };
}
