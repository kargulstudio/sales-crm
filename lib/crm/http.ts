import { timingSafeEqual } from "node:crypto";

const LOCAL_HOSTS = new Set(["localhost", "127.0.0.1", "[::1]", "::1"]);

function sameToken(given: string, expected: string) {
  const a = Buffer.from(given);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}

export function rejectUnauthorized(request: Request): Response | null {
  const token = process.env.CRM_API_TOKEN;
  if (token) {
    const header = request.headers.get("authorization") ?? "";
    const given = header.replace(/^Bearer\s+/i, "");
    if (header && sameToken(given, token)) return null;
    return Response.json(
      { error: "Missing or invalid bearer token." },
      { status: 401, headers: { "WWW-Authenticate": "Bearer" } },
    );
  }

  if (process.env.NODE_ENV === "production") {
    return Response.json(
      { error: "Set CRM_API_TOKEN to enable the agent API in production." },
      { status: 503 },
    );
  }

  const host = (request.headers.get("host") ?? "").replace(/:\d+$/, "");
  if (LOCAL_HOSTS.has(host)) return null;
  return Response.json(
    { error: "Without CRM_API_TOKEN the agent API only answers on localhost." },
    { status: 403 },
  );
}
