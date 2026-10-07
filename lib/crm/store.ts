import { mkdir, readFile, rename, rm, stat, writeFile } from "node:fs/promises";
import { join, resolve } from "node:path";
import type { Company } from "@/data/companies";

export type CrmActor = "ui" | "mcp" | "cli" | "api";

export type CrmActivity = {
  id: string;
  at: string;
  actor: CrmActor;
  operation: string;
  companyId?: string;
  summary: string;
};

export type WorkspaceState = {
  revision: number;
  added: Company[];
  patches: Record<string, Partial<Company>>;
  deleted: string[];
  activity: CrmActivity[];
};

export interface CrmStore {
  read(workspaceId: string): Promise<WorkspaceState>;
  update<T>(
    workspaceId: string,
    change: (state: WorkspaceState) => T,
  ): Promise<T>;
}

const ACTIVITY_LIMIT = 500;
const LOCK_TIMEOUT_MS = 10_000;
const LOCK_STALE_MS = 30_000;

function emptyState(): WorkspaceState {
  return { revision: 0, added: [], patches: {}, deleted: [], activity: [] };
}

function sleep(ms: number) {
  return new Promise((done) => setTimeout(done, ms));
}

export class FileCrmStore implements CrmStore {
  private queue: Promise<unknown> = Promise.resolve();

  constructor(private readonly directory: string) {}

  private file(workspaceId: string) {
    if (!/^[a-z0-9-]+$/i.test(workspaceId)) {
      throw new Error(`Invalid workspace id "${workspaceId}"`);
    }
    return join(this.directory, `${workspaceId}.json`);
  }

  async read(workspaceId: string): Promise<WorkspaceState> {
    try {
      const raw = await readFile(this.file(workspaceId), "utf8");
      return { ...emptyState(), ...JSON.parse(raw) };
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === "ENOENT") return emptyState();
      throw error;
    }
  }

  update<T>(
    workspaceId: string,
    change: (state: WorkspaceState) => T,
  ): Promise<T> {
    const run = this.queue.then(() => this.locked(workspaceId, change));
    this.queue = run.catch(() => undefined);
    return run;
  }

  private async locked<T>(
    workspaceId: string,
    change: (state: WorkspaceState) => T,
  ): Promise<T> {
    const file = this.file(workspaceId);
    const lock = `${file}.lock`;
    await mkdir(this.directory, { recursive: true });
    await this.acquire(lock);
    try {
      const state = await this.read(workspaceId);
      const before = JSON.stringify(state);
      const result = change(state);
      if (JSON.stringify(state) !== before) {
        state.revision += 1;
        state.activity = state.activity.slice(-ACTIVITY_LIMIT);
        const temp = `${file}.${process.pid}.tmp`;
        await writeFile(temp, JSON.stringify(state, null, 2));
        await rename(temp, file);
      }
      return result;
    } finally {
      await rm(lock, { recursive: true, force: true });
    }
  }

  private async acquire(lock: string) {
    const started = Date.now();
    for (;;) {
      try {
        await mkdir(lock);
        return;
      } catch (error) {
        if ((error as NodeJS.ErrnoException).code !== "EEXIST") throw error;
        const info = await stat(lock).catch(() => null);
        if (info && Date.now() - info.mtimeMs > LOCK_STALE_MS) {
          await rm(lock, { recursive: true, force: true });
          continue;
        }
        if (Date.now() - started > LOCK_TIMEOUT_MS) {
          throw new Error(`Timed out waiting for the CRM store lock at ${lock}`);
        }
        await sleep(25);
      }
    }
  }
}

let store: CrmStore | null = null;

export function crmDataDirectory() {
  const configured = process.env.CRM_DATA_DIR;
  if (configured) return resolve(/*turbopackIgnore: true*/ configured);
  return join(process.cwd(), "data", "store");
}

export function getCrmStore(): CrmStore {
  store ??= new FileCrmStore(crmDataDirectory());
  return store;
}
