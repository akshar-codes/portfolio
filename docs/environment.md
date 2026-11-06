# Environment Variables

## Backend (`backend/.env` locally — Render dashboard in production)

| Variable               | Required                                    | Description                                                                                                                                                                                             |
| ---------------------- | ------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `NODE_ENV`             | Yes                                         | `development` \| `production` \| `test`. Controls cookie `Secure` flag, error verbosity, log format, and Cloudinary folder prefix (`dev/`/`prod/`/`test/`). Render sets this via `backend/render.yaml`. |
| `PORT`                 | No — **do not set manually on Render**      | Render injects `PORT` automatically at runtime; `server.js` already reads `process.env.PORT`. Only set this yourself for local (non-Docker) runs where you want a port other than `5000`.               |
| `MONGO_URI`            | Yes                                         | MongoDB connection string (Atlas or self-hosted). Validated at startup — process exits if missing. Set as a `sync: false` secret in Render.                                                             |
| `ATLAS_URI`            | Optional, clone script only                 | Atlas source or destination URI for `backend/clone-db.js`.                                                                                                                                              |
| `LOCAL_MONGO_URI`      | Optional, clone script only                 | MongoDB source or destination URI for `backend/clone-db.js`.                                                                                                                                            |
| `DB_CLONE_DIRECTION`   | Optional, clone script only                 | `atlas-to-mongo` or `mongo-to-atlas`.                                                                                                                                                                   |
| `DB_CLONE_CONFIRM`     | Required to run clone                       | Must exactly equal `DROP_DESTINATION_DATABASE`; the selected destination database is dropped before copying.                                                                                            |
| `JWT_SECRET`           | Yes                                         | Signing secret for admin session JWTs. Use a long, random value (32+ bytes). Rotating this invalidates all active admin sessions.                                                                       |
| `ALLOWED_ORIGIN`       | Yes                                         | Exact origin (scheme + host, no path/trailing slash) of the deployed **Vercel** frontend, e.g. `https://your-portfolio.vercel.app`. Enforced by CORS on every request.                                  |
| `CLOUD_NAME`           | Yes                                         | Cloudinary cloud name.                                                                                                                                                                                  |
| `CLOUD_API_KEY`        | Yes                                         | Cloudinary API key.                                                                                                                                                                                     |
| `CLOUD_API_SECRET`     | Yes                                         | Cloudinary API secret. Never expose client-side.                                                                                                                                                        |
| `ADMIN_EMAIL`          | Required                                    | The single admin's email address. Password and Google sign-in both require a code sent to this address.                                                                                                 |
| `GOOGLE_CLIENT_ID`     | Optional                                    | OAuth 2.0 web client ID from Google Cloud; configure together with the secret and callback URL to enable Google sign-in.                                                                                |
| `GOOGLE_CLIENT_SECRET` | Optional                                    | Backend-only OAuth client secret.                                                                                                                                                                       |
| `GOOGLE_CALLBACK_URL`  | Optional                                    | Exact API callback URL registered in Google Cloud, e.g. `https://portfolio-backend.onrender.com/api/admin/login/google/callback`.                                                                       |
| `OAUTH_SESSION_SECRET` | Optional                                    | Secret used to protect the temporary Passport OAuth state session. Defaults to `JWT_SECRET`; use a separate random value in production.                                                                 |
| `BREVO_API_KEY`        | Required                                    | Backend-only Brevo API key used for admin OTPs, website replies, and message notifications.                                                                                                             |
| `BREVO_FROM_EMAIL`     | Required                                    | Verified sender address configured in Brevo.                                                                                                                                                           |
| `BREVO_FROM_NAME`      | Optional                                    | Sender display name. Defaults to `Portfolio Admin`.                                                                                                                                                    |
| `LOG_LEVEL`            | No (default `debug` in dev, `info` in prod) | Winston log level.                                                                                                                                                                                      |

### Enable admin sign-in

Create or retain the one existing Admin document; sign-in never creates
accounts. Set `ADMIN_EMAIL` to the one allowed address and configure a verified
Brevo sender. Admins may sign in with their email and password followed by the
emailed code, or with Google followed by the same emailed code. OTP verification
is mandatory for both methods. For Google,
create a Google Cloud OAuth web client, add the deployed frontend to authorized
JavaScript origins, and register the exact `GOOGLE_CALLBACK_URL` as an
authorized redirect URI. Create a Brevo API key and set `BREVO_API_KEY`,
`BREVO_FROM_EMAIL`, and optionally `BREVO_FROM_NAME` in `backend/.env` and the
Render service environment. The sender must be verified in Brevo. Free email
senders such as Gmail may be rewritten by Brevo and can have reduced delivery;
a sender on a domain you control is recommended. Codes expire after 10 minutes
and are limited to five verification attempts. Keep the Brevo API key on the
backend.

Website replies and contact notifications use the same Brevo sender:

| Variable                     | Required                     | Description                                                                                  |
| ---------------------------- | ---------------------------- | -------------------------------------------------------------------------------------------- |
| `MESSAGE_NOTIFICATION_EMAIL` | Optional                     | Inbox for new-contact-message alerts. Defaults to the email address in the public profile.   |
| `GITHUB_TOKEN`               | Optional                     | Raises the GitHub API rate limit for automatic repository commit counts.                     |
| `PORTFOLIO_SNAPSHOT_TOKEN`   | Required in production       | Shared secret for the authenticated Vercel build snapshot request. At least 32 bytes.        |
| `VERCEL_DEPLOY_HOOK_URL`     | Required in production       | Vercel Deploy Hook called by **Admin → Dashboard → Publish Changes**.                        |

With Brevo configured, **Reply from website** sends plain-text email to the
address on the stored message. **Reply via email** continues to open your local
mail app.

When a new contact message is saved, the backend sends a separate notification
email to `MESSAGE_NOTIFICATION_EMAIL` (or the public profile email if unset),
using the configured Brevo sender. Add `MESSAGE_NOTIFICATION_EMAIL` in the
Render dashboard to choose a different notification inbox. If Brevo is not
configured, the message is still saved and the skipped notification is logged.

### One-off migration script only (`scripts/migrateCloudinary.js`)

Not required for normal operation — only needed if migrating assets to a
different Cloudinary account.

| Variable               | Required             | Description                        |
| ---------------------- | -------------------- | ---------------------------------- |
| `NEW_CLOUD_NAME`       | Only for this script | Destination Cloudinary cloud name. |
| `NEW_CLOUD_API_KEY`    | Only for this script | Destination Cloudinary API key.    |
| `NEW_CLOUD_API_SECRET` | Only for this script | Destination Cloudinary API secret. |

These migration-only variables belong in the backend example for reference,
but should normally remain unset.

---

## Frontend (`frontend/.env` locally — Vercel project settings in production)

| Variable                   | Required              | Description                                                                                                                                                                                                                             |
| -------------------------- | --------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `VITE_API_BASE_URL`        | Yes                   | Base URL the frontend's axios instance targets — the deployed **Render** API's base URL (e.g. `https://portfolio-backend.onrender.com/api`). **Inlined at build time** — changing it requires a redeploy on Vercel, not just a restart. |
| `PORTFOLIO_SNAPSHOT_URL`   | Recommended on Vercel | Full Render `/api/public/build-snapshot` endpoint. If omitted, the build script derives it from `VITE_API_BASE_URL`.                                                                                                                    |
| `PORTFOLIO_SNAPSHOT_TOKEN` | Required on Vercel    | Same secret as the backend variable; used only by the build script and never exposed as a `VITE_` variable.                                                                                                                             |

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
