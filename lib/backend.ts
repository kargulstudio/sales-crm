import type { Company } from "@/data/companies";

export type CompanyPatchInput = {
  name?: string;
  domain?: string | null;
  tags?: string[];
  owner?: string;
  openDeals?: number;
  pipelineValue?: number;
  winProbability?: number;
};

export type StoredCompany = Omit<Company, "id" | "tags"> & {
  slug: string;
  tags: string[];
  position: number;
};

export type StoredNote = {
  companySlug: string;
  body: string;
  author: string;
  authorId?: string;
  at: string;
};

type ChangeReceipt = { previous: CompanyPatchInput; changeIds: string[] };
type OwnerReceipt = {
  previous: { slug: string; owner: string }[];
  changeIds: string[];
};

export type Backend = {
  add: (company: Company) => Promise<unknown>;
  remove: (slugs: string[]) => Promise<StoredCompany[]>;
  restore: (companies: StoredCompany[]) => Promise<unknown>;
  update: (
    slug: string,
    patch: CompanyPatchInput,
    changes: string[],
  ) => Promise<ChangeReceipt>;
  revert: (receipt: ChangeReceipt & { slug: string }) => Promise<unknown>;
  assignOwner: (slugs: string[], owner: string) => Promise<OwnerReceipt>;
  restoreOwners: (receipt: OwnerReceipt) => Promise<unknown>;
  addNote: (companySlug: string, body: string) => Promise<string>;
  removeNote: (id: string) => Promise<StoredNote | null>;
  restoreNote: (note: StoredNote) => Promise<unknown>;
  onError: (error: unknown) => void;
};

let backend: Backend | null = null;

export function setBackend(next: Backend | null) {
  backend = next;
}

// Fires a write and returns its result; failures are reported once and resolve to undefined.
export function write<T>(
  call: (api: Backend) => Promise<T>,
): Promise<T | undefined> {
  if (!backend) return Promise.resolve(undefined);
  const api = backend;
  return call(api).catch((error: unknown) => {
    api.onError(error);
    return undefined;
  });
}
