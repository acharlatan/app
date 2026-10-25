# Marketing Insights AI 1.0 — release verification

## Implemented

The release uses the provided wellness interface's visual principles: warm white surfaces, confident typography, soft rounded cards, a charcoal momentum/Strategy Lab composition, luminous pink for featured analysis, and lime for deliberate strategy emphasis. It uses original analytics content and real selected metrics, not the reference's identity, photographs or layout. Light/dark palettes, a mobile sidebar, keyboard analysis modes and reduced motion are explicitly designed.

The original continuous Import → Validate → Measure → Compare → Interpret → Decide → Experiment → Report journey remains. Details are expandable rather than removed. Search/sort/export share the same explorer selection; dashboard context remains authoritative. Experiments preserve their original baseline and scope during edits. Scenarios restore, edit and export with a dataset fingerprint check. Reports include actual comparisons, goals, saved plan scopes and limitations. Duplicate frontend comparison, navigation, legacy single-plan and direct-AI handlers were removed.

## Acceptance results

| Area | Actual result | Evidence / limit |
|---|---|---|
| Automated regression suite | Passed | 37 Node tests: analytics, dates, CSV, local answers, scenario restore, baseline preservation, response safety, Worker validation, quotas and failures |
| Worker bundle | Passed | Wrangler dry-run compiled shared dependency and listed native rate-limit / Durable Object bindings; no secret read and no deployment |
| Sample CSV download | Passed | Browser download event completed |
| CSV preview / mapping / validation / confirmation | Passed | 549-row synthetic fixture through the real file chooser; confirmed tab-only import |
| Invalid uploads | Passed | Missing spend rejected; exact duplicate records rejected; confirm disabled |
| Dates and comparison | Passed | Last 30 data days selected Sep 1–30; Aug 2–31 comparison; revenue 32,800 vs 29,195 |
| Momentum and campaign explorer | Passed | Metric/group controls, search Email (30 of 90 selected records), sort by revenue, selected-value output |
| Local analytical answer | Passed | “Why did CPA increase?” returned current 12.91 vs previous 13.28, a -2.84% observed change, without inventing causality |
| Experiment draft / save / edit / refresh | Passed | Draft reviewed and saved; edit after changing filters kept original 4.05 CPA baseline; persisted after refresh |
| Scenario create / restore / edit / export | Passed | Saved 90% efficiency, restored Email budget 600 after changing it to 200; preserved scope and values; updated Email to 620 and renamed the saved scenario |
| Report preview / text export | Passed | Current selection, comparisons, assumptions and saved plans appeared in preview; download event completed |
| Browser-local persistence | Passed | Saved plans/scenarios survived refresh; imported raw CSV intentionally reset to demo |
| Responsive layout | Passed | Real same-origin frame viewports at 390, 768 and 1440 pixels; body scroll width matched viewport; mobile collapse/expand, local answer and theme checked |
| Saved views / Back / Forward | Passed | Saved Sep 1–30 context restored after selecting seven days; browser Back/Forward restored section fragments |
| Desktop themes / navigation | Passed | Rendered light/dark inspection; section anchors and sidebar state checked |
| Drag-and-drop upload gesture | Not Verified | Handler retained; acceptance upload used the real file chooser |
| Browser Save as PDF pagination | Not Verified | Print stylesheet and print action provided; native PDF save/pagination was not certified in this browser environment |
| Assistive technology certification | Not Verified | Keyboard/ARIA/focus controls implemented; no screen-reader certification performed |
| Real Gemini response through production Worker | Not Verified | Must be recorded separately after the release deployment; /status configuration is insufficient |

The first attempt to re-upload a browser-downloaded temporary file failed in the browser file handoff. Uploading the explicit shared synthetic fixture succeeded; this was not recorded as an application import pass until the complete preview/confirm flow succeeded. Browser extension metadata errors were observed; no application-origin JavaScript error was observed in the checked console output.

## Deployment record

Development branch: release/v1-polish. The starting main commit remains its recoverable parent. Pull request and deployment statuses are verified separately at release publication. The architecture remains GitHub Pages frontend / Cloudflare Worker backend. No billing, paid resources, new API key, authentication system or cloud database was introduced.

## Release boundaries

1.0 is a publicly hosted marketing intelligence demo with useful nonconfidential-data workflows. It does not establish production authentication, private multi-user storage, audited attribution, causal inference or a monetary spending cap. Provider account access and key-revocation history cannot be inferred from the frontend. See DEPLOYMENT.md for updates, monitoring, emergency shutdown, secret rotation and troubleshooting.
