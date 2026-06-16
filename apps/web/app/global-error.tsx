'use client';

import * as Sentry from "@sentry/nextjs";
import NextError from "next/error";
import { useEffect } from "react";

export default function GlobalError({
    error,
}: {
    error: Error & { digest?: string };
}) {
    useEffect(() => {
        Sentry.captureException(error);

        // Handle ChunkLoadError
        // This is critical for catching version mismatches after deployments
        const isChunkError = error.message?.toLowerCase().includes('loading chunk') ||
            error.name === 'ChunkLoadError';

        if (isChunkError) {
            const RELOAD_KEY = 'app-reload-timestamp';
            const lastReload = sessionStorage.getItem(RELOAD_KEY);
            const now = Date.now();

            // Only reload if we haven't reloaded in the last 10 seconds to avoid loops
            if (!lastReload || now - parseInt(lastReload) > 10000) {
                sessionStorage.setItem(RELOAD_KEY, now.toString());
                window.location.reload();
            }
        }
    }, [error]);

    return (
        <html>
            <body>
                {/* This is the fallback for when the root layout fails */}
                <NextError statusCode={500} title="Critical System Failure" />
            </body>
        </html>
    );
}
