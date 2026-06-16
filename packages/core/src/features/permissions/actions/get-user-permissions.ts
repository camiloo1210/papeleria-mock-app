'use server';

import { createClient, createServiceRoleClient } from "@/lib/supabase/server";
import { SupabaseEmployeeRepository } from "@/features/employee/infrastructure/supabase-employee.repository";

/**
 * Fetches the permissions for the current authenticated user in the specified tenant.
 * Uses a Service Role client internally to ensure permissions are fetched reliably,
 * bypassing potentially strict RLS polices that might block the standard user from reading roles.
 * 
 * @param tenantId The ID of the tenant (business) to fetch permissions for.
 * @returns Array of permission strings.
 */
export async function getUserPermissions(tenantId: number): Promise<string[]> {
    try {
        // 1. Verify Authentication
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return [];
        }

        // 2. Resolve internal User ID (core.users) from Auth UUID
        // We use the standard client for this, as the user should always be able to read their own user record.
        const { data: userData, error: userError } = await supabase
            .schema('core')
            .from('users')
            .select('id')
            .eq('uuid', user.id)
            .single();

        if (userError || !userData) {
            console.warn("getUserPermissions: Could not resolve core.users id for uuid", user.id);
            return [];
        }

        const dbUserId = userData.id;

        const adminClient = createServiceRoleClient();

        const employeeRepo = new SupabaseEmployeeRepository(adminClient);

        // Find the employee record for this user in this tenant
        // Using adminClient bypasses RLS that might hide other employees or strict role tables
        const employee = await employeeRepo.findByUserId(dbUserId, tenantId);

        if (!employee) {
            return [];
        }

        const roleId = employee.getRoleId();
        const permissions = await employeeRepo.getRolePermissions(roleId);

        return permissions;

    } catch (error) {
        console.error("Error in getUserPermissions server action:", error);
        // Fail safe: return empty permissions rather than crashing
        return [];
    }
}
