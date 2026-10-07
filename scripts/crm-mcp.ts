import { serveStdio } from "@modelcontextprotocol/server/stdio";
import { createCrmMcpServer } from "@/lib/crm/mcp";

serveStdio(() => createCrmMcpServer({ actor: "mcp" }), {
  onerror: (error) => console.error(error),
});
