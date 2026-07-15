# Architecture

## Overview

MERN stack, split into two independently deployable apps:

```
frontend/   React 19 + Vite + React Router v6 + TanStack Query
backend/    Node/Express 5 + Mongoose + Cloudinary + JWT (cookie-based)
```

Single-admin application: there is exactly one authenticated role (Admin),
managing all site content through a protected CMS. There is no public
registration, no multi-tenant concept, and no roles/permissions beyond
"admin or not."

## Request flow

```
Browser
  │
  ├─ Static SPA assets  → nginx (frontend container) → served directly
  │
  └─ /api/*             → nginx (frontend container) → backend:5000 → MongoDB / Cloudinary
```

In the self-hosted (Docker Compose) path, nginx is the single public entry
point. The backend is never exposed directly to the internet — it's only
reachable on the internal Docker network as `backend:5000`.

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

**The backend must run as a single instance.**

Two pieces of shared state currently live in process memory, not in a
shared store:

1. `utils/cache.js` — an in-process `Map` used to cache category/project/
   about listings (60s TTL).
2. `express-rate-limit`'s default `MemoryStore` — backs the global, login,
   and message rate limiters.

If you run more than one backend replica (multiple containers, multiple
regions, autoscaling), each instance has its own independent cache and
rate-limit counters. Concretely:

- Cache invalidation (`invalidateProjectsCache()`, etc.) only clears the
  instance that handled the write — other instances keep serving stale
  reads for up to 60s per-instance, not 60s globally.
- Rate limits become effectively `N × limit` instead of `limit`, where `N`
  is the replica count — an attacker hitting a round-robin load balancer
  gets a fresh bucket on each instance.

This is an acceptable, deliberate trade-off for a single-admin portfolio
with modest traffic. If traffic ever justifies horizontal scaling, both of
these need to move to Redis (`ioredis` + a rate-limit store adapter)
before adding a second replica — not after.

**Reverse proxy requires `trust proxy`.**

Both the self-hosted nginx path and most managed platforms (Vercel,
Render, Railway) put a proxy in front of Express. Without
`app.set('trust proxy', ...)` configured to match your proxy topology,
`req.ip` reflects the proxy's address for every request, which defeats
IP-based rate limiting. See `docs/DEPLOYMENT.md`.

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
