'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import * as Sentry from "@sentry/nextjs";

interface BusinessContextType {
    businessName: string;
    logoUrl?: string;
    setBusinessInfo: (name: string, logo?: string) => void;
}

const BusinessContext = createContext<BusinessContextType>({
    businessName: 'Papelería El Estudiante',
    logoUrl: '/Logo.svg',
    setBusinessInfo: () => { },
});

export const useBusiness = () => useContext(BusinessContext);

interface BusinessProviderProps {
    children: React.ReactNode;
    initialBusinessName?: string;
    initialLogoUrl?: string;
    tenantId?: number;
}

export const BusinessProvider = ({
    children,
    initialBusinessName = 'Papelería El Estudiante',
    initialLogoUrl = '/Logo.svg',
    tenantId
}: BusinessProviderProps) => {
    const [businessName, setBusinessName] = useState(initialBusinessName);
    const [logoUrl, setLogoUrl] = useState(initialLogoUrl);

    useEffect(() => {
        if (initialBusinessName) setBusinessName(initialBusinessName);
        if (initialLogoUrl) setLogoUrl(initialLogoUrl);
        if (tenantId) {
            Sentry.setTag("tenant_id", tenantId);
        }
    }, [initialBusinessName, initialLogoUrl, tenantId]);

    const setBusinessInfo = (name: string, logo?: string) => {
        setBusinessName(name);
        if (logo) setLogoUrl(logo);
    };

    return (
        <BusinessContext.Provider value={{ businessName, logoUrl, setBusinessInfo }}>
            {children}
        </BusinessContext.Provider>
    );
};
