import { beforeAll, expect, it } from "vitest";
import {
  generateKeyPair,
  SignJWT,
  createLocalJWKSet,
  exportJWK,
  type JWTVerifyGetKey,
} from "jose";
import {
  verifyAccessToken,
  assertSameOrigin,
  localIdentity,
  readJson,
} from "../lib/server/auth";
const config = {
  ACCESS_TEAM_DOMAIN: "https://test.cloudflareaccess.com",
  ACCESS_AUD: "crm-audience",
};
let privateKey: CryptoKey;
let key: JWTVerifyGetKey;
beforeAll(async () => {
  const pair = await generateKeyPair("RS256");
  privateKey = pair.privateKey;
  const jwk = await exportJWK(pair.publicKey);
  key = createLocalJWKSet({ keys: [{ ...jwk, kid: "test", alg: "RS256" }] });
});
async function token(
  options: {
    aud?: string;
    issuer?: string;
    exp?: string;
    email?: string;
    type?: string;
  } = {},
) {
  return new SignJWT({
    email: options.email || "One@example.com",
    type: options.type || "app",
    name: "One",
  })
    .setProtectedHeader({ alg: "RS256", kid: "test" })
    .setSubject("access-user")
    .setIssuer(options.issuer || config.ACCESS_TEAM_DOMAIN)
    .setAudience(options.aud || config.ACCESS_AUD)
    .setIssuedAt()
    .setExpirationTime(options.exp || "1h")
    .sign(privateKey);
}
it("validates signature, audience, issuer, expiry and user identity", async () => {
  expect((await verifyAccessToken(await token(), config, key)).email).toBe(
    "one@example.com",
  );
  for (const options of [
    { aud: "other" },
    { issuer: "https://evil.example" },
    { exp: "-1h" },
    { email: "invalid" },
    { type: "service" },
  ])
    await expect(
      verifyAccessToken(await token(options), config, key),
    ).rejects.toThrow("Invalid");
  await expect(verifyAccessToken(null, config, key)).rejects.toThrow("Sign in");
  await expect(verifyAccessToken("fake", config, key)).rejects.toThrow(
    "Invalid",
  );
  await expect(verifyAccessToken(await token(), {}, key)).rejects.toThrow(
    "not configured",
  );
});
it("rejects forged signatures", async () => {
  const valid = await token();
  const parts = valid.split(".");
  parts[2] = "A".repeat(parts[2].length);
  await expect(verifyAccessToken(parts.join("."), config, key)).rejects.toThrow(
    "Invalid",
  );
});
it("rejects forged identity headers and local bypass on public URLs", () => {
  expect(
    localIdentity(
      new Request("https://crm.example", {
        headers: { "cf-access-authenticated-user-email": "one@example.com" },
      }),
      { LOCAL_DEV_AUTH: "true" },
    ),
  ).toBeNull();
});
it("requires same-origin JSON mutations", () => {
  const make = (origin: string, content = "application/json") =>
    new Request("https://crm.example/api", {
      method: "POST",
      headers: { origin, "content-type": content },
    });
  expect(() => assertSameOrigin(make("https://crm.example"))).not.toThrow();
  expect(() => assertSameOrigin(make("https://evil.example"))).toThrow(
    "Cross-origin",
  );
  expect(() =>
    assertSameOrigin(make("https://crm.example", "text/plain")),
  ).toThrow("application/json");
  expect(() =>
    assertSameOrigin(
      new Request("https://crm.example/api", { method: "POST" }),
    ),
  ).toThrow("Cross-origin");
});
it("bounds and validates JSON bodies", async () => {
  await expect(
    readJson(
      new Request("https://crm.example", { method: "POST", body: "{bad" }),
    ),
  ).rejects.toThrow("Invalid JSON");
  await expect(
    readJson(
      new Request("https://crm.example", {
        method: "POST",
        body: "x".repeat(230000),
      }),
    ),
  ).rejects.toThrow("too large");
});
