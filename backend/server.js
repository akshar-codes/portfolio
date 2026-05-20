import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import cors from "cors";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import mongoSanitize from "express-mongo-sanitize";

dotenv.config();

const app = express();

/* -------------------- 1. Helmet -------------------- */

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

/* -------------------- 2. CORS -------------------- */

const allowedOrigin = process.env.ALLOWED_ORIGIN;

if (!allowedOrigin) {
  console.error(
    "FATAL: ALLOWED_ORIGIN is not set in environment variables.\n" +
      "Set it to your frontend URL (e.g. https://yoursite.com) and restart.",
  );
  process.exit(1);
}

app.use(
  cors({
    origin: (incomingOrigin, callback) => {
      if (!incomingOrigin || incomingOrigin === allowedOrigin) {
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

/* -------------------- 3–5. Body + Cookie Parsers -------------------- */
app.use(express.json({ limit: "10kb" })); // hard cap on JSON body size
app.use(express.urlencoded({ extended: true, limit: "10kb" }));
app.use(cookieParser());

/* -------------------- 6. MongoDB Sanitization -------------------- */

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

/* -------------------- Rate Limiter (scoped) -------------------- */
const messageLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { error: "Too many messages sent. Try again later." },
});

/* -------------------- 7. Routes -------------------- */
import adminRoutes from "./routes/adminRoutes.js";
import projectRoutes from "./routes/projectRoutes.js";
import messageRoutes from "./routes/messageRoutes.js";

app.use("/api/admin", adminRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/messages", messageLimiter, messageRoutes);

/* -------------------- Global Error Handler -------------------- */

app.use((err, req, res, next) => {
  const status = err.status || 500;
  const message =
    process.env.NODE_ENV === "production" ? "An error occurred" : err.message;
  res.status(status).json({ message });
});

/* -------------------- DB + Server Start -------------------- */
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB Connected");
    app.listen(process.env.PORT || 5000, () =>
      console.log(`Server running on port ${process.env.PORT || 5000}`),
    );
  })
  .catch((err) => {
    console.error("Database connection failed:", err.message);
    process.exit(1);
  });
