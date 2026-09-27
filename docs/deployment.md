# Deployment Guide

## Production topology

```
Frontend  →  Vercel     (static build + SPA rewrites, frontend/vercel.json)
Backend   →  Render     (Docker web service, backend/render.yaml)
Database  →  MongoDB Atlas
Media     →  Cloudinary
```

The browser talks to the Render API directly, cross-origin. There is no
reverse proxy in front of the API in production — CORS is enforced by the
backend's `ALLOWED_ORIGIN` check (`backend/app.js`), and rate limiting is
enforced by `express-rate-limit` inside the API itself.

`docker-compose.yml` and `nginx.conf` are **local development / parity
testing tools only**. They are not part of the production deploy path and
are not invoked by any CI/CD pipeline. See "Local Docker testing" below if
you want to run the containerized build on your own machine.

---

## Prerequisites

1. A MongoDB Atlas cluster (or equivalent) — `MONGO_URI`.
2. A Cloudinary account — `CLOUD_NAME`, `CLOUD_API_KEY`, `CLOUD_API_SECRET`.
3. An Admin document already seeded in the database. This is a
   **single-admin** application — there is no public registration flow by
   design. Run your admin-seed script (kept out of version control per
   `backend/.gitignore`) against your production database once, before
   first login.
4. Run the content seed scripts once against production (idempotent,
   safe to re-run):
   ```
   node backend/src/scripts/seedProfile.js
   node backend/src/scripts/seedAbout.js
   node backend/src/scripts/seedResume.js
   ```
5. If migrating from a pre-grouped-technologies dataset, run:
   ```
   node backend/src/scripts/migrateGroupedTechnologies.js
   node backend/src/scripts/migrateOrder.js
   node backend/src/scripts/migrateCategories.js
   ```
   All migration scripts are idempotent (`$exists`/shape checks) and safe
   to re-run.

See `docs/environment.md` for the full variable reference.

---

## Backend — Render

1. In the Render dashboard, choose **New → Blueprint** and point it at
   this repository. Render will read `backend/render.yaml` and provision
   a Docker-based web service (`portfolio-backend`) automatically.
2. Fill in the real values for every `sync: false` variable declared in
   `render.yaml` (`MONGO_URI`, `JWT_SECRET`, `ALLOWED_ORIGIN`,
   `CLOUD_NAME`, `CLOUD_API_KEY`, `CLOUD_API_SECRET`) in the service's
   **Environment** tab. These are never committed to source control.
3. `ALLOWED_ORIGIN` must match the exact Vercel production domain (no
   trailing slash). Preview deployments on a different subdomain will be
   rejected by CORS unless added explicitly — intentional for a
   single-admin site.
4. Render supplies `PORT` automatically; `server.js` already reads
   `process.env.PORT`, so no manual port configuration is needed.
5. `healthCheckPath: /health` is already wired in `render.yaml` — confirm
   it goes green after the first deploy.
6. `numInstances` is pinned to `1` in `render.yaml` deliberately — see
   the scaling note in `docs/architecture.md` before ever changing this.

---

## Frontend — Vercel

1. Import the `frontend/` directory as the project root (Framework
   preset: Vite).
2. Build command `npm run build`, output directory `dist` (Vercel
   detects both automatically for a Vite project).
3. Set the `VITE_API_BASE_URL` environment variable to your deployed
   Render API's base URL (e.g. `https://portfolio-backend.onrender.com/api`).
   Vite inlines this at **build time** — changing it requires a redeploy,
   not just a restart.
4. `frontend/vercel.json` already provides:
   - SPA fallback rewrite for React Router
   - Long-lived immutable caching for fingerprinted `/assets/*` build
     output
   - `no-cache` on `index.html` so the shell always revalidates against
     the current asset bundle
   - Baseline security headers (`X-Content-Type-Options`,
     `X-Frame-Options`, `Referrer-Policy`, `Permissions-Policy`)

---

## Local Docker testing (not a deployment path)

Use this only to verify the containerized build behaves correctly before
pushing to Vercel/Render — it mirrors production code paths but is not
itself deployed anywhere.

```
cp backend/.env.example backend/.env   # fill in real dev values
docker compose up -d                    # backend + nginx-served frontend
# optionally, with a local MongoDB instead of Atlas:
docker compose --profile with-mongo up -d
```

- Frontend build served at `http://localhost:8080`
- Backend API reachable directly at `http://localhost:5000` (for
  Postman/Hoppscotch testing) and proxied through nginx at
  `http://localhost:8080/api`
- Health check: `curl http://localhost:8080/health`

`nginx.conf` in this stack exists purely to exercise the same reverse-proxy
patterns (gzip, security headers, rate limiting, SPA fallback) you'd get
from a hypothetical self-hosted setup — it is not what Vercel or Render
run.

---

## Rolling back

