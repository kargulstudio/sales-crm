import { McpServer } from "@modelcontextprotocol/server";
import { CRM_OPERATIONS } from "./operations";
import { CrmError, type CrmContext } from "./service";

export const CRM_MCP_INSTRUCTIONS = `Sales CRM: companies (accounts/leads) grouped into workspaces.
Start with list_workspaces, then describe_workspace for the owners, tags and fields a workspace accepts.
Reference a company by id (preferred) or exact name. Every write is logged; get_activity shows what changed and who changed it (ui, mcp, cli, api).
Use import_companies for bulk ingestion (dryRun first), update_company for field edits and log_interaction after any touchpoint.
Changes appear in the web UI within a few seconds.`;

export function createCrmMcpServer(context: CrmContext) {
  const server = new McpServer(
    { name: "sales-crm", version: "0.1.0" },
    { instructions: CRM_MCP_INSTRUCTIONS },
  );

  for (const operation of CRM_OPERATIONS) {
    server.registerTool(
      operation.name,
      {
        title: operation.title,
        description: operation.description,
        inputSchema: operation.input,
        annotations: {
          title: operation.title,
          readOnlyHint: operation.readOnly ?? false,
          destructiveHint: operation.destructive ?? false,
          idempotentHint: operation.idempotent ?? operation.readOnly ?? false,
          openWorldHint: false,
        },
      },
      async (input: unknown) => {
        try {
          const result = await operation.run(
            input as Parameters<typeof operation.run>[0],
            context,
          );
          return {
            content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
          };
        } catch (error) {
          if (!(error instanceof CrmError)) throw error;
          return {
            isError: true,
            content: [{ type: "text", text: error.message }],
          };
        }
      },
    );
  }

  return server;
}
