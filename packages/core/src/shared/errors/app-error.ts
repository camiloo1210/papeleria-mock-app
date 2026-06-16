export class AppError extends Error {
    public readonly code: string;
    public readonly statusCode: number;
    public readonly details?: unknown;

    constructor(message: string, code: string = 'INTERNAL_ERROR', statusCode: number = 500, details?: unknown) {
        super(message);
        this.name = 'AppError';
        this.code = code;
        this.statusCode = statusCode;
        this.details = details;

        // Maintains proper stack trace for where our error was thrown (only available on V8)
        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, AppError);
        }
    }

    static badRequest(message: string, details?: unknown) {
        return new AppError(message, 'BAD_REQUEST', 400, details);
    }

    static unauthorized(message: string, details?: unknown) {
        return new AppError(message, 'UNAUTHORIZED', 401, details);
    }

    static forbidden(message: string, details?: unknown) {
        return new AppError(message, 'FORBIDDEN', 403, details);
    }

    static notFound(message: string, details?: unknown) {
        return new AppError(message, 'NOT_FOUND', 404, details);
    }

    static internal(message: string, details?: unknown) {
        return new AppError(message, 'INTERNAL_SERVER_ERROR', 500, details);
    }
}
