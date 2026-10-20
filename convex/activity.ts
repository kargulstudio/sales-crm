import { ConvexError, v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { requireViewer } from "./auth";

const MAX_NOTE_LENGTH = 10_000;

export const notes = query({
  args: {},
  handler: async (ctx) => {
    await requireViewer(ctx);
    const docs = await ctx.db.query("notes").collect();
    return docs.map((note) => ({
      id: note._id as string,
      companyId: note.companySlug,
      body: note.body,
      author: note.author,
      at: note.at,
    }));
  },
});

export const changes = query({
  args: {},
  handler: async (ctx) => {
    await requireViewer(ctx);
    const docs = await ctx.db.query("changes").collect();
    return docs.map((change) => ({
      id: change._id as string,
      companyId: change.companySlug,
      text: change.text,
      author: change.author,
      at: change.at,
    }));
  },
});

export const addNote = mutation({
  args: { companySlug: v.string(), body: v.string() },
  handler: async (ctx, args) => {
    const viewer = await requireViewer(ctx);
    const body = args.body.trim();
    if (!body) throw new ConvexError("Note is empty");
    if (body.length > MAX_NOTE_LENGTH)
      throw new ConvexError("Note is too long");
    return await ctx.db.insert("notes", {
      companySlug: args.companySlug,
      body,
      author: viewer.name,
      authorId: viewer.id,
      at: new Date().toISOString(),
    });
  },
});

export const removeNote = mutation({
  args: { id: v.id("notes") },
  handler: async (ctx, args) => {
    await requireViewer(ctx);
    const note = await ctx.db.get(args.id);
    if (!note) return null;
    await ctx.db.delete(args.id);
    const { _id, _creationTime, ...fields } = note;
    void _id;
    void _creationTime;
    return fields;
  },
});

export const restoreNote = mutation({
  args: {
    note: v.object({
      companySlug: v.string(),
      body: v.string(),
      author: v.string(),
      authorId: v.optional(v.id("users")),
      at: v.string(),
    }),
  },
  handler: async (ctx, args) => {
    await requireViewer(ctx);
    return await ctx.db.insert("notes", args.note);
  },
});
