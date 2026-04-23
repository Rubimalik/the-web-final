# Netlify Handoff

This is the short operational brief for the next agent working on BuySupply deployment.

## Current Production

- Production URL: `https://buysupply-pleura-20260421.netlify.app`
- Netlify site ID: `283d1d75-9724-4c1f-8b96-7533b6db6c68`
- Runtime status on `2026-04-21`: working

Verified live:

- `/` -> `200`
- `/login` -> `200`
- `/dashboard` -> `307` to `/login?from=%2Fdashboard`
- `/api/settings` -> `401 {"error":"Unauthorized"}` without auth

## How To Deploy

`NETLIFY_AUTH_TOKEN` must be present in the shell environment.

Preferred path:

```bash
export NETLIFY_AUTH_TOKEN='...'
npm run netlify:manual:release
```

If you need the steps separately:

```bash
npm run netlify:manual:build
npm run netlify:manual:deploy
npm run netlify:smoke
```

## Why This Is Not A Normal Netlify Deploy

- `netlify deploy --build --prod` was not enough for this project.
- The generated Next.js Netlify server handler needed a post-build patch.
- The patch lives in [`scripts/patch-netlify-manual-handler.mjs`](./scripts/patch-netlify-manual-handler.mjs).
- That shim swaps Netlify's streaming-only bootstrap for a lambda-compatible handler.
- It also installs a process-local storage fallback instead of relying on Netlify Blobs bootstrap context.

## Known Caveats

- This is a pragmatic workaround, not a perfect native Netlify runtime integration.
- SSR and route handlers work.
- ISR/data-cache state is not guaranteed to be durable across different function instances.
- `RESEND_API_KEY` is still a placeholder, not a confirmed production key.
- Product images now use `Supabase Storage`, not `UploadThing`.
- If `UPLOADTHING_TOKEN` is still present in Netlify, treat it as legacy and removable.

## Files To Check First

- [`NETLIFY_SETUP.md`](./NETLIFY_SETUP.md)
- [`package.json`](./package.json)
- [`netlify.toml`](./netlify.toml)
- [`scripts/netlify-manual-build.sh`](./scripts/netlify-manual-build.sh)
- [`scripts/netlify-manual-deploy.sh`](./scripts/netlify-manual-deploy.sh)
- [`scripts/netlify-smoke-check.sh`](./scripts/netlify-smoke-check.sh)
