export class AppError extends Error {
  public statusCode: number;
  public isOperational: boolean;

  constructor(message: string, statusCode: number, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;

    // Only capture stack trace for operational errors
    if (isOperational) {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}
