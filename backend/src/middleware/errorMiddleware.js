import AppError from "../utils/AppError.js";
import logger from "../utils/logger.js";
import { sendError } from "../utils/response.js";

/* ── Converters ────────────────────────────────────────────────────── */

const handleMongoValidation = (err) => {
  const message = Object.values(err.errors)
    .map((e) => e.message)
    .join(". ");
  return new AppError(message, 400);
};

const handleMongoCast = (err) =>
  new AppError(`Invalid value for field "${err.path}".`, 400);

const handleMongoDuplicate = (err) => {
  const field = Object.keys(err.keyValue ?? {})[0] ?? "field";
  return new AppError(
    `"${field}" already exists. Please use a different value.`,
    409,
  );
};

const handleJWTInvalid = () =>
  new AppError("Not authorized — invalid token.", 401);

const handleJWTExpired = () =>
  new AppError("Not authorized — token expired. Please log in again.", 401);

const MULTER_MESSAGES = {
  LIMIT_FILE_SIZE: "File too large. Maximum allowed size is 5 MB.",
  LIMIT_FILE_COUNT: "Only one file may be uploaded at a time.",
  LIMIT_UNEXPECTED_FILE: "Unexpected file field received.",
};

const handleMulter = (err) =>
  new AppError(
    MULTER_MESSAGES[err.code] ?? `Upload error: ${err.message}`,
    400,
  );

const SAFE_MESSAGE_PREFIXES = [
  "Invalid file type",
  "File content does not match",
  "No file buffer",
];

const isSafeUtilityError = (err) =>
  SAFE_MESSAGE_PREFIXES.some((prefix) => err.message?.startsWith(prefix));

/* ── Central handler ───────────────────────────────────────────────── */

const errorMiddleware = (err, req, res, next) => {
  let error = err;

  // Normalise known error types into AppError
  if (err.name === "ValidationError") error = handleMongoValidation(err);
  else if (err.name === "CastError") error = handleMongoCast(err);
  else if (err.code === 11000) error = handleMongoDuplicate(err);
  else if (err.name === "JsonWebTokenError") error = handleJWTInvalid();
  else if (err.name === "TokenExpiredError") error = handleJWTExpired();
  else if (err.name === "MulterError") error = handleMulter(err);
  else if (isSafeUtilityError(err)) error = new AppError(err.message, 400);

  const isOperational = error.isOperational === true;
  const statusCode = error.statusCode || 500;

  // Preserve errorCode set by ServiceError; converters above don't set one.
  const errorCode = error.errorCode ?? null;

  if (isOperational) {
    logger.warn("Operational error", {
      reqId: req.id,
      message: error.message,
      status: statusCode,
      errorCode,
      method: req.method,
      url: req.originalUrl,
    });
  } else {
    logger.error("Unhandled error", {
      reqId: req.id,
      message: err.message,
      stack: err.stack,
      method: req.method,
      url: req.originalUrl,
    });
  }

  const isDev = process.env.NODE_ENV === "development";
  const message =
    isOperational || isDev
      ? error.message
      : "An unexpected error occurred. Please try again later.";

  return sendError(res, message, statusCode, errorCode);
};

export default errorMiddleware;
