# Environment Variables

## Backend (`backend/.env` locally — Render dashboard in production)

| Variable           | Required                                    | Description                                                                                                                                                                                             |
| ------------------ | ------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `NODE_ENV`         | Yes                                         | `development` \| `production` \| `test`. Controls cookie `Secure` flag, error verbosity, log format, and Cloudinary folder prefix (`dev/`/`prod/`/`test/`). Render sets this via `backend/render.yaml`. |
| `PORT`             | No — **do not set manually on Render**      | Render injects `PORT` automatically at runtime; `server.js` already reads `process.env.PORT`. Only set this yourself for local (non-Docker) runs where you want a port other than `5000`.               |
| `MONGO_URI`        | Yes                                         | MongoDB connection string (Atlas or self-hosted). Validated at startup — process exits if missing. Set as a `sync: false` secret in Render.                                                             |
| `JWT_SECRET`       | Yes                                         | Signing secret for admin session JWTs. Use a long, random value (32+ bytes). Rotating this invalidates all active admin sessions.                                                                       |
| `ALLOWED_ORIGIN`   | Yes                                         | Exact origin (scheme + host, no path/trailing slash) of the deployed **Vercel** frontend, e.g. `https://your-portfolio.vercel.app`. Enforced by CORS on every request.                                  |
| `CLOUD_NAME`       | Yes                                         | Cloudinary cloud name.                                                                                                                                                                                  |
| `CLOUD_API_KEY`    | Yes                                         | Cloudinary API key.                                                                                                                                                                                     |
| `CLOUD_API_SECRET` | Yes                                         | Cloudinary API secret. Never expose client-side.                                                                                                                                                        |
| `LOG_LEVEL`        | No (default `debug` in dev, `info` in prod) | Winston log level.                                                                                                                                                                                      |

### One-off migration script only (`scripts/migrateCloudinary.js`)

Not required for normal operation — only needed if migrating assets to a
different Cloudinary account.

| Variable               | Required             | Description                        |
| ---------------------- | -------------------- | ---------------------------------- |
| `NEW_CLOUD_NAME`       | Only for this script | Destination Cloudinary cloud name. |
| `NEW_CLOUD_API_KEY`    | Only for this script | Destination Cloudinary API key.    |
| `NEW_CLOUD_API_SECRET` | Only for this script | Destination Cloudinary API secret. |

---

## Frontend (`frontend/.env` locally — Vercel project settings in production)

| Variable            | Required | Description                                                                                                                                                                                                                             |
| ------------------- | -------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `VITE_API_BASE_URL` | Yes      | Base URL the frontend's axios instance targets — the deployed **Render** API's base URL (e.g. `https://portfolio-backend.onrender.com/api`). **Inlined at build time** — changing it requires a redeploy on Vercel, not just a restart. |

---

## Render blueprint (`backend/render.yaml`)

All secret-bearing variables are declared with `sync: false`, meaning
Render will prompt for their values in the dashboard on first deploy and
will not store or expose them in the repo. `PORT` is intentionally absent
— Render manages it. See `docs/DEPLOYMENT.md` for the full setup walk-through.

---

## Local Docker Compose build args (local testing only — not production)

| Variable            | Used by                | Description                                                                                                                                                                        |
| ------------------- | ---------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `VITE_API_BASE_URL` | `frontend` build stage | Must be exported in the shell before `docker compose build` (defaults to `http://localhost:5000/api` if unset) — passed as a `--build-arg` since Vite only reads it at build time. |

---

## Secrets checklist before first deploy

- [ ] `JWT_SECRET` is unique per environment (dev ≠ Render production)
- [ ] `.env` files are never committed (already covered by `.gitignore` /
      `.dockerignore`)
- [ ] `CLOUD_API_SECRET` and `MONGO_URI` are stored in Render's
      environment variable manager, not in plain CI logs
- [ ] `ALLOWED_ORIGIN` matches the exact Vercel production domain
- [ ] `VITE_API_BASE_URL` on Vercel points at the Render service URL, not
      `localhost`
