'use client';

import React from 'react';
import { usePermission } from '../hooks/usePermission';
import { Permission } from '../../domain/permissions';

interface PermissionGateProps {
    children: React.ReactNode;
    permission: string | Permission;
    fallback?: React.ReactNode;
}

export const PermissionGate = ({
    children,
    permission,
    fallback = null
}: PermissionGateProps) => {
    const hasPermission = usePermission(permission);

    if (!hasPermission) {
        return fallback;
    }

    return <>{children}</>;
};
