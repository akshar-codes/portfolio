import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import mongoSanitize from "express-mongo-sanitize";
import rateLimit from "express-rate-limit";

import adminRoutes from "./routes/adminRoutes.js";
import projectRoutes from "./routes/projectRoutes.js";
import messageRoutes from "./routes/messageRoutes.js";
import errorMiddleware from "./middleware/errorMiddleware.js";

const app = express();

/* ------------------------------------------------------------------ *
 * 1. Environment guard
 * ------------------------------------------------------------------ */

const { ALLOWED_ORIGIN, NODE_ENV } = process.env;

if (!ALLOWED_ORIGIN) {
  console.error(
    "FATAL: ALLOWED_ORIGIN is not set in environment variables.\n" +
      "Set it to your frontend URL (e.g. https://yoursite.com) and restart.",
  );
  process.exit(1);
}

/* ------------------------------------------------------------------ *
 * 2. Security headers
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
 * 3. CORS
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
 * 4. Body parsers + cookie parser
 * ------------------------------------------------------------------ */

app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true, limit: "10kb" }));
app.use(cookieParser());

/* ------------------------------------------------------------------ *
 * 5. MongoDB injection sanitizer
 * ------------------------------------------------------------------ */

app.use(
  mongoSanitize({
    replaceWith: "_",
    onSanitize: ({ req, key }) => {
      console.warn(
        `[mongoSanitize] Sanitized key "${key}" on ${req.method} ${req.path}`,
      );
    },
  }),
);

/* ------------------------------------------------------------------ *
 * 6. Rate limiters
 * ------------------------------------------------------------------ */

// Scoped to the public message submission endpoint only
const messageLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: {
    success: false,
    data: null,
    message: "Too many messages sent. Try again later.",
  },
});

/* ------------------------------------------------------------------ *
 * 7. Routes
 * ------------------------------------------------------------------ */

app.use("/api/admin", adminRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/messages", messageLimiter, messageRoutes);

app.use(errorMiddleware);

export default app;
