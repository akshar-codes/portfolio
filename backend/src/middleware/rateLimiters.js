import rateLimit from "express-rate-limit";
import {
  RATE_LIMIT_WINDOW_MS,
  LOGIN_RATE_LIMIT_MAX,
  CONTACT_FORM_RATE_LIMIT_MAX,
  GLOBAL_RATE_LIMIT_MAX,
} from "../utils/constants.js";

/**
 * Shared rate limiter instances. Extracted here so limits and response
 * shapes live in one place instead of being redefined inline inside
 * individual route files.
 */

export const globalLimiter = rateLimit({
  windowMs: RATE_LIMIT_WINDOW_MS,
  max: GLOBAL_RATE_LIMIT_MAX,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    data: null,
    message: "Too many requests. Please try again later.",
  },
});

export const loginLimiter = rateLimit({
  windowMs: RATE_LIMIT_WINDOW_MS,
  max: LOGIN_RATE_LIMIT_MAX,
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true,
  message: {
    message: "Too many login attempts. Please try again in 15 minutes.",
  },
});

export const contactFormLimiter = rateLimit({
  windowMs: RATE_LIMIT_WINDOW_MS,
  max: CONTACT_FORM_RATE_LIMIT_MAX,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    data: null,
    message: "Too many messages sent. Try again later.",
  },
});
