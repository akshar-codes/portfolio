class AppError extends Error {
  constructor(message, statusCode = 500) {
    super(message);
    this.name = "AppError";
    this.statusCode = statusCode;
    this.isOperational = true; // flag read by the error middleware

    Error.captureStackTrace(this, this.constructor);
  }
}

export default AppError;
