# Marketing Insights AI

Marketing intelligence portfolio by **Geovanni Hernandez**, focused on Digital Marketing Specialist, campaign strategy, analytics, and AI-assisted planning roles.

This is a working static demonstration with optional Gemini interpretation through a separate Cloudflare Worker. **All built-in campaign results are synthetic**, not client achievements. The local data assistant is deterministic and limited to supported marketing questions; it is not an LLM. Live Gemini requires owner setup and has not been tested against a real key in this delivery.

## Run locally

1. Install a supported Node.js release (the GitHub workflow uses Node 22).
2. Run `npm test` from the project folder. No npm dependencies are required for the frontend or tests.
3. Serve `dist/` with a local HTTP server, for example `python -m http.server 8080 --directory dist`.
4. Open `http://localhost:8080`. Modules require HTTP; double-clicking the HTML file is not supported.

`dist/` contains the editable static application, not generated output. `build.py` checks that it exists and never overwrites the UI.

## Capabilities

- Six months of daily synthetic observations (April–September 2026; 549 channel/date records).
- Channel, campaign, objective, and inclusive date filters; dataset-relative presets; prior equal period, previous month, and custom comparisons.
- Weighted revenue/spend/count totals; CTR, CPC, CPM, conversion rate, CPA, ROAS; optional engagement rate.
- Interactive momentum, channel and campaign comparison, a three-stage funnel, explanatory performance breakdowns.
- Ask Your Data: calculated answers, optional Gemini interpretation, evidence disclosure, copy, session history, and stale-request protection.
- Objective-based Strategy Lab; multiple editable experiments, channel-specific baselines, ICE priority judgments, statuses, notes, and JSON exports.
- Configurable goal-rubric health scores and descriptive threshold change alerts.
- Per-channel budget allocations with editable efficiency assumptions, evidence thresholds, saved scenarios, and exports.
- Branded report preview, print / browser Save as PDF, executive-summary copy, CSV and text exports.
- Data Studio: drag/drop or file selection, first-five-row preview, column mapping, validation, duplicate detection, confirmation, reset, sample CSV.
- Collapsible ordered navigation, dark/light theme, browser-local saved views, guided first use, accessible form labels.

## Structure

| File | Responsibility |
| --- | --- |
| `dist/app.js` | Existing dashboard, interactive chart, table, filters, legacy local plans, Worker insights |
| `dist/analytics.js` | CSV schema, parsing, export escaping, aggregation, synthetic records |
| `dist/intelligence.js` | Testable KPI, filtering, comparison, scoring, funnel, scenario and local-answer functions |
| `dist/platform.js` | Intelligence workspaces, data import, chat, experiments, reports, saved views |
| `dist/config.js` | Public Worker URL and request timeout; **never secrets** |
| `worker/index.js` | Input validation, scoped context, Gemini calls, rate limits, shared durable quota |
| `worker/wrangler.jsonc` | Worker bindings and disabled-by-default AI settings |
| `tests/` | Arithmetic, CSV, context, mock API, safeguards and regression tests |
| `.github/workflows/pages.yml` | Test, package `dist/`, deploy to Pages |
| `docs/` | Baseline audit, deployment, QA, delivery matrix, changelog and portfolio copy |

## Data contract

Required columns: `date,campaign,channel,spend,revenue,impressions,clicks,conversions`.
Optional columns: `objective,engagements`.

Dates: `YYYY-MM-DD` or US `MM/DD/YYYY`; invalid calendar dates rejected. Known aliases include `day`, `campaign_name`, `channel_name`, `cost`, `sales`, `conversion`. Data Studio permits explicit column mapping. Channels currently must be **Paid Search**, **Paid Social**, or **Email**. Numeric values must be finite and nonnegative; counts must be whole numbers. This schema assumes click-based conversions with `conversions ≤ clicks ≤ impressions`; adapt it before using view-through or repeated-conversion datasets. Engagement rate is events/impressions and can exceed 100% if multiple events per impression are recorded.

Limits: 500 KB, 1–1,000 records, one active dataset at a time. Exact duplicate records are rejected by the preview workflow to prevent accidental double counting. Missing values in required metrics are rejected, never silently converted to zero. Missing dates are not assumed to represent zero activity. Currency is USD; currency conversion is not supported.

## Privacy and persistence

CSV data stays in tab memory and disappears on reload. Experiments, scenarios, checklist state, views, and preferences persist in local browser storage; they are **not encrypted or synchronized across devices**. Use synthetic/nonconfidential data. Export plans before clearing browser data. Clearing saved items asks for confirmation.

Optional Gemini sends selected channel and campaign aggregates, filter labels and reporting dates, comparison aggregates/range, your question, and up to four recent question/answer pairs after explicit submission and consent. It does not send raw CSV rows or API keys. Labels and messages are treated as untrusted data. Gemini interpretation can still be wrong; inspect the evidence and do not treat prompt instructions as a guarantee against hallucinations or prompt injection.

## Deployment and activation

Follow [the deployment guide](docs/DEPLOYMENT.md). GitHub Pages and Cloudflare setup require your accounts. The private Sites review deployment is separate from your own public Pages deployment. `dist/config.js` has an empty endpoint intentionally until a Worker is deployed. Set its public URL once for all visitors; visitors never need a key. The owner setup panel also supports a local URL override when no default is configured.

No billing was enabled. The target is $0 using eligible free plans, subject to each account's current quotas and model access. Application request limits are **not a guaranteed financial spending cap**. See the deployment guide for usage checks and emergency shutdown.

## Verification and limitations

26 automated tests pass. Browser checks verified scoped assistant answers, campaign/date filters, light/dark themes, navigation collapse, experiment save, scenario save, CSV preview/validation/import, CSV download, report content, and absence of broken fragment links. A synthetic three-row browser export was parsed back as three valid records. No real Gemini request or live Cloudflare account deployment was performed. Narrow-device emulation and print/PDF output need final acceptance testing; responsive CSS and print layouts are implemented but not claimed as device-certified.

See [QA and delivery status](docs/DELIVERY.md) for completed and partial scope. No authentication, cloud persistence, direct ad-network/CRM connection, statistical anomaly significance, extra mapped funnel stages, or automatic budget execution is included.

## Portfolio description

> Marketing Insights AI is an interactive portfolio project by Geovanni Hernandez that connects campaign measurement with testable marketing decisions. It combines weighted KPI analysis, campaign comparisons, a scoped data assistant, experiment planning, and budget scenarios in a responsive dashboard. Built-in results are synthetic; Gemini interpretation is optional and protected by a server-side Worker, validation, and usage safeguards.

## Official references

- [Gemini models and availability](https://ai.google.dev/gemini-api/docs/models)
- [Gemini pricing](https://ai.google.dev/gemini-api/docs/pricing) and [rate limits](https://ai.google.dev/gemini-api/docs/rate-limits)
- [Cloudflare Durable Objects pricing](https://developers.cloudflare.com/durable-objects/platform/pricing/)
- [Cloudflare rate limiting](https://developers.cloudflare.com/workers/runtime-apis/bindings/rate-limit/)
- [GitHub Pages workflows](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages)
