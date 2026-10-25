# Marketing Insights AI 1.0

A browser-based marketing decision workspace by **Geovanni Hernandez**.

[Live application](https://acharlatan.github.io/app/) · [Source repository](https://github.com/acharlatan/app)

**Import → Validate → Measure → Compare → Interpret → Decide → Experiment → Report**

## What it does

- Weighted revenue, spend, ROAS, CPA, CPC, CPM, CTR and conversion metrics.
- Day/week/month momentum, scoped channel and campaign comparisons, explicit reporting ranges.
- Searchable, sortable, paginated campaign records and formula-safe CSV exports.
- CSV preview, column mapping, validation, exact-duplicate detection and confirmed import.
- Local analytical answers, optional Gemini interpretation with per-request consent, expandable evidence and editable experiment drafts.
- Transparent goal-based campaign health, a three-stage funnel, objective-specific test plans.
- Multiple saved experiments and budget scenarios with edit/restore/export; original experiment baselines are preserved during unrelated edits.
- Report preview, text/CSV export, copy summary and browser Print / Save as PDF.
- Continuous page navigation, collapsible sidebar, designed light/dark themes, reduced motion, responsive layouts.

## Trust and boundaries

Built-in data is **synthetic**: April–September 2026, 549 daily campaign/channel rows. It is not client performance. CSV imports support 1–1,000 rows, at most 500 KB, in USD. Supported channels: Paid Search, Paid Social, Email. Required fields: `date,campaign,channel,spend,revenue,impressions,clicks,conversions`; optional `objective,engagements`. Dates: YYYY-MM-DD or MM/DD/YYYY. Missing required amounts are rejected. Exact duplicates must be removed before import.

Uploaded data and conversation are held in tab memory. Reload restores the demo. Theme, sidebar, dashboard views, experiments and scenarios are stored in this browser only, without cloud synchronization. Export saved work as a backup. Do not use confidential data in this public demo.

Local Analysis does not send campaign data to an AI provider. Gemini receives selected aggregates, labels, a question and bounded recent history only after submission and consent. AI interpretation cannot overwrite calculated evidence. Attribution is descriptive; it does not prove causation, profit or incremental lift. Budget outputs are mathematical scenarios, not forecasts.

## Development

The GitHub repository nests this folder under `marketing-insights-ai/`. The root `.github/workflows/pages.yml` deploys `marketing-insights-ai/dist`. Cloudflare's Git integration uses root `marketing-insights-ai/worker` and `npx wrangler deploy`.

From this project folder:

```sh
npm test
python -m http.server 8000 --directory dist
```

Open http://localhost:8000. Python/Node are optional for local development; the public Pages app requires no installation. Localhost:8000 is explicitly allowed by the Worker. Opening HTML directly as a file is not supported.

`app.js` owns the active dataset, DOM filter values and primary render; its API is the single dataset/filter boundary. `platform.js` owns comparisons, plans, Data Studio, assistant and reports. `experience.js` owns section navigation and progressive disclosure. `release.js` owns overview presentation and analysis mode. Pure analytics and plan rules live in `analytics.js`, `intelligence.js` and `decision.js`. `response.js` renders a text-only Markdown subset without trusting AI HTML.

## AI backend

The public Worker address lives in `dist/config.js`. The Gemini credential exists only as Cloudflare's `GEMINI_API_KEY` secret. Never put it in GitHub, HTML, config.js or chat. The Worker uses an exact origin allowlist, native per-IP limit (3/minute), a singleton Durable Object allowance (30 upstream attempts/day UTC), a 16 KB request limit, bounded history/output and safe errors. Failed upstream attempts count. CORS is not authentication. These limits are not a currency spending cap; keep provider accounts on their free tiers.

See [owner operations](docs/DEPLOYMENT.md), [release verification](docs/DELIVERY.md), and [audit](docs/AUDIT.md). A configured `/status` response does not verify Google account/model access. A real completed question is required.
