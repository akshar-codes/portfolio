# ============================================================
# Backend Dockerfile — Node/Express API
# Multi-stage build: install deps in isolation, run as non-root.
# ============================================================

# ---- Base ---------------------------------------------------
FROM node:20-alpine AS base
WORKDIR /app
ENV NODE_ENV=production

# ---- Dependencies --------------------------------------------
FROM base AS deps
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

# ---- Runtime ---------------------------------------------------
FROM base AS runtime

# curl is required for the container HEALTHCHECK below
RUN apk add --no-cache curl \
  && addgroup -S nodejs \
  && adduser -S nodeuser -G nodejs

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Never bake secrets into the image — .env is excluded via .dockerignore
# and must be supplied at runtime (env_file / orchestrator secrets).
RUN chown -R nodeuser:nodejs /app
USER nodeuser

EXPOSE 5000

HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD curl -fsS http://localhost:5000/health || exit 1

CMD ["node", "server.js"]