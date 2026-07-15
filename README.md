# Akshar Gupta — Portfolio

A full-stack portfolio site with a public-facing UI and a single-admin CMS
for managing all content: profile, about page, resume, projects, categories,
and contact messages.

**Stack:** MongoDB/Mongoose · Express 5 · React 19 · Node.js · Cloudinary ·
JWT (cookie-based auth) · React Router v6 · TanStack Query · `sonner`

**Hosting:** Vercel (frontend) · Render (backend) · MongoDB Atlas · Cloudinary

## Project structure

```
backend/     Express API — MVC/service-layered, see docs/architecture.md
frontend/    React SPA — public site + protected /admin CMS
docs/        Deployment, environment, and architecture reference
```

## Features

- Public site: About, Resume, Portfolio (filterable, paginated, with a
  project detail modal), Contact form (spam-protected via honeypot +
  rate limiting)
- Admin CMS (single admin account, cookie-based JWT auth):
  - Profile & social links (manually reorderable)
  - About paragraphs & service cards (manually reorderable)
  - Resume: education entries & skill categories (manually reorderable)
  - Projects: full CRUD, drag-free ↑/↓ reordering, grouped technology tags,
    thumbnail/banner/gallery image management via Cloudinary
  - Categories: create/delete (protected against deleting in-use categories)
  - Contact messages: paginated inbox, delete

## Local development

**Backend**

```
cd backend
cp .env.example .env   # fill in real values — see docs/environment.md
npm install
npm run dev             # nodemon, http://localhost:5000
```

**Frontend**

```
cd frontend
cp .env.example .env    # set VITE_API_BASE_URL to http://localhost:5000/api
npm install
npm run dev              # http://localhost:5173
```

**First-time data setup** (run once against your database):

```
node backend/scripts/seedProfile.js
node backend/scripts/seedAbout.js
node backend/scripts/seedResume.js
```

An Admin document must also exist before you can log in — this project has
no public registration flow by design (single-admin). Seed it via your own
admin-creation script (kept out of version control).

## Production deployment

**Production is Vercel (frontend) + Render (backend).** Full instructions:
**[docs/deployment.md](docs/deployment.md)**.

```
Frontend  → Vercel   (frontend/vercel.json)
Backend   → Render   (backend/render.yaml)
```

`docker-compose.yml` and `nginx.conf` are **local development / container
parity testing tools only** — they are not part of the production deploy
path and are not used by Vercel or Render. See "Local Docker testing" in
`docs/deployment.md` if you want to run the containerized build locally:

```
docker compose up -d
```

Full environment variable reference: **[docs/environment.md](docs/environment.md)**
Architecture, patterns, and scaling constraints: **[docs/architecture.md](docs/architecture.md)**

## CI/CD

- `.github/workflows/ci.yml` — lint, build, `npm audit`, and Docker build
  validation on every PR and push to `main`
- `.github/workflows/docker-publish.yml` — **optional**: builds and pushes
  tagged images to GHCR on push to `main` and on version tags. Not
  consumed by Vercel or Render; useful only if you also want to self-host
  a copy elsewhere.
- `.github/dependabot.yml` — weekly automated dependency update PRs for
  both `npm` workspaces, both Dockerfiles, and GitHub Actions.

## Operational scripts (`backend/scripts/`)

| Script                                              | Purpose                                                             | Idempotent                      |
| --------------------------------------------------- | ------------------------------------------------------------------- | ------------------------------- |
| `seedProfile.js` / `seedAbout.js` / `seedResume.js` | Seed singleton content documents                                    | Yes (`findOneAndUpdate` upsert) |
| `migration.js` (via `migrateCategories.js`)         | Migrate legacy string `category` → `Category` references            | Yes                             |
| `migrateOrder.js`                                   | Backfill `order` fields on projects/social links/skills             | Yes                             |
| `migrateGroupedTechnologies.js`                     | Migrate `Project.technologies` flat array → grouped shape           | Yes                             |
| `migrateCloudinary.js`                              | One-off: re-upload project images to a different Cloudinary account | No — run once, deliberately     |

## License

Private/personal project — not licensed for reuse.
