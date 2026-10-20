# Kargul Starter

Next.js 16 + React 19 + Tailwind CSS 4 boilerplate. Read `CONVENTIONS.md` before writing any component, section, or page — it is the whole spec for how this repo is built.

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

| Script                 | What it does                                                      |
| ---------------------- | ----------------------------------------------------------------- |
| `npm run dev`          | Start the dev server                                              |
| `npm run build`        | Production build                                                  |
| `npm run start`        | Serve the production build                                        |
| `npm run lint`         | ESLint                                                            |
| `npm run to:avif`      | Convert an image to AVIF and report its inline cost — rule 11     |
| `npm run extract:avif` | Pull the first frame of every `.webm` under `public/` as a poster |
| `npm run frame:rive`   | Render a still from a `.riv` file for use as its poster           |

## Backend (self-hosted Convex)

Data, sign-in and live updates run on a self-hosted [Convex](https://github.com/get-convex/convex-backend/tree/main/self-hosted) backend. Functions live in `convex/`.

### Local setup

```bash
npm run convex:up                      # backend on :3210/:3211, dashboard on :6791
docker compose -f docker-compose.convex.yml exec backend ./generate_admin_key.sh
cp .env.example .env.local             # paste the admin key
```

Generate the auth signing keys once per deployment (script from the [Convex Auth manual setup](https://labs.convex.dev/auth/setup/manual)) and set them:

```bash
npx convex env set SITE_URL http://localhost:3000
npx convex env set -- JWT_PRIVATE_KEY "<private key, newlines replaced by spaces>"
npx convex env set JWKS '<jwks json>'
npx convex env set ALLOWED_EMAIL_DOMAINS yourcompany.com   # optional: restrict sign-ups
```

Then run `npm run convex:dev` (pushes functions and watches) next to `npm run dev`. The first person to sign in seeds the database; companies saved in that browser's localStorage by older versions are imported instead of the demo data.

### Production

1. Run `docker-compose.convex.yml` on the server behind HTTPS. Set `INSTANCE_SECRET` (`openssl rand -hex 32`), `CONVEX_CLOUD_ORIGIN` (public API URL, e.g. `https://convex.example.com`) and `CONVEX_SITE_ORIGIN` (public HTTP-actions URL, e.g. `https://convex-site.example.com`). Set `POSTGRES_URL` to use Postgres instead of the default SQLite volume.
2. Generate an admin key, set the auth env vars above with the production `SITE_URL`, and deploy functions with `CONVEX_SELF_HOSTED_URL=… CONVEX_SELF_HOSTED_ADMIN_KEY=… npm run convex:deploy`.
3. Build the app with `NEXT_PUBLIC_CONVEX_URL` set to `CONVEX_CLOUD_ORIGIN`.

## First things to set on a new project

1. **`lib/seo.ts`** — `SITE_NAME`, `SITE_URL`, `SITE_DESCRIPTION`, `SITE_ROUTES`. Everything in `app/robots.ts`, `app/sitemap.ts`, `app/llms.txt/route.ts` and every page's metadata derives from these (rule 18). Set `NEXT_PUBLIC_SITE_URL` in the environment to override the URL per deploy.
2. **`app/globals.css`** — match the `@layer base` type scale and the `--padding-section-*` tokens to the design before building anything (rules 1 and 3).
3. **`app/opengraph-image.jpg`** — 1200×630, with an `opengraph-image.alt.txt` beside it.
4. **Fonts** — `app/layout.tsx` ships Inter + a local Inter Display; swap them for the design's typeface.

## Docs

| File              | What's in it                                                          |
| ----------------- | --------------------------------------------------------------------- |
| `CONVENTIONS.md`  | The build rules. Read first.                                          |
| `AGENTS.md`       | Next.js version notes for agents                                      |
| `OPTIMIZATION.md` | Why `Asset`'s Rive loading is gated behind LCP, with the measurements |
