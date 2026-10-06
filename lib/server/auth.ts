import { createRemoteJWKSet, jwtVerify, type JWTVerifyGetKey } from "jose";
import type { User } from "../crm-types";
import { HttpError } from "./errors";
export type AuthConfig = {
  ACCESS_TEAM_DOMAIN?: string;
  ACCESS_AUD?: string;
  LOCAL_DEV_AUTH?: string;
  LOCAL_DEV_EMAIL?: string;
};
const keySets = new Map<string, JWTVerifyGetKey>();
export async function verifyAccessToken(
  token: string | null,
  config: AuthConfig,
  key?: JWTVerifyGetKey,
) {
  const issuer = config.ACCESS_TEAM_DOMAIN?.replace(/\/$/, "");
  if (
    !issuer ||
    !/^https:\/\/[a-z0-9-]+\.cloudflareaccess\.com$/.test(issuer) ||
    !config.ACCESS_AUD
  )
    throw new HttpError(503, "Cloudflare Access is not configured");
  if (!token) throw new HttpError(401, "Sign in with Cloudflare Access");
  try {
    if (!keySets.has(issuer))
      keySets.set(
        issuer,
        createRemoteJWKSet(new URL(`${issuer}/cdn-cgi/access/certs`)),
      );
    const { payload } = await jwtVerify(token, key ?? keySets.get(issuer)!, {
      issuer,
      audience: config.ACCESS_AUD,
      algorithms: ["RS256"],
      requiredClaims: ["sub", "email", "exp", "iat"],
      clockTolerance: 5,
    });
    if (
      payload.type !== "app" ||
      typeof payload.email !== "string" ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(payload.email) ||
      !payload.sub
    )
      throw new Error("User identity required");
    return {
      email: payload.email.toLowerCase(),
      name:
        typeof payload.name === "string"
          ? payload.name.slice(0, 200)
          : payload.email.split("@")[0],
      avatar:
        typeof payload.picture === "string" &&
        payload.picture.startsWith("https://")
          ? payload.picture
          : null,
    };
  } catch {
    throw new HttpError(401, "Invalid or expired Cloudflare Access session");
  }
}
export function localIdentity(request: Request, config: AuthConfig) {
  // Compile-time DEV and a loopback URL: a deployed Worker can never activate this branch.
  if (
    import.meta.env?.DEV &&
    config.LOCAL_DEV_AUTH === "true" &&
    ["localhost", "127.0.0.1", "[::1]"].includes(new URL(request.url).hostname)
  ) {
    return {
      email: config.LOCAL_DEV_EMAIL || "developer@localhost.test",
      name: "Local Developer",
      avatar: null,
    };
  }
  return null;
}
export async function getCurrentUser(
  request: Request,
  db: D1Database,
  config: AuthConfig,
): Promise<User> {
  const identity =
    localIdentity(request, config) ??
    (await verifyAccessToken(
      request.headers.get("cf-access-jwt-assertion"),
      config,
    ));
  const id = crypto.randomUUID();
  await db
    .prepare(
      `INSERT INTO users (id,email,display_name,avatar_url) VALUES (?,?,?,?) ON CONFLICT(email) DO UPDATE SET display_name=excluded.display_name,avatar_url=COALESCE(excluded.avatar_url,users.avatar_url),updated_at=strftime('%Y-%m-%dT%H:%M:%fZ','now')`,
    )
    .bind(id, identity.email, identity.name, identity.avatar)
    .run();
  const user = await db
    .prepare(
      "SELECT id,email,display_name,avatar_url,created_at,updated_at FROM users WHERE email=? AND managed_by IS NULL",
    )
    .bind(identity.email)
    .first<User>();
  if (!user) throw new HttpError(403, "User identity is unavailable");
  return user;
}
export function assertSameOrigin(request: Request) {
  const origin = request.headers.get("origin");
  if (
    origin !== new URL(request.url).origin ||
    request.headers.get("sec-fetch-site") === "cross-site"
  )
    throw new HttpError(403, "Cross-origin mutation rejected");
  if (
    !request.headers
      .get("content-type")
      ?.toLowerCase()
      .startsWith("application/json")
  )
    throw new HttpError(415, "Use application/json");
}
export async function readJson(request: Request) {
  const max = 220000;
  if (Number(request.headers.get("content-length")) > max)
    throw new HttpError(413, "Request is too large");
  const reader = request.body?.getReader();
  if (!reader) throw new HttpError(400, "JSON body required");
  let size = 0;
  const chunks: Uint8Array[] = [];
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.length;
    if (size > max) {
      await reader.cancel();
      throw new HttpError(413, "Request is too large");
    }
    chunks.push(value);
  }
  const bytes = new Uint8Array(size);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.length;
  }
  try {
    return JSON.parse(new TextDecoder().decode(bytes));
  } catch {
    throw new HttpError(400, "Invalid JSON");
  }
}
