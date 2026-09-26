import "dotenv/config";
import { randomUUID } from "crypto";
import express from "express";
import compression from "compression";
import cors from "cors";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import morgan from "morgan";

import validateEnv from "./config/validateEnv.js";
import mongoSanitize from "./middleware/sanitizeMiddleware.js";
import { globalLimiter } from "./middleware/rateLimiters.js";
import logger, { morganStream } from "./utils/logger.js";
import errorMiddleware from "./middleware/errorMiddleware.js";
import { JSON_BODY_LIMIT } from "./constants/index.js";
import AppError from "./utils/AppError.js";

// ── Admin (protected) routes ────────────────────────────────────────
import adminAuthRoutes from "./routes/admin/authRoutes.js";
import adminCategoryRoutes from "./routes/admin/categoryRoutes.js";
import adminProjectRoutes from "./routes/admin/projectRoutes.js";
import adminProjectListRoutes from "./routes/admin/projectAdminRoutes.js";
import adminMessageRoutes from "./routes/admin/messageRoutes.js";
import adminResumeRoutes from "./routes/admin/resumeRoutes.js";
import adminProfileRoutes from "./routes/admin/profileRoutes.js";
import adminAboutRoutes from "./routes/admin/aboutRoutes.js";
import adminMediaRoutes from "./routes/admin/mediaRoutes.js";
import adminMediaFolderRoutes from "./routes/admin/mediaFolderRoutes.js";
import adminSiteSettingsRoutes from "./routes/admin/siteSettingsRoutes.js";
import adminNavigationRoutes from "./routes/admin/navigationRoutes.js";
import adminFooterRoutes from "./routes/admin/footerRoutes.js";
import adminSeoRoutes from "./routes/admin/seoRoutes.js";
import adminActivityRoutes from "./routes/admin/activityRoutes.js";
import adminPortfolioAnalyticsRoutes from "./routes/admin/portfolioAnalyticsRoutes.js";
import adminContentVersionRoutes from "./routes/admin/contentVersionRoutes.js";
import activityLogger from "./middleware/activityLogger.js";

// ── General (public) routes ──────────────────────────────────────────
import healthRoutes from "./routes/general/healthRoutes.js";
import portfolioAnalyticsRoutes from "./routes/general/portfolioAnalyticsRoutes.js";
import categoryRoutes from "./routes/general/categoryRoutes.js";
import projectRoutes from "./routes/general/projectRoutes.js";
import messageRoutes from "./routes/general/messageRoutes.js";
import resumeRoutes from "./routes/general/resumeRoutes.js";
import profileRoutes from "./routes/general/profileRoutes.js";
import aboutRoutes from "./routes/general/aboutRoutes.js";
import siteSettingsRoutes from "./routes/general/siteSettingsRoutes.js";
import navigationRoutes from "./routes/general/navigationRoutes.js";
import footerRoutes from "./routes/general/footerRoutes.js";
import seoRoutes from "./routes/general/seoRoutes.js";

/* ------------------------------------------------------------------ *
 * 1. Validate all required environment variables before doing anything
 * ------------------------------------------------------------------ */
validateEnv();

const app = express();

const { ALLOWED_ORIGIN, NODE_ENV } = process.env;

/* ------------------------------------------------------------------ *
 * 2. Trust the first reverse-proxy hop.
 * ------------------------------------------------------------------ */
app.set("trust proxy", 1);

/* ------------------------------------------------------------------ *
 * 3. Request correlation IDs
 * ------------------------------------------------------------------ */
app.use((req, res, next) => {
  req.id = randomUUID();
  res.setHeader("X-Request-Id", req.id);
  next();
});

/* ------------------------------------------------------------------ *
 * 4. Security headers
 * ------------------------------------------------------------------ */
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'"],
        objectSrc: ["'none'"],
        upgradeInsecureRequests: [],
      },
    },
  }),
);

/* ------------------------------------------------------------------ *
 * 5. HTTP request logging (morgan → winston)
 * ------------------------------------------------------------------ */
