import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

export const companyFields = {
  slug: v.string(),
  name: v.string(),
  tags: v.array(v.string()),
  owner: v.string(),
  openDeals: v.number(),
  pipelineValue: v.number(),
  winProbability: v.number(),
  trend: v.array(v.number()),
  lastInteraction: v.object({ date: v.string(), label: v.string() }),
  activityDays: v.number(),
  domain: v.optional(v.string()),
  logo: v.optional(v.string()),
};

export default defineSchema({
  ...authTables,
  companies: defineTable({ ...companyFields, position: v.number() })
    .index("by_slug", ["slug"])
    .index("by_position", ["position"]),
  notes: defineTable({
    companySlug: v.string(),
    body: v.string(),
    author: v.string(),
    authorId: v.optional(v.id("users")),
    at: v.string(),
  }).index("by_company", ["companySlug"]),
  meta: defineTable({ key: v.string() }).index("by_key", ["key"]),
  changes: defineTable({
    companySlug: v.string(),
    text: v.string(),
    author: v.string(),
    at: v.string(),
  }).index("by_company", ["companySlug"]),
});