**Render:** use the dashboard's Deploys tab to redeploy any previous
successful deploy — no manual image tagging required.

**Vercel:** use the dashboard's Deployments tab to promote any previous
deployment to Production instantly.

If you also publish images via `.github/workflows/docker-publish.yml`
(optional, for self-hosting elsewhere), those are tagged by commit SHA and
semver in GHCR and can be pulled/retagged manually — but this is unrelated
to rolling back the actual Vercel/Render production deployment.

---

## Post-deploy checklist

- [ ] `GET https://<render-service>.onrender.com/health` returns `200`
      with `db: "connected"`
- [ ] Admin login works and sets the `admin_token` cookie with `Secure`
      flag (only true when `NODE_ENV=production`, which Render sets)
- [ ] Public contact form submission succeeds and appears in
      `/admin/messages`
- [ ] Cloudinary uploads succeed on a test project (thumbnail + gallery)
- [ ] CORS: confirm requests from any origin other than the exact
      Vercel production domain are rejected
- [ ] `VITE_API_BASE_URL` in the Vercel build points at the Render URL,
      not `localhost`

---

## Operations and recovery

### Monitoring and health

- Configure an external HTTPS uptime check for `https://<render-service>.onrender.com/health` at a 1–5 minute interval. Alert on non-200 responses and missed checks; the endpoint returns `503` when MongoDB is disconnected.
- Review Render service logs for startup failures, repeated 5xx responses, database reconnects, and `X-Request-Id` values reported by users. The API emits structured JSON in production. Logs are diagnostic and are not a durable audit or backup store.
- Review Vercel deployment/build status and MongoDB Atlas alerts (availability, storage, connections) at least weekly. Keep alerts routed to a monitored mailbox or on-call destination.
- Rate limits use the process-local memory store. Keep one backend instance unless a shared store is configured; restarting the service clears counters. This is an abuse throttle, not a substitute for upstream DDoS protection.

### Backup and restore

- Enable MongoDB Atlas automated backups / point-in-time recovery for the production cluster. Use a retention period that meets the site's recovery needs and verify backup success in Atlas.
- Before schema migrations or major content changes, create an on-demand snapshot. Keep Cloudinary as the media source of truth and retain access to its account; MongoDB backups do not include uploaded media bytes.
- At least quarterly, restore a recent snapshot into a separate staging cluster and verify the CMS can read content and media references. Never test restores against production.
- Record the Atlas restore procedure, authorized operators, and secret retrieval path in the team's private runbook. After restoring, update the Render `MONGO_URI` only when ready, deploy/restart, and verify `/health` plus the post-deploy checklist.

### Release and rollback procedure

1. Review the change and CI result on the commit intended for release. Confirm `npm audit` and the frontend build/lint jobs pass.
2. Back up the Atlas database before any migration; run only the migration scripts required by the release and check their output.
3. Merge/push to `main`; Render auto-deploys the backend. Confirm its deploy is healthy and `/health` reports `db: "connected"`.
4. Deploy the Vercel frontend with the production `VITE_API_BASE_URL`. Confirm the URL targets the deployed Render API and review the production deployment output.
5. Complete the smoke checks below. If a release is unhealthy, roll back backend and frontend independently using their provider dashboards, then restore a database snapshot only if the release changed data incompatibly.

### Production smoke QA

- [ ] Open `/`, `/services`, `/resume`, `/work`, and `/contact`; verify images, fonts, navigation, and browser console/network errors.
- [ ] Submit a valid contact form and verify the message appears in the protected CMS. Verify invalid email/empty fields are rejected and the honeypot does not create a message.
- [ ] Open `/admin/login`, sign in, verify refresh preserves the session, then log out and confirm protected pages return to login.
- [ ] Edit and publish a low-risk content item; confirm it appears publicly, then restore its prior state. Check project image upload and CMS media browsing if Cloudinary is enabled.
- [ ] Confirm a request from the configured site origin succeeds, an unrelated browser origin is rejected, invalid JSON returns 400, and repeated login failures eventually return 429.
- [ ] Check narrow mobile (320–375 px), tablet, and desktop layouts; keyboard navigation; and current Chrome, Firefox, Safari, and Edge. These are manual release checks and should be recorded with the release.

### Known verification limits

The repository does not provide a browser automation suite or real production credentials, so end-to-end cross-browser QA, provider alert delivery, snapshot restoration, and production API checks must be performed by an operator using the checklist above. Current verification also found existing frontend ESLint errors (including synchronous state updates in effects and unused declarations), and 28 moderate advisories in TipTap 2.x; the available npm fix requires the breaking TipTap 3 upgrade. Resolve these before treating the CI/release gate as green. Backend `npm audit --audit-level=high` reports no vulnerabilities; frontend reports no high/critical advisories after the compatible dependency updates.
