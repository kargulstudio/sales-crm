import { ConvexError, v, type Infer } from "convex/values";
import { mutation, query, type MutationCtx } from "./_generated/server";
import type { Doc, Id } from "./_generated/dataModel";
import { companyFields } from "./schema";
import { requireViewer } from "./auth";

// Convex documents are capped at 1 MiB; uploaded logos are data URLs.
const MAX_LOGO_LENGTH = 512 * 1024;

const company = v.object(companyFields);
type CompanyInput = Infer<typeof company>;

const patchFields = v.object({
  name: v.optional(v.string()),
  domain: v.optional(v.union(v.string(), v.null())),
  tags: v.optional(v.array(v.string())),
  owner: v.optional(v.string()),
  openDeals: v.optional(v.number()),
  pipelineValue: v.optional(v.number()),
  winProbability: v.optional(v.number()),
});

function toClient(doc: Doc<"companies">) {
  const { _id, _creationTime, slug, position, ...rest } = doc;
  void _id;
  void _creationTime;
  void position;
  return { id: slug, ...rest };
}

function clean(input: CompanyInput): CompanyInput {
  const logo =
    input.logo && input.logo.length <= MAX_LOGO_LENGTH ? input.logo : undefined;
  return { ...input, name: input.name.trim(), logo };
}

async function bySlug(ctx: MutationCtx, slug: string) {
  const doc = await ctx.db
    .query("companies")
    .withIndex("by_slug", (q) => q.eq("slug", slug))
    .unique();
  if (!doc) throw new ConvexError(`Company ${slug} not found`);
  return doc;
}

async function logChanges(
  ctx: MutationCtx,
  companySlug: string,
  author: string,
  texts: string[],
) {
  const at = new Date().toISOString();
  const ids: Id<"changes">[] = [];
  for (const text of texts) {
    ids.push(await ctx.db.insert("changes", { companySlug, text, author, at }));
  }
  return ids;
}

async function nextPosition(ctx: MutationCtx) {
  const top = await ctx.db
    .query("companies")
    .withIndex("by_position")
    .order("desc")
    .first();
  return (top?.position ?? 0) + 1;
}

export const list = query({
  args: {},
  handler: async (ctx) => {
    await requireViewer(ctx);
    const docs = await ctx.db
      .query("companies")
      .withIndex("by_position")
      .order("desc")
      .collect();
    return docs.map(toClient);
  },
});

export const bootstrap = mutation({
  args: {
    companies: v.array(company),
    notes: v.array(
      v.object({
        companySlug: v.string(),
        body: v.string(),
        author: v.string(),
        at: v.string(),
      }),
    ),
    changes: v.array(
      v.object({
        companySlug: v.string(),
        text: v.string(),
        author: v.string(),
        at: v.string(),
      }),
    ),
  },
  handler: async (ctx, args) => {
    await requireViewer(ctx);
    const done = await ctx.db
      .query("meta")
      .withIndex("by_key", (q) => q.eq("key", "bootstrapped"))
      .unique();
    if (done) return false;
    await ctx.db.insert("meta", { key: "bootstrapped" });
    if (await ctx.db.query("companies").first()) return false;
    const total = args.companies.length;
    for (const [index, input] of args.companies.entries()) {
      await ctx.db.insert("companies", {
        ...clean(input),
        position: total - index,
      });
    }
    for (const note of args.notes) await ctx.db.insert("notes", note);
    for (const change of args.changes) await ctx.db.insert("changes", change);
    return true;
  },
});

export const add = mutation({
  args: { company },
  handler: async (ctx, args) => {
    await requireViewer(ctx);
    const existing = await ctx.db
      .query("companies")
      .withIndex("by_slug", (q) => q.eq("slug", args.company.slug))
      .unique();
    if (existing) throw new ConvexError("A company with this id exists");
    await ctx.db.insert("companies", {
      ...clean(args.company),
      position: await nextPosition(ctx),
    });
  },
});

export const remove = mutation({
  args: { slugs: v.array(v.string()) },
  handler: async (ctx, args) => {
    await requireViewer(ctx);
    const removed: (CompanyInput & { position: number })[] = [];
    for (const slug of args.slugs) {
      const doc = await ctx.db
        .query("companies")
        .withIndex("by_slug", (q) => q.eq("slug", slug))
        .unique();
      if (!doc) continue;
      const { _id, _creationTime, ...fields } = doc;
      void _creationTime;
      removed.push(fields);
      await ctx.db.delete(_id);
    }
    return removed;
  },
});

export const restore = mutation({
  args: {
    companies: v.array(v.object({ ...companyFields, position: v.number() })),
  },
  handler: async (ctx, args) => {
    await requireViewer(ctx);
    for (const input of args.companies) {
      const existing = await ctx.db
        .query("companies")
        .withIndex("by_slug", (q) => q.eq("slug", input.slug))
        .unique();
      if (!existing) await ctx.db.insert("companies", input);
    }
  },
});

export const update = mutation({
  args: { slug: v.string(), patch: patchFields, changes: v.array(v.string()) },
  handler: async (ctx, args) => {
    const viewer = await requireViewer(ctx);
    const doc = await bySlug(ctx, args.slug);
    const { domain, ...rest } = args.patch;
    const previous = {
      name: doc.name,
      domain: doc.domain ?? null,
      tags: doc.tags,
      owner: doc.owner,
      openDeals: doc.openDeals,
      pipelineValue: doc.pipelineValue,
      winProbability: doc.winProbability,
    };
    await ctx.db.patch(doc._id, {
      ...rest,
      ...(domain !== undefined ? { domain: domain ?? undefined } : {}),
    });
    const changeIds = await logChanges(
      ctx,
      args.slug,
      viewer.name,
      args.changes,
    );
    return { previous, changeIds };
  },
});

export const revert = mutation({
  args: {
    slug: v.string(),
    previous: patchFields,
    changeIds: v.array(v.id("changes")),
  },
  handler: async (ctx, args) => {
    await requireViewer(ctx);
    const doc = await bySlug(ctx, args.slug);
    const { domain, ...rest } = args.previous;
    await ctx.db.patch(doc._id, {
      ...rest,
      ...(domain !== undefined ? { domain: domain ?? undefined } : {}),
    });
    for (const id of args.changeIds) {
      if (await ctx.db.get(id)) await ctx.db.delete(id);
    }
  },
});

export const assignOwner = mutation({
  args: { slugs: v.array(v.string()), owner: v.string() },
  handler: async (ctx, args) => {
    const viewer = await requireViewer(ctx);
    const previous: { slug: string; owner: string }[] = [];
    const changeIds: Id<"changes">[] = [];
    for (const slug of args.slugs) {
      const doc = await bySlug(ctx, slug);
      if (doc.owner === args.owner) continue;
      previous.push({ slug, owner: doc.owner });
      await ctx.db.patch(doc._id, { owner: args.owner });
      changeIds.push(
        ...(await logChanges(ctx, slug, viewer.name, [
          `Owner changed to ${args.owner}`,
        ])),
      );
    }
    return { previous, changeIds };
  },
});

export const restoreOwners = mutation({
  args: {
    previous: v.array(v.object({ slug: v.string(), owner: v.string() })),
    changeIds: v.array(v.id("changes")),
  },
  handler: async (ctx, args) => {
    await requireViewer(ctx);
    for (const { slug, owner } of args.previous) {
      const doc = await bySlug(ctx, slug);
      await ctx.db.patch(doc._id, { owner });
    }
    for (const id of args.changeIds) {
      if (await ctx.db.get(id)) await ctx.db.delete(id);
    }
  },
});
