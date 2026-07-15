# Environment Variables

## Backend (`backend/.env`)

| Variable           | Required                                    | Description                                                                                                                                                 |
| ------------------ | ------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `NODE_ENV`         | Yes                                         | `development` \| `production` \| `test`. Controls cookie `Secure` flag, error verbosity, log format, and Cloudinary folder prefix (`dev/`/`prod/`/`test/`). |
| `PORT`             | No (default `5000`)                         | Port the Express server listens on.                                                                                                                         |
| `MONGO_URI`        | Yes                                         | MongoDB connection string (Atlas or self-hosted). Validated at startup — process exits if missing.                                                          |
| `JWT_SECRET`       | Yes                                         | Signing secret for admin session JWTs. Use a long, random value (32+ bytes). Rotating this invalidates all active admin sessions.                           |
| `ALLOWED_ORIGIN`   | Yes                                         | Exact origin (scheme + host, no path/trailing slash) of the deployed frontend. Enforced by CORS on every request.                                           |
| `CLOUD_NAME`       | Yes                                         | Cloudinary cloud name.                                                                                                                                      |
| `CLOUD_API_KEY`    | Yes                                         | Cloudinary API key.                                                                                                                                         |
| `CLOUD_API_SECRET` | Yes                                         | Cloudinary API secret. Never expose client-side.                                                                                                            |
| `LOG_LEVEL`        | No (default `debug` in dev, `info` in prod) | Winston log level.                                                                                                                                          |

### One-off migration script only (`scripts/migrateCloudinary.js`)

Not required for normal operation — only needed if migrating assets to a
different Cloudinary account.

| Variable               | Required             | Description                        |
| ---------------------- | -------------------- | ---------------------------------- |
| `NEW_CLOUD_NAME`       | Only for this script | Destination Cloudinary cloud name. |
| `NEW_CLOUD_API_KEY`    | Only for this script | Destination Cloudinary API key.    |
| `NEW_CLOUD_API_SECRET` | Only for this script | Destination Cloudinary API secret. |

---

## Frontend (`frontend/.env`)

| Variable            | Required | Description                                                                                                                                                                   |
| ------------------- | -------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `VITE_API_BASE_URL` | Yes      | Base URL the frontend's axios instance targets (e.g. `https://api.example.com/api`). **Inlined at build time** — changing it requires a rebuild/redeploy, not just a restart. |

---

## Docker Compose build args

| Variable            | Used by                | Description                                                                                                                                                                           |
| ------------------- | ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `VITE_API_BASE_URL` | `frontend` build stage | Must be exported in the shell (or set in CI secrets) before `docker compose build` — it's passed as a `--build-arg`, not a runtime env var, because Vite only reads it at build time. |

---

## Secrets checklist before first deploy

- [ ] `JWT_SECRET` is unique per environment (dev ≠ staging ≠ prod)
- [ ] `.env` files are never committed (already covered by `.gitignore` /
      `.dockerignore`)
- [ ] `CLOUD_API_SECRET` and `MONGO_URI` are stored in your platform's
      secret manager (Render/Vercel/GitHub Actions secrets), not in plain
      CI logs
- [ ] `ALLOWED_ORIGIN` matches the exact production frontend domain