// Log the route path without query parameters, which can contain private
// search terms or accidentally supplied credentials.
morgan.token("request-id", (req) => req.id);
morgan.token("route-path", (req) => req.path);
const morganFormat = NODE_ENV === "production"
  ? ":request-id :remote-addr :method :route-path :status :res[content-length] - :response-time ms"
  : "dev";
app.use(morgan(morganFormat, { stream: morganStream }));
// Compress JSON, HTML, CSS, and JavaScript responses over the wire.
app.use(compression({ threshold: 1024 }));

/* ------------------------------------------------------------------ *
 * 6. CORS
 * ------------------------------------------------------------------ */
app.use(
  cors({
    origin: (incomingOrigin, callback) => {
      if (!incomingOrigin || incomingOrigin === ALLOWED_ORIGIN) {
        callback(null, true);
      } else {
        callback(new AppError("Origin is not allowed.", 403));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

/* ------------------------------------------------------------------ *
 * 7. Body parsers + cookie parser
 * ------------------------------------------------------------------ */
app.use(express.json({ limit: JSON_BODY_LIMIT }));
app.use(express.urlencoded({ extended: true, limit: JSON_BODY_LIMIT }));
app.use(cookieParser());
app.use("/api", (req, res, next) => {
  if (req.method !== "GET") return next();
  if (req.path.startsWith("/admin") || req.path.startsWith("/messages") || req.path.startsWith("/analytics") || req.query.preview) {
    res.setHeader("Cache-Control", "private, no-store");
  } else {
    res.setHeader("Cache-Control", "public, max-age=30, stale-while-revalidate=60");
  }
  return next();
});

/* ------------------------------------------------------------------ *
 * 8. MongoDB injection sanitizer
 * ------------------------------------------------------------------ */
app.use(mongoSanitize);
app.use(activityLogger);

/* ------------------------------------------------------------------ *
 * 9. Health check — mounted BEFORE the global rate limiter so
 * ------------------------------------------------------------------ */
app.use("/health", healthRoutes);

/* ------------------------------------------------------------------ *
 * 10. Global rate limiter
 * ------------------------------------------------------------------ */
app.use(globalLimiter);

/* ------------------------------------------------------------------ *
 * 11. Routes
 * ------------------------------------------------------------------ */
app.use("/api/admin", adminAuthRoutes);
app.use("/api/admin/activity", adminActivityRoutes);
app.use("/api/admin/analytics", adminPortfolioAnalyticsRoutes);
app.use("/api/admin/content", adminContentVersionRoutes);
app.use("/api/analytics", portfolioAnalyticsRoutes);
app.use("/api/admin/categories", adminCategoryRoutes);
app.use("/api/categories", categoryRoutes);

app.use("/api/projects", projectRoutes);
app.use("/api/projects", adminProjectRoutes);
// Dedicated admin listing mount — kept separate from /api/projects so
// its GET / and GET /:id can never be shadowed by the public router's
// identically-shaped routes registered on that same prefix above.
app.use("/api/admin/projects", adminProjectListRoutes);

app.use("/api/messages", messageRoutes);
app.use("/api/messages", adminMessageRoutes);

app.use("/api/resume", resumeRoutes);
app.use("/api/admin/resume", adminResumeRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/admin/profile", adminProfileRoutes);
app.use("/api/about", aboutRoutes);
app.use("/api/admin/about", adminAboutRoutes);

// ── Centralized media library (admin-only; no public read route) ───
app.use("/api/admin/media", adminMediaRoutes);
app.use("/api/admin/media-folders", adminMediaFolderRoutes);

// ── CMS foundation: singleton site-configuration resources ─────────
app.use("/api/site-settings", siteSettingsRoutes);
app.use("/api/admin/site-settings", adminSiteSettingsRoutes);
app.use("/api/navigation", navigationRoutes);
app.use("/api/admin/navigation", adminNavigationRoutes);
app.use("/api/footer", footerRoutes);
app.use("/api/admin/footer", adminFooterRoutes);
app.use("/api/seo", seoRoutes);
app.use("/api/admin/seo", adminSeoRoutes);

/* ------------------------------------------------------------------ *
 * 12. Central error handler
 * ------------------------------------------------------------------ */
app.use(errorMiddleware);

export default app;
