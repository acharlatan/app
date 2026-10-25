# Owner operations — 1.0

## Update and publish

Edit the existing project in `acharlatan/app`, preferably on a branch and pull request. The app is nested under `marketing-insights-ai/`. Run `npm test` from that folder. Release quality checks run on pull requests and release branches; they bundle the Worker without deploying. Merge into `main` after review. GitHub Actions → Publish GitHub Pages must succeed; it uploads only `marketing-insights-ai/dist`.

Keep only one Pages workflow. Do not add the generic Jekyll workflow; it publishes the wrong root and can overwrite the app. Repository Settings → Pages → Source is GitHub Actions. The site address is https://acharlatan.github.io/app/ .

Cloudflare independently deploys `main` through its existing Git integration: Worker `marketing-insights-ai`; root `marketing-insights-ai/worker`; no build command; deploy `npx wrangler deploy`. Worker source imports `../dist/intelligence.js`, so keep the nested project intact. `npm run worker:deploy` from the project root is the equivalent CLI path.

## Check AI

Ask Your Data → Check connection checks configuration without spending a Gemini request. It must not say Google is verified. Select Gemini AI, enter a question about synthetic data, submit, review the data-sharing consent, and verify that a real interpretation appears. Local Analysis remains available when Gemini fails. No automatic retries occur.

The committed settings are authoritative after each Git deployment: `AI_ENABLED=true`, `GEMINI_MODEL=gemini-3.5-flash-lite`, `ALLOWED_ORIGINS=https://acharlatan.github.io,http://localhost:8000,http://127.0.0.1:8000`. The origin excludes the /app/ path. Model availability and allowance depend on the Google project.

## Monitor and control usage

Cloudflare Worker Metrics show requests/errors; Google AI Studio's project usage shows API usage and quotas. Status checks and malformed requests are not necessarily Gemini calls. The Durable Object admits at most 30 upstream attempts across all visitors per UTC day; failed provider attempts count. Native per-IP throttling is approximately 3 requests/minute. It is not an account spending cap and does not provide user authentication. Keep Google/Cloudflare billing disabled for a $0 demo. Do not enable paid resources to fix a quota error.

## Emergency AI shutdown

Set `AI_ENABLED` to `false` in `marketing-insights-ai/worker/wrangler.jsonc` and commit to main; confirm the Cloudflare deployment. The dashboard can disable the runtime variable sooner, but update GitHub as well because a later deployment replaces ordinary variables from the committed configuration. `/status` should then return configured:false; local calculations still work.

## Rotate the secret

Revoke an exposed key in Google AI Studio, create a replacement privately, then open Cloudflare → Workers & Pages → marketing-insights-ai → Settings → Variables and Secrets → Production. Set `GEMINI_API_KEY` with type Secret and deploy. Never paste its value into chat or GitHub. Alternatively `npm run worker:secret` prompts privately in Wrangler. Normal code deployments preserve secrets. Key rotation/revocation history cannot be verified from public application responses.

## Common recovery

- **404:** use /app/, verify the single Pages workflow uploads the nested dist, and check Actions.
- **Old styling/code:** refresh; the release versions stylesheet and module entry URLs. Bump these when publishing modified assets.
- **Configuration check fails:** verify deployment, AI_ENABLED, runtime secret, allowed origin and bindings. Do not remove quota guards.
- **Gemini 429/rate limit:** wait for the stated window; use Local Analysis. Do not automatically retry or enable billing.
- **No comparison:** select later dates with earlier data, or provide a valid custom comparison.
- **Import rejected:** map required unique columns, fix invalid/missing values and remove exact duplicate rows. Do not fill unknown values with zero.
- **Plans missing after another browser/device:** storage is browser-local. Export saved plans as backup; raw CSV data is intentionally not persisted.
- **Scenario restore blocked:** import the original dataset; its fingerprint protects against applying old allocations to different data.
- **PDF:** Build report → Print / Save PDF → choose Save as PDF in the browser. Export text/CSV if printing is unavailable.
