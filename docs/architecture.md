# Architecture

## Overview

MERN stack, split into two independently deployed apps:

```
frontend/   React 19 + Vite + React Router v6 + TanStack Query  → Vercel
backend/    Node/Express 5 + Mongoose + Cloudinary + JWT         → Render
```

Single-admin application: there is exactly one authenticated role (Admin),
managing all site content through a protected CMS. There is no public
registration, no multi-tenant concept, and no roles/permissions beyond
"admin or not."

## Request flow (production)

```
Browser
  │
  ├─ Static SPA assets  → Vercel (frontend build) → served directly
  │
  └─ /api/*             → Render (backend:PORT, injected by Render)
                            → MongoDB Atlas / Cloudinary
```

There is **no reverse proxy in front of the backend in production.** The
browser calls the Render API origin directly (cross-origin from the
Vercel domain). Two mechanisms replace what a proxy would otherwise
enforce:

- **CORS** — `backend/app.js` only allows requests whose `Origin` header
  exactly matches `ALLOWED_ORIGIN` (the Vercel production domain).
- **Rate limiting** — enforced entirely inside Express via
  `express-rate-limit` (global limiter + per-route limiters for login and
  the public contact form). There is no edge-level rate limiting in
  production, unlike the local Docker Compose stack.

`nginx.conf` and `docker-compose.yml` exist solely for local
container-parity testing (see `docs/DEPLOYMENT.md`) and describe a
different, proxy-fronted topology that is **not** what runs in production.
Do not use them as a reference for how the deployed app actually behaves.

## Backend layering (enforced convention)

```
routes/       HTTP method + path + middleware wiring only
controllers/  Pure HTTP glue: destructure req → call service → map to status code
services/     All business logic. Throws Error objects with a `.status` property
              (via ServiceError), never sends responses directly.
models/       Mongoose schemas + validation + singleton statics where applicable
middleware/   Cross-cutting concerns (auth, sanitization, error handling)
utils/        Stateless helpers (AppError, asyncHandler, cache, logger, slug)
```

New features should follow this layering — no database calls in
controllers, no response-shaping in services.

## Key patterns

- **Cloudinary Stage → Save → Destroy**: for any update touching media,
  new assets are uploaded first, the MongoDB save happens second, and old
  assets are destroyed only after the save succeeds. On save failure,
  newly uploaded assets are rolled back. See `services/projectService.js`.
- **Singleton documents**: `Profile`, `Resume`, and `About` each have
  exactly one document (`owner: "default"`), fetched/created via a
  `getSingleton()` static. New single-instance content types should follow
  this same pattern rather than introducing ad-hoc "find the first
  document" logic.
- **Typed error codes**: services throw `ServiceError(message, status,
errorCode)`. The error middleware preserves `errorCode` through to the
  JSON response; the frontend's axios interceptor (`services/api.js`)
  extracts it onto `error.errorCode` so components can branch on specific
  failures (e.g. `CATEGORY_IN_USE`) without string-matching messages.
- **Snapshot-based dirty checks for manual reordering**: admin reorder UIs
  (`ManageAbout`, `ManageResume`, `ManageProfile`, `ManageProjects`)
  compare the current `_id` sequence against the last **server-confirmed**
  snapshot, not `order` field values against array indices — the latter
  always reads as "clean" immediately after a local move re-numbers the
  array.

## Deliberate constraints — read before scaling

**The backend must run as a single Render instance.**

Two pieces of shared state currently live in process memory, not in a
shared store:

1. `utils/cache.js` — an in-process `Map` used to cache category/project/
   about listings (60s TTL).
2. `express-rate-limit`'s default `MemoryStore` — backs the global, login,
   and message rate limiters.

`backend/render.yaml` pins `numInstances: 1` deliberately. If you scale to
multiple instances (or add a second region), each instance has its own
independent cache and rate-limit counters. Concretely:

- Cache invalidation (`invalidateProjectsCache()`, etc.) only clears the
  instance that handled the write — other instances keep serving stale
  reads for up to 60s per-instance, not 60s globally.
- Rate limits become effectively `N × limit` instead of `limit`, where `N`
  is the replica count.

This is an acceptable, deliberate trade-off for a single-admin portfolio
with modest traffic. If traffic ever justifies horizontal scaling, both of
these need to move to Redis (`ioredis` + a rate-limit store adapter)
before increasing `numInstances` — not after.

**`trust proxy` is required regardless of hosting choice.**

Render (like most managed platforms) puts its own edge proxy in front of
the container. `app.set('trust proxy', 1)` in `backend/app.js` is what
makes `req.ip` reflect the real client IP rather than Render's proxy
address — this is what IP-based rate limiting depends on. This is already
configured and does not need to change for the Render topology.

## Grouped technologies migration

`Project.technologies` was migrated from a flat `string[]` to a grouped
`[{ group, items }]` shape. `services/projectService.js`'s
`parseGroupedField()` accepts both shapes on write (flat arrays are
wrapped into a single `"General"` group), and
`frontend/src/components/ProjectDetails.jsx` /
`ManageProjects.jsx`'s `flattenTechNames()` auto-detect the shape on read.
This dual-shape support is intentional backward compatibility, not
leftover cruft — do not remove the flat-array branch until
`migrateGroupedTechnologies.js` has been run against every environment and
confirmed complete.
