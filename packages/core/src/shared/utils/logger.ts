import { AppError } from "../errors/app-error";

interface LogMeta {
    [key: string]: unknown;
}

/**
 * A simple structured logger to replace plain console.log/.error
 * Outputs JSON format in production.
 */
export class Logger {
    private static formatMessage(level: string, message: string, meta?: LogMeta, error?: unknown) {
        const isProduction = process.env.NODE_ENV === 'production';

        const payload: Record<string, unknown> = {
            timestamp: new Date().toISOString(),
            level,
            message,
            ...meta
        };

        if (error instanceof Error) {
            payload.error = {
                name: error.name,
                message: error.message,
                stack: error.stack,
            };
            if (error instanceof AppError) {
                (payload.error as Record<string, unknown>).code = error.code;
                (payload.error as Record<string, unknown>).details = error.details;
            }
        } else if (error) {
            payload.error = error;
        }

        if (isProduction) {
            return JSON.stringify(payload);
        } else {
            // In development, keep it readable
            let logStr = `[${level}] ${message}`;
            if (meta && Object.keys(meta).length > 0) logStr += `\nMeta: ${JSON.stringify(meta, null, 2)}`;
            if (error) logStr += `\nError: ${error instanceof Error ? error.stack : JSON.stringify(error)}`;
            return logStr;
        }
    }

    static info(message: string, meta?: LogMeta) {
        console.info(this.formatMessage('INFO', message, meta));
    }

    static warn(message: string, meta?: LogMeta, error?: unknown) {
        console.warn(this.formatMessage('WARN', message, meta, error));
    }

    static error(message: string, error?: unknown, meta?: LogMeta) {
        console.error(this.formatMessage('ERROR', message, meta, error));
    }

    static debug(message: string, meta?: LogMeta) {
        if (process.env.NODE_ENV !== 'production') {
            console.debug(this.formatMessage('DEBUG', message, meta));
        }
    }
}
