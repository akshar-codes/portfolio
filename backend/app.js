import "dotenv/config";
import { randomUUID } from "crypto";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import morgan from "morgan";
import rateLimit from "express-rate-limit";

import validateEnv from "./utils/validateEnv.js";
import mongoSanitize from "./middleware/sanitizeMiddleware.js";
import logger, { morganStream } from "./utils/logger.js";
import adminRoutes from "./routes/adminRoutes.js";
import projectRoutes from "./routes/projectRoutes.js";
import messageRoutes from "./routes/messageRoutes.js";
import errorMiddleware from "./middleware/errorMiddleware.js";
import healthRoutes from "./routes/healthRoutes.js";

/* ------------------------------------------------------------------ *
 * 1. Validate all required environment variables before doing anything
 *    else. Calls process.exit(1) with a clear list if any are missing.
 * ------------------------------------------------------------------ */
validateEnv();

const app = express();

const { ALLOWED_ORIGIN, NODE_ENV } = process.env;

/* ------------------------------------------------------------------ *
 * 2. Request correlation IDs
 *    Every request gets a unique ID attached to req.id so that
 *    multi-step log lines (upload → Cloudinary → DB → response) can be
 *    traced back to a single request without timestamp matching.
 * ------------------------------------------------------------------ */
app.use((req, _res, next) => {
  req.id = randomUUID();
  next();
});

/* ------------------------------------------------------------------ *
 * 3. Security headers
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
 * 4. HTTP request logging (morgan → winston)
 * ------------------------------------------------------------------ */
const morganFormat = NODE_ENV === "production" ? "combined" : "dev";
app.use(morgan(morganFormat, { stream: morganStream }));

/* ------------------------------------------------------------------ *
 * 5. CORS
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
    methods: ["GET", "POST", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

/* ------------------------------------------------------------------ *
 * 6. Body parsers + cookie parser
 * ------------------------------------------------------------------ */
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true, limit: "10kb" }));
app.use(cookieParser());

/* ------------------------------------------------------------------ *
 * 7. MongoDB injection sanitizer
 *    Now covers req.body, req.params, AND req.query.
 *    Note: express-mongo-sanitize is listed as a dependency but was
 *    never wired up; the fixed custom middleware is the active defence.
 * ------------------------------------------------------------------ */
app.use(mongoSanitize);

/* ------------------------------------------------------------------ *
 * 8. Rate limiters
 * ------------------------------------------------------------------ */

// Global backstop — catches any endpoint not individually rate-limited
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    data: null,
    message: "Too many requests. Please try again later.",
  },
});

const messageLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    data: null,
    message: "Too many messages sent. Try again later.",
  },
});

app.use(globalLimiter);

/* ------------------------------------------------------------------ *
 * 9. Routes
 * ------------------------------------------------------------------ */
app.use("/health", healthRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/messages", messageLimiter, messageRoutes);

/* ------------------------------------------------------------------ *
 * 10. Central error handler
 * ------------------------------------------------------------------ */
app.use(errorMiddleware);

export default app;
