export class DomainError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "DomainError";
  }
}

export class UnauthorizedError extends DomainError {
  constructor(message = "Unauthorized") {
    super(message);
    this.name = "UnauthorizedError";
  }
}

export class BadRequestError extends DomainError {
  constructor(message = "Bad Request") {
    super(message);
    this.name = "BadRequestError";
  }
}

export class NotFoundError extends DomainError {
  constructor(message = "Not Found") {
    super(message);
    this.name = "NotFoundError";
  }
}

export class ValidationError extends DomainError {
  constructor(public errors: Record<string, string[]>) {
    super("Validation Error");
    this.name = "ValidationError";
  }
}
