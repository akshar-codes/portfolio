import "dotenv/config";
import { randomUUID } from "crypto";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import morgan from "morgan";
import rateLimit from "express-rate-limit";

import validateEnv from "./config/validateEnv.js";
import mongoSanitize from "./middleware/sanitizeMiddleware.js";
import logger, { morganStream } from "./utils/logger.js";
import adminRoutes from "./routes/adminRoutes.js";
import projectRoutes from "./routes/projectRoutes.js";
import messageRoutes from "./routes/messageRoutes.js";
import categoryRoutes from "./routes/categoryRoutes.js";
import adminCategoryRoutes from "./routes/adminCategoryRoutes.js";
import errorMiddleware from "./middleware/errorMiddleware.js";
import healthRoutes from "./routes/healthRoutes.js";
import adminResumeRoutes from "./routes/adminResumeRoutes.js";
import resumeRoutes from "./routes/resumeRoutes.js";
import profileRoutes from "./routes/profileRoutes.js";
import adminProfileRoutes from "./routes/adminProfileRoutes.js";
import aboutRoutes from "./routes/aboutRoutes.js";
import adminAboutRoutes from "./routes/adminAboutRoutes.js";

/* ------------------------------------------------------------------ *
 * 1. Validate all required environment variables before doing anything
 * ------------------------------------------------------------------ */
validateEnv();

const app = express();

const { ALLOWED_ORIGIN, NODE_ENV } = process.env;

/* ------------------------------------------------------------------ *
 * 2. Request correlation IDs
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
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
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
 * ------------------------------------------------------------------ */
app.use(mongoSanitize);

/* ------------------------------------------------------------------ *
 * 8. Rate limiters
 * ------------------------------------------------------------------ */
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
app.use("/api/admin/categories", adminCategoryRoutes); // ← new
app.use("/api/categories", categoryRoutes); // ← new (public)
app.use("/api/projects", projectRoutes);
app.use("/api/messages", messageLimiter, messageRoutes);
app.use("/api/resume", resumeRoutes); // public GET
app.use("/api/admin/resume", adminResumeRoutes); // protected GET + PATCH
app.use("/api/profile", profileRoutes); // public GET
app.use("/api/admin/profile", adminProfileRoutes);
app.use("/api/about", aboutRoutes);
app.use("/api/admin/about", adminAboutRoutes);

/* ------------------------------------------------------------------ *
 * 10. Central error handler
 * ------------------------------------------------------------------ */
app.use(errorMiddleware);

export default app;
