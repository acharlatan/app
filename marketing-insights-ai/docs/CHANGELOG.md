# Changelog

## 2.0.0 — 25 October 2026

Audited existing static source before changes; 7 baseline tests passed. Preserved working architecture and added `intelligence.js`, `platform.js`, and public `config.js`. Added six-month demo history, scoped assistant, expanded planning/reporting/import workspaces, and security validation. Replaced destructive old build generator with a non-mutating compatibility check. Added 14 tests, bringing total to 21. Documented live API, public deployment, mobile and PDF verification limits. No paid service enabled and no new frontend dependency introduced.

## Connection readiness update — 25 October 2026
Added no-token-cost Worker configuration status, frontend connection checks, public endpoint validation, private secret-entry commands, and five mocked connection tests. No shared key was stored or used; activation requires a fresh private secret and the owner's Cloudflare deployment.
