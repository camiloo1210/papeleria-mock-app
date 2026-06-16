import { useAccessControl } from "../context/AccessControlContext";
import { Permission } from "../../domain/permissions";

/**
 * Hook to check if the current user has a specific permission.
 * @param permission - The permission slug to check (e.g., 'sales:create')
 * @returns boolean - True if user has permission, false otherwise.
 */
export const usePermission = (permission: string | Permission): boolean => {
    const { permissions } = useAccessControl();

    // Admin Override: If user has 'admin:all' or similar super-permission, return true.
    // For now, we assume explicit permissions.
    // We could implement wildcard logic here later (e.g. 'sales:*')

    return permissions.includes(permission);
};

/**
 * Hook to check if the current user has AT LEAST ONE of the provided permissions.
 * @param permissionsList - Array of permissions to check
 * @returns boolean - True if user has any of the permissions
 */
export const useAnyPermission = (permissionsList: (string | Permission)[]): boolean => {
    const { permissions } = useAccessControl();
    return permissionsList.some(p => permissions.includes(p));
};
