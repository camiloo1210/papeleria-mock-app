
export async function withRetry<T>(
    fn: () => Promise<T>,
    maxRetries = 3,
    baseDelay = 1000,
    onRetry?: (attempt: number, delay: number) => void
): Promise<T> {
    for (let attempt = 0; attempt < maxRetries; attempt++) {
        try {
            return await fn();
        } catch (error) {
            const isLastAttempt = attempt === maxRetries - 1;
            if (isLastAttempt) throw error;

            const delay = baseDelay * Math.pow(2, attempt); // 1s, 2s, 4s...

            if (onRetry) {
                onRetry(attempt + 1, delay);
            }

            await new Promise(r => setTimeout(r, delay));
        }
    }
    throw new Error('Max retries exceeded');
}
