'use client';

import { useEffect } from 'react';
import * as Sentry from '@sentry/nextjs';
import { ErrorCard } from '@/components/ui/error-card';

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        // Log the error to Sentry
        console.error("Application Error:", error);
        Sentry.captureException(error);

        // Handle ChunkLoadError
        const isChunkError = error.message?.toLowerCase().includes('loading chunk') ||
            error.name === 'ChunkLoadError';

        if (isChunkError) {
            const RELOAD_KEY = 'app-reload-timestamp';
            const lastReload = sessionStorage.getItem(RELOAD_KEY);
            const now = Date.now();

            // Only reload if we haven't reloaded in the last 10 seconds
            if (!lastReload || now - parseInt(lastReload) > 10000) {
                sessionStorage.setItem(RELOAD_KEY, now.toString());
                window.location.reload();
            }
        }
    }, [error]);

    return (
        <div className="flex h-screen w-full items-center justify-center bg-background p-4">
            <ErrorCard
                title="Unable to load this page"
                description={error.message || "An unexpected error occurred."}
                retry={reset}
                home={true}
            />
        </div>
    );
}
