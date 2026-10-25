# Publish and connect Gemini

## GitHub Pages

1. Extract this ZIP. Keep `dist`, `worker`, `tests`, `docs`, `package.json`, and the hidden `.github` workflow folder together in a Git repository. No build or frontend install is required.
2. Create a public repository in your GitHub account and push to `main` using GitHub Desktop or Git. Never include private CSVs, `.env`, `.dev.vars`, keys, or Wrangler state.
3. In repository Settings → Pages, choose **GitHub Actions** as the source.
4. The included `Publish GitHub Pages` workflow runs `npm test`, uploads `dist/`, and deploys. Inspect the Actions result and open the actual Pages URL from Settings. Do not assume that pushing alone proves deployment success.
5. Test the live page. Assets use relative paths and fragment navigation, so project-subpath Pages hosting is supported.

## Worker deployment

1. Sign in to Cloudflare and select Workers Free. Do not upgrade or attach billing for this demo. If setup demands payment, keep the local assistant and pause that account step.
2. In `worker/wrangler.jsonc`, set `ALLOWED_ORIGINS` to exact frontend origins, comma-separated. For Pages use `https://YOUR-USERNAME.github.io` without a project path or trailing slash. If also using Sites, include the exact Sites origin.
3. Keep `AI_ENABLED` as `false` for initial deployment.
4. In a terminal run these individually:

   ```sh
   cd worker
   npx wrangler login
   npx wrangler deploy
   npx wrangler secret put GEMINI_API_KEY
   ```

   Wrangler is Cloudflare's official CLI. Complete its login yourself. Paste the API key only into the hidden secret prompt. Never paste it into chat, GitHub, the UI, screenshots, reports, or browser storage.
5. Verify that the deploy created `PER_IP` and the SQLite-backed `USAGE` Durable Object binding. The durable singleton is the authoritative shared quota; the approximate per-IP limiter is an additional throttle.
6. In Google AI Studio, create/use an API project with no paid billing linked, if eligible. Check the project's actual model access and free API quota. A consumer Gemini subscription does not establish API quota.
7. Set `GEMINI_MODEL` to a model your API project can use. The code allows the original `gemini-2.5-flash-lite` plus selected Flash-Lite replacements listed in `worker/index.js`. Availability changes; an allowlist entry is not proof of account access or free-tier eligibility. Check Google's model/pricing pages. Legacy 2.5 access may be restricted for new projects. Do not enable paid billing to force access.
8. Set `AI_ENABLED` to `true` only after confirming the above; deploy again. No secret needs to be committed.
9. Put the returned public Worker origin into `dist/config.js` as `apiBase`. This URL is public configuration, not a secret. Push the frontend change to GitHub. All visitors now share the same Worker connection automatically.
10. On the live frontend use only synthetic data, opt into Gemini, and send one request. Verify an actual Gemini response and the displayed evidence. A local fallback is not a successful live integration test.

## Model, request and cost controls

| Control | Implementation |
| --- | --- |
| Key | Worker secret only |
| Origins | Exact configured CORS allowlist; CORS is not authentication |
| Per-IP | Approximate 3 requests/minute through native binding |
| Global quota | Durable singleton allows 30 upstream attempts/UTC day across `/chat` and `/insights` |
| Payload | Maximum 16 KB; 1–3 known channels; finite metrics; validated dates/counts; up to 20 campaign summaries |
| Conversation | Question ≤500 characters; up to 4 historical pairs with answer ≤1,500 characters |
| Output | Maximum 1,000 output tokens, 20-second upstream timeout; rendered as plain text |
| Retry | No automatic retry; failed upstream requests still consume the daily attempt |
| Fallback | Deterministic local answers and analytics remain available |
| Logs | Application observability disabled; service providers may retain metadata |

Expected fixed application subscriptions: **$0**. GitHub Pages, Worker/SQLite Durable Object, and Gemini can use eligible free allowances, but account eligibility and quotas must be checked. The app cannot guarantee a $0 or $3 financial ceiling if you link billing or enable a paid model/plan. A public client can spoof Origin and consume the shared allowance; no public API key scheme solves that. Add authentication before treating this as a commercial service.

Check actual use in Cloudflare Workers metrics and Durable Objects usage, and in AI Studio API usage/rate-limit dashboards. Check billing state in the Google Cloud project and Cloudflare account before activation and periodically thereafter. Do not infer remaining quota from a successful local answer.

Emergency stop: set `AI_ENABLED=false` and redeploy, or remove the Worker secret. Disabling a frontend button is not a server shutdown.

## Acceptance checklist

- Run `npm test`; all 26 tests should pass.
- In Performance, use Email + September 2026: revenue $6,200, spend $510, conversions 126.
- Use custom dates and comparison; check the reporting scope in Ask Your Data and Reports.
- Upload a sample via Data Studio; verify preview, mapping, validation and import confirmation.
- Download the selected CSV and inspect it. Build the report, open Print / Save PDF, and inspect page breaks in your browser.
- Test a narrow phone viewport, keyboard focus, themes, collapsed navigation, saved plans, and empty selections.
- Test a real Gemini call separately; do not spend the daily allowance on repetitive smoke tests. Unit tests use mocks.

## Connection check and private key entry

The **Check Gemini connection** button calls `GET /status`, which verifies Worker configuration only and never calls Gemini or consumes its upstream-attempt quota. It does not certify that Google accepts the key/model. Test one synthetic question after setup to verify that separately.

If a key has already been shared in chat, revoke it in Google AI Studio and create a replacement. Do not send the replacement in chat. After Cloudflare login, run `npm run worker:secret` from the project root and enter the replacement only in Wrangler's hidden prompt. Run `npm run worker:deploy` after updating the origin, model, and AI-enabled settings. Send only the public Worker URL when requesting help connecting the frontend.
