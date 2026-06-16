import { User } from "@supabase/supabase-js";
import { createServiceRoleClient } from "@/lib/supabase/server";

export async function resolveTenantId(user: User): Promise<number | null> {
    // 1. Try to get from App Metadata (Custom Claims - Protected)
    if (user.app_metadata?.tenant_id) {
        return Number(user.app_metadata.tenant_id);
    }

    // 2. Try to get from User Metadata (Public/Self-registration)
    if (user.user_metadata?.tenant_id) {
        return Number(user.user_metadata.tenant_id);
    }

    // 3. Fallback: Lookup in DB using Email -> Core User -> Employee
    console.warn("resolveTenantId: tenant_id not in app_metadata, falling back to DB lookup");

    try {
        const adminSupabase = createServiceRoleClient();

        // Find Core User by Email
        const { data: coreUsers } = await adminSupabase
            .schema('core')
            .from('users')
            .select('id')
            .eq('email', user.email);

        if (!coreUsers || coreUsers.length === 0) return null;

        // Find Employee by Core User ID
        const coreUserId = coreUsers[0].id;
        const { data: employee } = await adminSupabase
            .schema('core')
            .from('employees')
            .select('tenant_id')
            .eq('user_id', coreUserId)
            .single();

        return employee?.tenant_id || null;
    } catch (error) {
        console.error("resolveTenantId: Error resolving tenant", error);
        return null;
    }
}
