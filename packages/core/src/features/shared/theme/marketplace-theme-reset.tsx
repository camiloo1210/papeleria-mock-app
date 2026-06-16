'use client';

import { useEffect } from 'react';
import { useBrandTheme } from './theme-provider';

/**
 * Drop this component into any layout that should NOT use the business brand theme.
 * It resets the brand color to undefined on mount, forcing the theme provider
 * to use the default shadcn/ui colors.
 */
export function MarketplaceThemeReset() {
    const { setBrandColor, setThemeSettings } = useBrandTheme();

    useEffect(() => {
        // Reset brand color to force default theme
        setBrandColor(undefined);
        setThemeSettings({});
    }, [setBrandColor, setThemeSettings]);

    return null;
}
