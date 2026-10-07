import { createMcpHandler } from "@modelcontextprotocol/server";
import { rejectUnauthorized } from "@/lib/crm/http";
import { createCrmMcpServer } from "@/lib/crm/mcp";

export const dynamic = "force-dynamic";

const handler = createMcpHandler(() => createCrmMcpServer({ actor: "mcp" }));

async function handle(request: Request) {
  return rejectUnauthorized(request) ?? handler.fetch(request);
}

export { handle as GET, handle as POST, handle as DELETE };
