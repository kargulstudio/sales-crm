import { rejectUnauthorized } from "@/lib/crm/http";
import { CRM_OPERATIONS } from "@/lib/crm/operations";
import * as z from "zod";

export const dynamic = "force-dynamic";

export function GET(request: Request) {
  const rejected = rejectUnauthorized(request);
  if (rejected) return rejected;

  return Response.json({
    operations: CRM_OPERATIONS.map((operation) => ({
      name: operation.name,
      title: operation.title,
      description: operation.description,
      readOnly: operation.readOnly ?? false,
      destructive: operation.destructive ?? false,
      input: z.toJSONSchema(operation.input, { io: "input" }),
    })),
  });
}
