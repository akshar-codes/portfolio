import "dotenv/config";
import { randomUUID } from "crypto";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import morgan from "morgan";

import validateEnv from "./config/validateEnv.js";
import mongoSanitize from "./middleware/sanitizeMiddleware.js";
import { globalLimiter } from "./middleware/rateLimiters.js";
import logger, { morganStream } from "./utils/logger.js";
import errorMiddleware from "./middleware/errorMiddleware.js";
import { JSON_BODY_LIMIT } from "./utils/constants.js";

// ── Admin (protected) routes ────────────────────────────────────────
import adminAuthRoutes from "./routes/admin/authRoutes.js";
import adminCategoryRoutes from "./routes/admin/categoryRoutes.js";
import adminProjectRoutes from "./routes/admin/projectRoutes.js";
import adminMessageRoutes from "./routes/admin/messageRoutes.js";
import adminResumeRoutes from "./routes/admin/resumeRoutes.js";
import adminProfileRoutes from "./routes/admin/profileRoutes.js";
import adminAboutRoutes from "./routes/admin/aboutRoutes.js";

// ── General (public) routes ──────────────────────────────────────────
import healthRoutes from "./routes/general/healthRoutes.js";
import categoryRoutes from "./routes/general/categoryRoutes.js";
import projectRoutes from "./routes/general/projectRoutes.js";
import messageRoutes from "./routes/general/messageRoutes.js";
import resumeRoutes from "./routes/general/resumeRoutes.js";
import profileRoutes from "./routes/general/profileRoutes.js";
import aboutRoutes from "./routes/general/aboutRoutes.js";

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
app.use((req, _res, next) => {
  req.id = randomUUID();
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
const morganFormat = NODE_ENV === "production" ? "combined" : "dev";
app.use(morgan(morganFormat, { stream: morganStream }));

/* ------------------------------------------------------------------ *
 * 6. CORS
 * ------------------------------------------------------------------ */
app.use(
  cors({
    origin: (incomingOrigin, callback) => {
      if (!incomingOrigin || incomingOrigin === ALLOWED_ORIGIN) {
        callback(null, true);
      } else {
        callback(new Error(`CORS: origin '${incomingOrigin}' is not allowed`));
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

/* ------------------------------------------------------------------ *
 * 8. MongoDB injection sanitizer
 * ------------------------------------------------------------------ */
app.use(mongoSanitize);

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
app.use("/api/admin/categories", adminCategoryRoutes);
app.use("/api/categories", categoryRoutes);

app.use("/api/projects", projectRoutes);
app.use("/api/projects", adminProjectRoutes);

app.use("/api/messages", messageRoutes);
app.use("/api/messages", adminMessageRoutes);

app.use("/api/resume", resumeRoutes);
app.use("/api/admin/resume", adminResumeRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/admin/profile", adminProfileRoutes);
app.use("/api/about", aboutRoutes);
app.use("/api/admin/about", adminAboutRoutes);

/* ------------------------------------------------------------------ *
 * 12. Central error handler
 * ------------------------------------------------------------------ */
app.use(errorMiddleware);

export default app;
