'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

interface AccessControlContextType {
    permissions: string[];
    setPermissions: (permissions: string[]) => void;
    isLoading: boolean;
}

const AccessControlContext = createContext<AccessControlContextType>({
    permissions: [],
    setPermissions: () => { },
    isLoading: true,
});

export const useAccessControl = () => useContext(AccessControlContext);

interface AccessControlProviderProps {
    children: React.ReactNode;
    initialPermissions?: string[];
}

export const AccessControlProvider = ({
    children,
    initialPermissions = []
}: AccessControlProviderProps) => {
    const [permissions, setPermissionsState] = useState<string[]>(initialPermissions);
    const [isLoading, setIsLoading] = useState(initialPermissions.length === 0);

    useEffect(() => {
        if (initialPermissions.length > 0) {
            setPermissionsState(initialPermissions);
            setIsLoading(false);
        }
    }, [initialPermissions]);

    const setPermissions = (newPermissions: string[]) => {
        setPermissionsState(newPermissions);
        setIsLoading(false);
    };

    return (
        <AccessControlContext.Provider value={{ permissions, setPermissions, isLoading }}>
            {children}
        </AccessControlContext.Provider>
    );
};
