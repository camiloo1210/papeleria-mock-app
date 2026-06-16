
/**
 * Plays a success "beep" sound for positive feedback interactions
 * (e.g., successful scan, item added, transaction completed).
 */
export function playSuccessSound() {
    // Check if Audio is supported (browser env)
    if (typeof window === 'undefined') return;

    try {
        // Use Web Audio API for a synthesis beep (no file needed)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
        if (!AudioContext) return;

        const ctx = new AudioContext();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.connect(gain);
        gain.connect(ctx.destination);

        // Pleasant high-pitch "ding"
        osc.type = 'sine';
        osc.frequency.setValueAtTime(1200, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(600, ctx.currentTime + 0.15);

        gain.gain.setValueAtTime(0.15, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);

        osc.start();
        osc.stop(ctx.currentTime + 0.15);

    } catch (e) {
        console.error("Audio playback error", e);
    }
}

/**
 * Triggers a haptic vibration feedback on supported devices.
 * Useful for mobile web app experience.
 * @param pattern Vibration pattern in ms (e.g. 200 or [100, 50, 100])
 */
export function vibrate(pattern: number | number[] = 50) {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
        try {
            navigator.vibrate(pattern);
        } catch (e) {
            console.warn("Vibration failed", e);
        }
    }
}
