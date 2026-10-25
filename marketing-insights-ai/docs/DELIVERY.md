# Delivery status and QA

## Completed in this release

Incremental static architecture preserved; no new npm dependencies. Existing dashboard/chart/CSV/theme features remain. Added a pure tested intelligence module; six-month synthetic history; campaign/objective filtering; dataset-relative presets; absolute/relative comparisons; scoped local assistant with optional Gemini interpretation; structured strategy guidance; multi-experiment management and ICE scoring; configurable goal scoring; threshold change alerts; per-channel budget allocations and scenario persistence; funnel; branded report preview; browser print/PDF flow; mapped CSV preview/validation/confirmation; saved views and onboarding; eleven ordered navigation sections; expanded portfolio/privacy explanations.

## Bugs and weaknesses addressed

- Worker context now includes selected dates, counts and campaign/filter scope; empty channels are omitted.
- AI responses are discarded when the scope changes; chat requests abort on scope changes.
- Legacy build script no longer overwrites modern application files.
- Full versus uploaded data labels are distinct.
- Reports include scope and comparison; efficiency rates use aggregate totals.
- Experiment baseline uses the selected experiment channel rather than an all-channel baseline.
- CSV exports escape formula prefixes including leading whitespace; import mappings reject duplicates and exact duplicate records.
- Invalid saved JSON falls back safely; saved views cannot silently broaden a missing campaign to all data.
- Private keys remain exclusively server-side; bounded question/history/context validation added.

## Automated verification

26 tests pass using Node's built-in test runner. Coverage includes original July–September benchmark, six-month CSV round trip, optional metadata, weighted KPIs, zero denominators, date filtering, reversed ranges, leap/calendar comparison boundaries, funnel ratios, goal scoring, sparse-data fallback, descriptive signals, budget validation, ICE scoring, assistant evidence, CSV aliases and US dates, malformed local JSON, bounded conversation/context, mocked Gemini success and upstream failure, payload-size rejection, CORS, fail-closed configuration, per-IP throttling and 30-attempt durable quota. No real Gemini tokens were consumed by tests.

## Browser verification

Verified on the available desktop browser: campaign/date synchronization; deterministic assistant answer with selected evidence; light/dark themes; collapse/expand navigation; no broken fragment targets; report preview for synthetic and uploaded data; three-row CSV mapping, validation, confirmed import; downloaded CSV parsed back to exactly three records; experiment save and scenario save. Browser extension metadata errors were observed, not application exceptions.

The browser file chooser/confirmation flow required recovery from an automation timeout; after accepting the test confirmation, the imported dataset and export were verified. This does not prove every browser/platform file-picker behaves identically.

## Partial or account-dependent

- Gemini integration is implemented and mocked, **not activated or live-tested**: no deployed owner Worker/key/default endpoint exists in this workspace. Visitors can use local intelligence now. Owner must verify model/free-tier access, deploy the Worker, set its secret, and set `config.js` once.
- GitHub Pages workflow/files are ready; publishing into the owner's GitHub account is not performed here. The private Sites review copy is separate.
- Reports support browser Print / Save as PDF, not an automatic binary PDF download. Print preview/page breaks need acceptance testing in the target browser.
- Responsive CSS is implemented; a genuine narrow-device browser session was unavailable. Do not claim full mobile/a11y certification. No formal assistive-technology audit.
- Local assistant supports a bounded set of intents and generic fallbacks. It is not a local language model. Gemini receives only bounded recent context. AI-generated numerical prose is not guaranteed correct; calculated evidence is the reference.
- Change alerts are deterministic threshold comparisons, not statistically validated anomaly detection. Scoring is a configurable goal rubric, not an objective benchmark.
- One active dataset; three supported channels; extra funnel stages require a future schema/mapping extension. Core funnel is impressions/clicks/conversions. No unique reach when absent.
- Scenario comparison is descriptive saved cards; there are no confidence intervals, causal forecasts, or ad-spend execution.
- Local storage is browser-specific and not encrypted/synchronized. There are no accounts, integrations with live ad platforms, authentication on the public Worker, or multi-user roles.
- Some legacy dashboard UI remains alongside the new module to preserve backward compatibility. A later refactor can consolidate rendering after broader browser regression coverage.

## Recommended next work

1. Complete the actual Worker/key/config setup without enabling paid billing, then perform one live Gemini test.
2. Perform phone-width, keyboard-only, screen-reader and print/PDF acceptance testing.
3. Add authenticated API access before commercial use; public origin checks alone do not stop custom clients.
4. Extend schemas for additional channels, funnel stages, currencies and attribution models based on concrete data requirements.
5. Add a public GitHub repository link after publication and record real usability feedback.
