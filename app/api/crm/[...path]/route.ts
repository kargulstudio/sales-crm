import { env } from "cloudflare:workers";
import { ZodError, z } from "zod";
import { CrmRepository } from "@/lib/db/repository";
import {
  assertSameOrigin,
  getCurrentUser,
  readJson,
  type AuthConfig,
} from "@/lib/server/auth";
import { HttpError } from "@/lib/server/errors";
import { entitySchemas, idSchema } from "@/lib/server/validation";
import type { EntityKind } from "@/lib/crm-types";
export const dynamic = "force-dynamic";
async function handle(
  request: Request,
  context: { params: Promise<{ path: string[] }> },
) {
  try {
    const config = env as unknown as AuthConfig & { DB: D1Database };
    if (request.method !== "GET") assertSameOrigin(request);
    const user = await getCurrentUser(request, config.DB, config);
    const repo = new CrmRepository(config.DB, user);
    const { path } = await context.params;
    const url = new URL(request.url);
    const method = request.method;
    let result: unknown;
    if (method === "GET" && path.join("/") === "bootstrap")
      result = {
        user,
        owners: await repo.owners(),
        notifications: await repo.notifications(),
      };
    else if (
      method === "GET" &&
      path.length === 2 &&
      path[0] === "records" &&
      Object.hasOwn(entitySchemas, path[1])
    )
      result = await repo.allEntities(
        path[1] as EntityKind,
        z.coerce
          .number()
          .int()
          .min(1)
          .max(100000)
          .parse(url.searchParams.get("page") || 1),
      );
    else if (path.join("/") === "notifications/read" && method === "POST") {
      const { ids } = z
        .object({ ids: z.array(idSchema).max(100) })
        .strict()
        .parse(await readJson(request));
      await repo.readNotifications(ids);
      result = { ok: true };
    } else if (path[0] === "companies" && path.length === 1) {
      if (method === "GET")
        result = await repo.list(Object.fromEntries(url.searchParams));
      else if (method === "POST")
        result = await repo.createCompany(await readJson(request));
      else throw new HttpError(405, "Method not allowed");
    } else if (path[0] === "companies" && path.length === 2) {
      if (method === "GET") result = await repo.detail(path[1]);
      else if (method === "PATCH")
        result = await repo.updateCompany(path[1], await readJson(request));
      else if (method === "DELETE")
        result = await repo.updateCompany(path[1], { archived: true });
      else throw new HttpError(405, "Method not allowed");
    } else if (
      path[0] === "companies" &&
      path.length >= 3 &&
      path.length <= 4 &&
      Object.hasOwn(entitySchemas, path[2])
    ) {
      const kind = path[2] as EntityKind;
      const id = path[3];
      if (method === "GET" && !id)
        result = await repo.entities(
          kind,
          path[1],
          z.coerce
            .number()
            .int()
            .min(1)
            .max(100000)
            .parse(url.searchParams.get("page") || 1),
        );
      else if (method === "POST" && !id)
        result = await repo.saveEntity(kind, path[1], await readJson(request));
      else if (method === "PATCH" && id)
        result = await repo.saveEntity(
          kind,
          path[1],
          await readJson(request),
          id,
        );
      else if (method === "DELETE" && id) {
        await repo.deleteEntity(kind, path[1], id);
        result = { ok: true };
      } else throw new HttpError(405, "Method not allowed");
    } else throw new HttpError(404, "Endpoint not found");
    return Response.json(result, {
      status: method === "POST" && path[0] === "companies" ? 201 : 200,
      headers: { "Cache-Control": "private, no-store" },
    });
  } catch (error) {
    if (error instanceof ZodError)
      return Response.json(
        {
          error: error.issues
            .map((i) => `${i.path.join(".")}: ${i.message}`)
            .join("; "),
        },
        { status: 400, headers: { "Cache-Control": "no-store" } },
      );
    if (error instanceof HttpError)
      return Response.json(
        { error: error.message },
        { status: error.status, headers: { "Cache-Control": "no-store" } },
      );
    // Do not log CRM payloads, identity headers, or database error strings.
    console.error(
      "CRM request failed",
      error instanceof Error ? error.name : "UnknownError",
    );
    return Response.json(
      { error: "Unable to save or load records. Please retry." },
      { status: 500, headers: { "Cache-Control": "no-store" } },
    );
  }
}
export { handle as GET, handle as POST, handle as PATCH, handle as DELETE };
