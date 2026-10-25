# Release audit — 1.0

## Source ownership

The release inspected the actual GitHub main tree and matched local file blob hashes before modification. `release/v1-polish` preserves the starting main as a recoverable parent. A pull request captures the release diff.

Removed duplicate comparison rendering, obsolete direct Gemini generation, legacy single-plan form handlers and competing navigation active-state handlers in app.js/platform.js. app.js exposes the authoritative dataset/filter API. The assistant, comparison, report and plans use that API. The legacy mi-experiment record migrates once into the multiple-plan store without deleting the original.

## Correctness fixes

CPA change questions now compare current/prior CPA; missing comparison evidence is explicit. Invalid custom dates are rejected. Search/sort/pagination/export operate on the same table selection without changing dashboard scope. Experiment edits preserve original baseline/scope; a KPI change computes within original scope. Scenario restore validates dataset fingerprint and assumptions. Blank allocations are invalid. Dataset and goal changes invalidate report/assistant context. Reports include all headline metrics, actual comparisons, assumptions, proposed tests, saved plan scopes and limitations. Generated/imported text uses textContent and a text-only response formatter.

## Privacy and public-demo risks

No authentication or private cloud storage is provided. CORS is not authentication; public endpoint abuse is limited by per-IP throttling and the shared daily Durable Object quota. These are request limits, not a monetary cap. A public adversary may consume the shared allowance. Free Google allowances depend on account/model availability. Do not use confidential inputs or enable billing without approval. Runtime secret content/rotation is not observable from public responses. Data is tab-local; preferences and plans are browser-local, unsynchronized and exportable.

## Deliberate release boundaries

No ad-platform execution, CRM integration, user accounts, subscriptions, causal attribution, unique reach, statistical significance engine or guaranteed forecast. Native browser PDF pagination and assistive-technology certification require separate environment-specific verification. CI and browser results are recorded in DELIVERY.md rather than inferred from source or configuration.
