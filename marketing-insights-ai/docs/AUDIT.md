# Baseline audit — 25 October 2026
Source: current Sites repository, commit 41c7e50. Attachment was a development brief, not replacement source.

Preserve: static relative asset paths, weighted totals, validated CSV import, daily synthetic data, filters, momentum SVG, theme, collapsible navigation, browser-local planning, exports, Worker CORS and durable global quota.
Baseline: 7/7 Node tests passed. Browser interactions from the preceding release verified ranges, momentum metrics, experiment save, sidebar collapse.

Confirmed: AI sends all three channels including empty channels and omits dates/campaigns; no chat; no default public endpoint config; only percent comparison; fixed CSV mapping; only 3 months; no print report; stale build.py overwrites newer source; one saved experiment; ratio handling scattered; optional metadata discarded. Async Gemini responses can be applied after filters change. Reports call uploaded results fictional without distinguishing source.
Security: secrets are server-side; durable singleton counts attempts; no in-memory global quota. CORS is not authentication. Arbitrary user questions need new size/history limits and untrusted-data handling. Local storage is untrusted and not synchronized. No secret was found in source. No live Worker or Gemini credentials available.
Suspected/needs verification: narrow-screen layout, quota binding behavior in a real account, actual account model availability, all import/export browser flows. Unit mocks do not establish deployed API functionality.
Technical limits: no accounts/cloud sync, known channel schema, click-based conversion funnel; attributed revenue does not establish profit or causality. Missing days cannot be distinguished from absent tracking. No automatic paid services.
