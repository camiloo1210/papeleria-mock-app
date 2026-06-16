import { Sidebar } from "@/features/dashboard/components/sidebar";
import { createClient, createServiceRoleClient } from "@/lib/supabase/server";
// TODO [EXTRACCION]: import a modulo no incluido en este repo -> employee (kernel NO extraido). Resolver: copiar/stubear o eliminar.
import { SupabaseEmployeeRepository } from "@/features/employee/infrastructure/supabase-employee.repository";

export async function SidebarContainer() {
    // 1. Check Auth (Standard Client - Secure)
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return <Sidebar />;
    }

    // 2. Fetch Permissions (Service Role - Robust against stale JWT)
    const adminClient = createServiceRoleClient();

    // 3. Get User's Tenant Context
    // We fetch this from DB to be sure, instead of relying on JWT metadata which might be stale
    const { data: userData, error: userError } = await adminClient
        .schema('core')
        .from('users')
        .select('id, tenant_id')
        .eq('uuid', user.id)
        .single();

    if (userError || !userData) {
        console.error("Sidebar: Failed to fetch user context", userError);
        return <Sidebar />;
    }

    const employeeRepo = new SupabaseEmployeeRepository(adminClient);

    let currentEmployee = null;
    try {
        currentEmployee = await employeeRepo.findByUserId(userData.id, userData.tenant_id);
    } catch (err) {
        console.error("Sidebar: Error fetching employee", err);
    }

    let roleName = "";
    if (currentEmployee) {
        // Fetch Role Name
        const { data: roleData } = await adminClient
            .schema('core')
            .from('roles')
            .select('name')
            .eq('id', currentEmployee.getRoleId())
            .single();
        if (roleData) roleName = roleData.name;
    }

    return (
        <Sidebar
            roleId={currentEmployee?.getRoleId()}
            position={currentEmployee?.getPosition()}
            roleName={roleName}
        />
    );
}
