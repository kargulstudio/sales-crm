# Security review

Reviewed October 5, 2026. This is a focused engineering review, not an independent penetration test.

## Identity and access

Production setup requires Cloudflare Access on the complete application hostname, using an owner-only policy with the chosen identity provider. Preview URLs are disabled. The application independently verifies the Access JWT against the configured team's public keys: RS256, issuer, audience, expiry, issued-at, email, subject and `type=app`. Requests without a valid token fail closed. An arbitrary email header never establishes identity.

The local development identity requires a development build, explicit opt-in and a loopback request URL. The production bundle eliminates that branch. Do not use development builds as public servers. Verified emails map to separate personal accounts; no account is inferred from client input.

Every API handler authenticates independently. Company SQL includes `account_id`; child queries verify ownership through the parent company. Owner/assignee choices are restricted to the current user and that user's explicitly marked demo owners. Contact references must belong to the same company, enforced in both validation and database triggers. Cross-account IDs return 404. Archiving retains history.

## Input, browser and database controls

- Prepared D1 statements bind all user values. Dynamic identifiers come from fixed route/query allowlists.
- Strict Zod schemas bound text, amounts, timestamps and URLs. JSON bodies have a streaming size limit. Partial updates preserve fields omitted by the client.
- Every mutation requires an exact same-origin `Origin`, JSON content type and a non-cross-site fetch context. APIs enable no CORS. This complements Access's session cookie protections against CSRF.
- Notes, names and activity content render as React text; no HTML editor or `dangerouslySetInnerHTML` processes CRM content. Links allow only HTTP(S), disallow credentials, and external links use safe relationship attributes. Small raster logo uploads are allowed; SVG/HTML uploads are rejected.
- Security headers include private/no-store, nosniff, frame denial, same-origin referrers and a restrictive base CSP. Inline scripts/styles remain allowed for framework hydration and the original UI; a nonce-based CSP would be a future hardening improvement.
- D1 is a Worker binding, not a public database endpoint. No Cloudflare API credential is required by the running app. Administrative migration/deployment credentials remain in the local authenticated CLI or explicit CI secrets.
- `.dev.vars`, `.env` files, state, build output and test artifacts are ignored. Account/database IDs and the Access audience are public configuration identifiers, not secrets.
- CSV values are escaped to prevent spreadsheet formula execution. Error responses do not include SQL, stack traces or submitted private content.

## Dependencies

An `npm audit` on October 5, 2026 reported **9 high-severity package entries caused by one root advisory**, [GHSA-vfj7-8cjw-p6xm (braces)](https://github.com/advisories/GHSA-vfj7-8cjw-p6xm). This concerns stack exhaustion while parsing attacker-controlled brace expressions. Affected transitive tooling includes Next.js ESLint and vinext's CommonJS build plugin. No patched compatible `braces` release was available in the audit result. The suggested forced remediation would downgrade the runtime; it was not applied.

These are build/lint dependency paths; the scanned production bundle did not contain braces/micromatch. The application does not accept user-supplied glob patterns or build configuration. CI does not give PR verification jobs deployment credentials. Recheck the advisory when updating tooling. Other fixable advisories were remediated and `fflate` is constrained to the patched compatible release. There were no critical advisories in the final audit.

## Verification and limits

Tests execute real schema migrations and repository SQL on SQLite, plus local D1 browser workflows. They cover account isolation, contact ownership, invalid input, signed/forged JWTs, incorrect claims, unsafe URLs, CSRF, bounded bodies, filtering, partial edits, rollups and archive/restore. Deployment checks are listed separately in [DEPLOYMENT.md](DEPLOYMENT.md).

A real authenticated production browser session requires signing in through the configured identity provider. Local authenticated tests do not prove a particular deployment's identity-provider configuration works. Verify this after provisioning; never add a temporary Access bypass or permissive policy to make a smoke test pass.

D1 recovery is an operator responsibility: use Time Travel/export before destructive administrative changes and test recovery periodically. A Worker rollback does not reverse database migrations. The upstream repository has no explicit license grant; see the prominent README warning before redistributing inherited code or assets.
