import { rejectUnauthorized } from "@/lib/crm/http";
import { runCrmOperation } from "@/lib/crm/operations";
import { CrmError } from "@/lib/crm/service";

export const dynamic = "force-dynamic";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ operation: string }> },
) {
  const rejected = rejectUnauthorized(request);
  if (rejected) return rejected;

  const { operation } = await params;
  const text = await request.text();
  let input: unknown = {};
  try {
    input = text ? JSON.parse(text) : {};
  } catch {
    return Response.json({ error: "Body must be JSON." }, { status: 400 });
  }

  const actor = request.headers.get("x-crm-actor") === "cli" ? "cli" : "api";
  try {
    return Response.json(await runCrmOperation(operation, input, { actor }));
  } catch (error) {
    if (error instanceof CrmError) {
      return Response.json({ error: error.message }, { status: 400 });
    }
    throw error;
  }
}
