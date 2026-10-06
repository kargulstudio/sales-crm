# Cloudflare deployment checklist

The repository contains deployer-supplied placeholders. Create your own Worker/D1 resources and Access application; no shared personal infrastructure is required.

## Configure before deployment

1. Install Node.js 24 or newer and run `npm ci`.
2. Authenticate with `npx wrangler login`. If needed, set `CLOUDFLARE_ACCOUNT_ID` to your target account.
3. Run `npx wrangler d1 create sales-crm` and put the returned ID in `wrangler.jsonc` as the `DB` binding's `database_id`.
4. Create a self-hosted Cloudflare Access application covering the entire intended production hostname, including `/api/*`. Configure an identity provider and an Allow policy for your exact email(s); do not add an Everyone or Bypass policy.
5. Set `ACCESS_TEAM_DOMAIN` and `ACCESS_AUD` in `wrangler.jsonc`. Keep preview URLs disabled. Set `NEXT_PUBLIC_SITE_URL` to your application's HTTPS origin at build time.
6. Run `npm run cf:types` and `npm run deploy`. The deployment script builds, applies remote D1 migrations and publishes the Worker.
7. Optionally seed with `SEED_EMAIL=you@example.com npm run db:seed:remote`, using the exact email returned by your Access identity provider. Seeding does not grant Access admission.

The official Deploy to Cloudflare button can provision the Worker and D1. Confirm that resource IDs are rewritten for your account. Access policy still requires the configuration above. The application rejects unauthenticated requests even before that setup is complete.

## Verify the deployment

- Anonymous requests to the application and API should redirect to Access or fail closed. A forged email header must not reveal data.
- Sign in through your configured provider. Confirm the expected application user and account are shown.
- Create a test company and associated contact, interaction, task and opportunity. Refresh and verify persistence, then edit and archive the company. Remove temporary test data using authorized administrative tooling if needed.
- Check static assets, mobile navigation, command search, filters, CSV export and notifications.
- Confirm pipeline totals follow the stored opportunities, and that different authenticated emails see separate personal accounts.
- Check D1 migration state, binding IDs and `PRAGMA foreign_key_check`. Never test account isolation by weakening the Access policy.
- Inspect logs for unexpected errors without recording submitted CRM content or credentials.

Local verification commands are `npm run lint`, `npm run typecheck`, `npm test`, `npm run build`, and `npm run test:e2e`. Local browser tests use local D1 and do not prove production Access configuration.

## CI and recovery

GitHub Actions verifies installation, lint, types, tests, production build and local D1 browser workflows. Automatic deployment is opt-in through `CLOUDFLARE_DEPLOY_ENABLED`, `CLOUDFLARE_ACCOUNT_ID` and a scoped `CLOUDFLARE_API_TOKEN` secret; see README. Pull requests receive no deployment credentials.

For rollback, restore the prior Worker version and review migration compatibility separately. Worker rollback does not reverse D1 migrations. Use D1 Time Travel/export before destructive administrative changes and periodically test recovery.

No upstream license grant was found at audit time. Attribution is retained; see README and [SECURITY.md](SECURITY.md).
