# Netlify Setup

This project is linked to a manual CLI-managed Netlify site.

## Project

- Team slug: `pleura-06-riches`
- Site name: `buysupply-pleura-20260421`
- Site ID: `283d1d75-9724-4c1f-8b96-7533b6db6c68`
- Admin URL: `https://app.netlify.com/projects/buysupply-pleura-20260421`
- Production URL: `https://buysupply-pleura-20260421.netlify.app`

The local directory is linked via `.netlify/state.json`.

## Source Of Truth Files

- [`NETLIFY_SETUP.md`](./NETLIFY_SETUP.md) for the full operational notes
- [`NETLIFY_HANDOFF.md`](./NETLIFY_HANDOFF.md) for the short next-agent brief
- [`scripts/netlify-manual-release.sh`](./scripts/netlify-manual-release.sh) for the preferred deploy path
- [`scripts/patch-netlify-manual-handler.mjs`](./scripts/patch-netlify-manual-handler.mjs) for the runtime workaround

## Build

- Config file: [`netlify.toml`](./netlify.toml)
- Build command: `npm run build`
- Node version: `20`

## Environment Variables Configured In Netlify

These keys were imported from the local env file into the Netlify project:

- `DATABASE_URL`
- `SESSION_SECRET`
- `ADMIN_EMAIL`
- `ADMIN_PASSWORD`
- `RESEND_API_KEY`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- `SUPABASE_SECRET_KEY`

## Important Notes

- `RESEND_API_KEY` is currently a local placeholder value, not a confirmed production key.
- Product image uploads now run through `Supabase Storage`, not `UploadThing`.
- If `UPLOADTHING_TOKEN` still exists in Netlify from an older setup, it is legacy and can be removed.
- The app deploys successfully without a real `RESEND_API_KEY`, but sell-enquiry emails will not work correctly until the production value is added.
- Admin credentials and session secret were replaced with stronger values before importing to Netlify.
- There is no Git-based CI configured yet. Deploys are currently manual via Netlify CLI.
- `DATABASE_URL` was verified locally against the project env and the current database responds successfully.
- `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, and `SUPABASE_SERVICE_ROLE_KEY` are part of the active production runtime and must stay aligned with the same Supabase project.
- Standard `netlify deploy --build --prod` was not enough for this Next.js 16 app. The working flow is:
  1. `npm run netlify:manual:build`
  2. `npm run netlify:manual:deploy`
  3. `npm run netlify:smoke`
- Preferred one-command path: `npm run netlify:manual:release`
- The shim replaces Netlify's streaming-only server bootstrap with a lambda-compatible handler and installs a process-local storage fallback instead of the Blobs-backed cache runtime.
- Because of that fallback, SSR and route handlers work, but ISR/data-cache state is not shared durably across separate function instances. Treat this as a pragmatic deployment workaround, not a perfect long-term Netlify runtime integration.
- All Netlify CLI scripts require `NETLIFY_AUTH_TOKEN` in the shell environment. The token is intentionally not stored in the repo.

## Verified Working State

Verified live on `2026-04-21` against the production URL:

- `/` returns `200`
- `/login` returns `200`
- `/dashboard` returns `307` redirect to `/login?from=%2Fdashboard`
- `/api/settings` returns `401 {"error":"Unauthorized"}` when unauthenticated
- Function logs are clean for those requests and no longer show `MissingBlobsEnvironmentError`

## Useful Commands

```bash
export NETLIFY_AUTH_TOKEN='...'
npx netlify-cli env:list
npm run netlify:manual:build
npm run netlify:manual:deploy
npm run netlify:manual:release
npm run netlify:smoke
npx netlify-cli open:site
set -a; source .env; set +a
```
