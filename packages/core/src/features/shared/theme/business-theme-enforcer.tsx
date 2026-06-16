'use client';

import { useEffect } from 'react';
import { useBrandTheme, ThemeSettings } from './theme-provider';

interface BusinessThemeEnforcerProps {
    brandColor?: string;
    themeSettings?: ThemeSettings;
}

/**
 * Ensures that the business brand color is applied when entering the protected area.
 * This is necessary because navigating back from Marketplace (which resets theme)
 * might not trigger a RootLayout re-render to re-apply the initialBrandColor prop.
 */
export function BusinessThemeEnforcer({ brandColor, themeSettings }: BusinessThemeEnforcerProps) {
    const { setBrandColor, setThemeSettings } = useBrandTheme();

    useEffect(() => {
        if (brandColor) {
            setBrandColor(brandColor);
        }
        if (themeSettings) {
            setThemeSettings(themeSettings);
        }
    }, [brandColor, themeSettings, setBrandColor, setThemeSettings]);

    return null;
}
