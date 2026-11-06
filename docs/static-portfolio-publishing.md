# Static portfolio publishing

MongoDB remains the source of truth. CMS saves write only to MongoDB; the public Vercel deployment changes after an administrator selects **Publish Changes** on the dashboard.

## Deployment configuration

- In Render, set `PORTFOLIO_SNAPSHOT_TOKEN` to a random secret of at least 32 bytes and `VERCEL_DEPLOY_HOOK_URL` to the production Vercel deploy hook URL.
- In Vercel, set `PORTFOLIO_SNAPSHOT_URL` to the Render endpoint ending in `/api/public/build-snapshot`. Set `PORTFOLIO_SNAPSHOT_TOKEN` to the same secret. Keep the token unprefixed; never use a `VITE_` name.
- Keep `VITE_API_BASE_URL` set to the full Render API URL for the build-time snapshot fetch. In the deployed `.vercel.app` frontend, runtime API calls use the same-origin `/api` rewrite in `frontend/vercel.json`; local Vite development uses the configured dev proxy. This keeps credential cookies first-party for admin actions and preview.

Vercel downloads the authenticated snapshot and writes `frontend/public/generated/portfolio.json` before Vite builds. The deployment build fails when the URL/token is missing, the backend request fails, or the response is incomplete. The generated file is an artifact and is not CMS content. Public portfolio reads use the Vercel static file; authenticated admin preview, contact submission, and analytics use their existing APIs.

## Publishing

Save CMS edits as usual, then select **Publish Changes** in the admin dashboard. The API reports when Vercel accepts the deploy hook. The public site updates when the deployment completes. A failed trigger/build leaves the previously deployed snapshot available.

For the first deployment, configure both platforms and deploy once, then check `/generated/portfolio.json` and verify the public pages render. To roll back, promote the previous healthy Vercel deployment. MongoDB content remains unchanged and can be republished later.
