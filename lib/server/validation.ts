import { z } from "zod";
export const idSchema = z
  .string()
  .min(1)
  .max(150)
  .regex(/^[a-zA-Z0-9_-]+$/);
const text = (max = 500) => z.string().trim().max(max);
const name = text(200).min(1);
export const urlSchema = text(2048).refine((v) => {
  if (!v) return true;
  try {
    const u = new URL(v);
    return (
      ["http:", "https:"].includes(u.protocol) && !u.username && !u.password
    );
  } catch {
    return false;
  }
}, "Use an http or https URL without credentials");
export const logoSchema = z
  .string()
  .max(180000)
  .refine(
    (v) =>
      !v ||
      /^\/assets\/images\/[\w/.-]+$/.test(v) ||
      /^data:image\/(png|jpeg|webp);base64,[A-Za-z0-9+/=]+$/.test(v),
    "Use a PNG, JPG or WebP image under 128 KB",
  );
const date = z.string().datetime({ offset: true });
const day = z.string().date();
const money = z.number().finite().min(0).max(1_000_000_000_000);
const probability = z.number().int().min(0).max(100);
export const companySchema = z
  .object({
    name,
    website: urlSchema.default(""),
    description: text(10000).default(""),
    industry: text(100).default(""),
    segment: text(100).min(1).default("SMB"),
    stage: text(100).min(1).default("New Logo"),
    owner_id: idSchema.optional(),
    logo_url: logoSchema.nullable().default(null),
    tags: z.array(text(60).min(1)).max(20).default([]),
    pipeline_value: money.default(0),
    win_probability: probability.default(0),
    open_deals: z.number().int().min(0).max(50).default(0),
    interaction_date: day.optional(),
    interaction_subject: text(200).optional(),
  })
  .strict();
export const companyPatchSchema = companySchema
  .omit({
    pipeline_value: true,
    win_probability: true,
    open_deals: true,
    interaction_date: true,
    interaction_subject: true,
  })
  .partial()
  .extend({ archived: z.boolean().optional() })
  .strict();
export const contactSchema = z
  .object({
    first_name: text(100).default(""),
    last_name: text(100).default(""),
    full_name: name,
    email: z.union([z.literal(""), z.string().email().max(254)]).default(""),
    phone: text(80).default(""),
    role: text(200).default(""),
    linkedin_url: urlSchema.default(""),
    x_url: urlSchema.default(""),
    notes: text(10000).default(""),
  })
  .strict();
export const interactionTypes = [
  "email",
  "call",
  "linkedin",
  "x",
  "meeting",
  "note",
  "demo",
  "follow-up",
  "other",
] as const;
export const interactionSchema = z
  .object({
    contact_id: idSchema.nullable().default(null),
    type: z.enum(interactionTypes),
    subject: name,
    content: text(20000).default(""),
    occurred_at: date,
  })
  .strict();
export const taskSchema = z
  .object({
    contact_id: idSchema.nullable().default(null),
    assigned_to: idSchema.optional(),
    title: name,
    description: text(10000).default(""),
    due_at: date.nullable().default(null),
    completed_at: date.nullable().default(null),
    priority: z.enum(["low", "medium", "high"]).default("medium"),
  })
  .strict();
export const opportunitySchema = z
  .object({
    name,
    stage: z
      .enum(["Discovery", "Evaluation", "Procurement"])
      .default("Discovery"),
    value: money,
    probability,
    expected_close_date: day.nullable().default(null),
    status: z.enum(["open", "won", "lost"]).default("open"),
  })
  .strict();
export const entitySchemas = {
  contacts: contactSchema,
  interactions: interactionSchema,
  tasks: taskSchema,
  opportunities: opportunitySchema,
};
export const listSchema = z.object({
  page: z.coerce.number().int().min(1).max(100000).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(100),
  search: text(200).default(""),
  owner: text(150).default("all"),
  stage: text(100).default("any"),
  sort: z
    .enum([
      "name",
      "pipelineValue",
      "openDeals",
      "winProbability",
      "lastInteraction",
    ])
    .default("pipelineValue"),
  days: z.coerce.number().int().min(0).max(36500).default(0),
  archived: z.enum(["true", "false"]).default("false"),
});
export type CompanyInput = z.infer<typeof companySchema>;
export type CompanyPatch = z.infer<typeof companyPatchSchema>;
