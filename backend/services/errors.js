import AppError from "../utils/AppError.js";

export class ServiceError extends AppError {
  constructor(message, status = 500, errorCode = null) {
    super(message, status);
    this.name = "ServiceError";
    this.errorCode = errorCode;
  }
}
