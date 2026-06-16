'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useTheme as useNextTheme } from 'next-themes';
import { generateFullTheme, FullTheme } from './theme-generator';

export interface ThemeSettings {
    light?: { background?: string };
    dark?: { background?: string };
}

interface ThemeContextType {
    setBrandColor: (color: string | undefined) => void;
    setThemeSettings: (settings: ThemeSettings) => void;
}

const BrandThemeContext = createContext<ThemeContextType>({
    setBrandColor: () => { },
    setThemeSettings: () => { },
});

export const useBrandTheme = () => useContext(BrandThemeContext);

interface BrandThemeProviderProps {
    children: React.ReactNode;
    initialBrandColor?: string;
    userThemeSettings?: ThemeSettings;
}

const applyTheme = (theme: FullTheme) => {
    if (typeof document === 'undefined') return;
    const root = document.documentElement;
    // We only update CSS variables, not classList (next-themes handles that)
    for (const [key, value] of Object.entries(theme)) {
        root.style.setProperty(`--${key}`, value);
    }
};

export const BrandThemeProvider = ({ children, initialBrandColor, userThemeSettings }: BrandThemeProviderProps) => {
    const [brandColor, setBrandColor] = useState<string | undefined>(initialBrandColor);
    const [themeSettings, setThemeSettings] = useState(userThemeSettings);
    const { resolvedTheme } = useNextTheme(); // 'dark' or 'light'

    // Sync brandColor prop changes
    useEffect(() => {
        if (initialBrandColor !== brandColor) {
            setBrandColor(initialBrandColor);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [initialBrandColor]);

    // Sync userThemeSettings prop changes
    useEffect(() => {
        setThemeSettings(userThemeSettings);
    }, [userThemeSettings]);

    useEffect(() => {
        // Determine base colors based on mode + brand
        const isDark = resolvedTheme === 'dark';

        // 1. Determine Background: User Override > Default
        // We look for 'background' in userThemeSettings for the current mode.
        const userBg = isDark
            ? themeSettings?.dark?.background
            : themeSettings?.light?.background;

        const baseTheme = {
            primary: brandColor || (isDark ? '#fafafa' : '#18181b'),
            background: userBg || (isDark ? '#020817' : '#ffffff'),
            // Foreground is auto-calculated by theme-generator if strictly undefined/derived
            // But we can pass it if we wanted specific overrides. 
            // For now, we rely on generator's "Background First" logic.
        };

        const fullTheme = generateFullTheme(baseTheme);
        applyTheme(fullTheme);
    }, [brandColor, resolvedTheme, themeSettings]);

    const contextValue = React.useMemo(() => ({
        setBrandColor,
        setThemeSettings
    }), []);

    return (
        <BrandThemeContext.Provider value={contextValue}>
            {children}
        </BrandThemeContext.Provider>
    );
};
