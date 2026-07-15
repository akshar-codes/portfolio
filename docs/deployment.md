# Deployment Guide

This project supports two deployment paths. Pick one — they are not meant
to run simultaneously against the same domain.

- **Path A — Managed (Vercel + Render/Railway):** matches the existing
  `frontend/vercel.json` rewrite config already in the repo. Fastest to set
  up, no server maintenance.
- **Path B — Self-hosted (Docker Compose + nginx):** uses the
  `docker-compose.yml`, `backend/Dockerfile`, `frontend/Dockerfile`, and
  `frontend/nginx.conf` in this repo. Use this if you want a single VM
  (e.g. a $5–10/mo droplet/VPS) instead of managed platforms.

---

## Prerequisites (both paths)

1. A MongoDB Atlas cluster (or equivalent) — `MONGO_URI`.
2. A Cloudinary account — `CLOUD_NAME`, `CLOUD_API_KEY`, `CLOUD_API_SECRET`.
3. An Admin document already seeded in the database. This is a **single-admin**
   application — there is no public registration flow by design. Run your
   admin-seed script (kept out of version control per `backend/.gitignore`)
   against your production database once, before first login.
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

## Path A — Managed (Vercel + Render/Railway)

**Frontend (Vercel):**

1. Import the `frontend/` directory as the project root.
2. Set the build command to `npm run build`, output directory `dist`.
3. Set `VITE_API_BASE_URL` to your deployed API's base URL (e.g.
   `https://your-api.onrender.com/api`). Vite bakes this in at build time —
   changing it requires a redeploy.
4. `vercel.json` already rewrites all routes to `/` for client-side routing.

**Backend (Render/Railway/Fly, etc.):**

1. Point the service at `backend/`, build with `npm ci`, start with
   `npm start`.
2. Set all variables from `backend/.env.example`.
3. Set `ALLOWED_ORIGIN` to the exact Vercel production domain (no trailing
   slash). Preview deployments on a different subdomain will be rejected by
   CORS unless added explicitly — this is intentional for a single-admin
   site.
4. **If your platform sits behind its own reverse proxy/load balancer**
   (most managed platforms do), `app.set('trust proxy', ...)` must be
   configured in `backend/app.js` for rate limiting and `req.ip` to work
   correctly. Confirm this before relying on the login/message rate limits.

---

## Path B — Self-hosted (Docker Compose)

1. Copy `backend/.env.example` → `backend/.env` and fill in real values.
2. Set `VITE_API_BASE_URL` as a shell/CI environment variable before
   building — it's passed into the frontend image as a build arg:
   ```
   export VITE_API_BASE_URL=https://your-domain.com/api
   ```
3. Build and start:
   ```
   docker compose build
   docker compose up -d
   ```
4. Confirm health:
   ```
   curl http://localhost/health
   ```
5. Put TLS in front of this stack (Caddy, or nginx + certbot on the host,
   or a cloud load balancer with a managed certificate) — the shipped
   `nginx.conf` serves plain HTTP on port 80 only. Terminate TLS one layer
   up rather than inside this container.
6. **Required backend change for this path:** `app.set('trust proxy', 1)`
   must be added to `backend/app.js` — the nginx container is a reverse
   proxy in front of Express, and without this, `express-rate-limit` will
   rate-limit by the proxy's IP instead of the real client's.

### Scaling note

Do **not** run `backend` with more than one replica in `docker-compose.yml`
(or across multiple hosts) without first swapping `utils/cache.js` and the
`express-rate-limit` store for a shared Redis backend. Both currently live
in process memory — see `docs/ARCHITECTURE.md`.

---

## Rolling back

Both Dockerfiles produce immutable, tagged images (via
`.github/workflows/docker-publish.yml`, tagged by commit SHA and semver).
To roll back:

```
docker compose pull   # if images are pulled from a registry rather than built locally
docker tag ghcr.io/<org>/<repo>/backend:<previous-sha> portfolio-backend:latest
docker compose up -d
```

## Post-deploy checklist

- [ ] `GET /health` returns `200` with `db: "connected"`
- [ ] Admin login works and sets the `admin_token` cookie with `Secure`
      flag (only true when `NODE_ENV=production`)
- [ ] Public contact form submission succeeds and appears in
      `/admin/messages`
- [ ] Cloudinary uploads succeed on a test project (thumbnail + gallery)
- [ ] CORS: confirm requests from any domain other than `ALLOWED_ORIGIN`
      are rejected
