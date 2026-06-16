import { oklch, formatCss } from 'culori';

export interface Theme {
    primary: string; // The user's brand color
    // We can derive everything else from primary, or accept overrides
    background?: string;
    foreground?: string;
}

export interface FullTheme {
    [key: string]: string;
}

/**
 * Generates a complete color palette from a base theme using OKLCH.
 * This ensures perceptual uniformity and correct contrast ratios.
 */
export const generateFullTheme = (baseTheme: Theme): FullTheme => {
    try {
        // 1. Parsing
        const primaryStr = baseTheme.primary || '#000000';
        const primary = oklch(primaryStr) || oklch('#000000')!;
        const backgroundStr = baseTheme.background || '#ffffff';
        const background = oklch(backgroundStr) || oklch('#ffffff')!;

        // 2. Determine Mode (Dark/Light) based on Background Lightness
        // Standard threshold is 0.5, but in OKLCH, perceived lightness behaves well.
        const bgL = background.l ?? 1;
        const isDark = bgL < 0.45; // Slightly lower threshold for "Deep Dark" preference

        // 3. Foreground (Text)
        // If not provided, maximize contrast.
        let foreground = baseTheme.foreground ? oklch(baseTheme.foreground) : undefined;
        if (!foreground) {
            foreground = isDark ? oklch('#f8fafc') : oklch('#0f172a'); // Slate 50 / Slate 900
        }

        // Helper: Format
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const fmt = (c: any) => {
            try {
                return formatCss(c) || '';
            } catch { return ''; }
        };

        // 4. Adjust Primary for Contrast
        // Ideally Primary should be visible against Background.
        // Simple heuristic: If Dark Mode, Primary L should be at least 0.6. If Light Mode, max 0.6.
        if (primary.l !== undefined) {
            if (isDark && primary.l < 0.5) {
                // console.log("Boosting primary lightness for dark mode contrast");
                primary.l = 0.65;
            } else if (!isDark && primary.l > 0.65) {
                // console.log("Dimming primary lightness for light mode contrast");
                primary.l = 0.55;
            }
        }

        // 5. Generate Palette Steps (Relative to Background)
        // We create 'surface' steps: subtle, default, strong.
        // In Dark Mode: step up (lighter). In Light Mode: step down (darker).
        const step = isDark ? 0.05 : -0.05;

        const secondary = { ...background, l: (background.l ?? 0) + (step * 2) }; // Slightly distinct
        const muted = { ...background, l: (background.l ?? 0) + step }; // Very subtle
        const accent = { ...primary, l: isDark ? 0.35 : 0.9 }; // Branded surface

        // Borders: Needs to be visible. Between background and foreground.
        const border = {
            ...background,
            l: isDark ? (background.l ?? 0) + 0.15 : (background.l ?? 0) - 0.15,
            c: 0
        };

        return {
            // Base
            'background': fmt(background),
            'foreground': fmt(foreground),

            // Primary
            'primary': fmt(primary),
            'primary-foreground': (primary.l ?? 0) > 0.65 ? 'oklch(0% 0 0)' : 'oklch(100% 0 0)',

            // Secondary
            'secondary': fmt(secondary),
            'secondary-foreground': fmt(foreground), // Usually safe

            // Muted
            'muted': fmt(muted),
            'muted-foreground': fmt({ ...foreground, l: (foreground!.l ?? 0) * 0.7 }), // Dimmed text

            // Accent
            'accent': fmt(accent),
            'accent-foreground': fmt(primary),

            // Destructive (Brand Hue, High Chroma, Distinct Lightness)
            'destructive': fmt({
                ...primary,
                h: primary.h,
                c: 0.2, // High chroma
                l: isDark ? 0.6 : 0.4
            }),
            'destructive-foreground': 'oklch(100% 0 0)',

            // UI Elements
            'card': fmt(background),
            'card-foreground': fmt(foreground),
            'popover': fmt(background),
            'popover-foreground': fmt(foreground),

            'border': fmt(border),
            'input': fmt(border),
            'ring': fmt(primary),

            'radius': '0.5rem',
        };
    } catch (e) {
        console.error("Critical: Theme generation failed", e);
        // Fallback: Return a safe, basic theme (Black/White) to prevent app crash
        return {
            'background': '#ffffff',
            'foreground': '#000000',
            'primary': '#000000',
            'primary-foreground': '#ffffff',
            'secondary': '#f3f4f6',
            'secondary-foreground': '#000000',
            'muted': '#f3f4f6',
            'muted-foreground': '#6b7280',
            'accent': '#f3f4f6',
            'accent-foreground': '#000000',
            'destructive': '#ef4444',
            'destructive-foreground': '#ffffff',
            'card': '#ffffff',
            'card-foreground': '#000000',
            'popover': '#ffffff',
            'popover-foreground': '#000000',
            'border': '#e5e7eb',
            'input': '#e5e7eb',
            'ring': '#000000',
            'radius': '0.5rem',
        };
    }
};
