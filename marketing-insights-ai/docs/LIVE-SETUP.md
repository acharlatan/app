# Live deployment — acharlatan/app

Frontend: https://acharlatan.github.io/app/
Backend: https://marketing-insights-ai.icareaboutyoufam.workers.dev

## One-time GitHub Pages setting
Open repository Settings → Pages → Build and deployment → Source → GitHub Actions.
The root .github/workflows/pages.yml runs the tests in marketing-insights-ai and publishes marketing-insights-ai/dist. If the initial run fails before Pages is enabled, open Actions → Publish GitHub Pages → Run workflow after changing the setting.

## Cloudflare
Keep the Git integration root marketing-insights-ai/worker and deploy command npx wrangler deploy. main is the production branch. The committed wrangler.jsonc is authoritative for AI_ENABLED, GEMINI_MODEL and ALLOWED_ORIGINS on each deployment. Preserve the production GEMINI_API_KEY secret in Cloudflare; it is deliberately absent from GitHub. Only use a replacement for any previously exposed key and revoke the old key in Google AI Studio. Code cannot verify key rotation history.

The configured model is gemini-3.5-flash-lite. Availability and free allowance depend on the Google project. Do not enable billing to resolve quota failures. Cloudflare retains the native per-IP limit (3/minute) and shared Durable Object allowance (30 upstream attempts/day UTC, including failed upstream attempts). These limits are not a dollar spending cap; keep the Google project on its free tier. No retries are automatic. CORS is not authentication.

## Verify
After Cloudflare reports its deployment successful, open Ask Your Data and click Check Gemini connection. A configured status checks bindings and secret presence, but does not verify Google access. Select Add Gemini interpretation and ask Which channel has the strongest ROAS? A successful response includes Gemini interpretation. If it fails, local calculated analysis stays available. The browser Network panel can show the safe response from /chat; never copy secret settings into chat or GitHub.

## Free local preview (optional)
On a computer with Python installed, run from the marketing-insights-ai folder:

    python -m http.server 8000 --directory dist

Open http://localhost:8000. The frontend still calls the same Cloudflare Worker; the secret remains there. localhost and 127.0.0.1 on port 8000 are explicitly allowed. Opening index.html directly as a file does not support the ES module app reliably. On a temporary PC use the hosted Pages URL instead; no installation is required.

## Future updates
Edit files within marketing-insights-ai and commit to main. GitHub Actions republishes the frontend after tests pass; Cloudflare independently redeploys its Worker through the existing Git integration. Check both deployment results. Changes to the production secret belong only in Cloudflare.
