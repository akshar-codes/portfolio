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
   node backend/scripts/seedProfile.js
   node backend/scripts/seedAbout.js
   node backend/scripts/seedResume.js
   ```
5. If migrating from a pre-grouped-technologies dataset, run:
   ```
   node backend/scripts/migrateGroupedTechnologies.js
   node backend/scripts/migrateOrder.js
   node backend/scripts/migrateCategories.js
   ```
   All migration scripts are idempotent (`$exists`/shape checks) and safe
   to re-run.

See `docs/ENVIRONMENT.md` for the full variable reference.

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
   the scaling note in `docs/ARCHITECTURE.md` before ever changing this.

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
