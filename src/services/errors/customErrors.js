export class AppError extends Error {
  constructor(message, { code = 'APP_ERROR', status = 500, details = null } = {}) {
    super(message);
    this.name = 'AppError';
    this.code = code;
    this.status = status;
    this.details = details;
  }
}

export class NotFoundError extends AppError {
  constructor(message = 'Resource not found', opts = {}) {
    super(message, { code: 'NOT_FOUND', status: 404, ...opts });
  }
}

export class ValidationError extends AppError {
  constructor(message = 'Validation failed', opts = {}) {
    super(message, { code: 'VALIDATION_ERROR', status: 400, ...opts });
  }
}
