'use server';

import { createClient, createServiceRoleClient } from "@/lib/supabase/server";
import { SupabaseBiRepository } from "../infrastructure/supabase-bi.repository";
import { GetBiDashboardDataUseCase } from "../application/get-bi-dashboard-data.use-case";
import { BiFilters, BiDashboardData } from "../domain/bi.types";
// TODO [EXTRACCION]: import a modulo no incluido en este repo -> employee (kernel NO extraido). Resolver: copiar/stubear o eliminar.
import { SupabaseEmployeeRepository } from "@/features/employee/infrastructure/supabase-employee.repository";
// TODO [EXTRACCION]: import a modulo no incluido en este repo -> rol (kernel NO extraido). Resolver: copiar/stubear o eliminar.
import { SupabaseRolRepository } from "@/features/rol/infrastructure/supabase-rol.repository";

export interface BiDashboardResponse {
    data: BiDashboardData | null;
    branches: { id: number; name: string }[];
    products: { id: number; name: string }[];
    error?: string;
    // Context info for UI logic
    isBranchLocked?: boolean;
    defaultBranchId?: number;
    userFirstName?: string;
}

export async function getBiDashboardDataAction(filters?: BiFilters): Promise<BiDashboardResponse> {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return { data: null, branches: [], products: [], error: 'No autorizado' };
        }

        const rawServiceRoleClient = createServiceRoleClient();

        // 1. Get User & Tenant
        const { data: userData } = await rawServiceRoleClient
            .schema('core')
            .from('users')
            .select('id, tenant_id, person_id')
            .eq('uuid', user.id)
            .single();

        if (!userData) {
            return { data: null, branches: [], products: [], error: 'Usuario no encontrado' };
        }

        const tenantId = userData.tenant_id;
        const userId = userData.id;

        // 2. Get Person Name
        const { data: personData } = await rawServiceRoleClient
            .schema('shared')
            .from('person')
            .select('first_name')
            .eq('id', userData.person_id)
            .maybeSingle();

        const userFirstName = personData?.first_name || 'Usuario';

        // 3. Check Permissions / Role (Branch Locking)
        const employeeRepo = new SupabaseEmployeeRepository(rawServiceRoleClient);
        const rolRepo = new SupabaseRolRepository(rawServiceRoleClient);
        const employee = await employeeRepo.findByUserId(userId, tenantId);

        let isBranchLocked = false;
        let defaultBranchId: number | undefined = undefined;

        if (employee) {
            const role = await rolRepo.findById(employee.getRoleId());
            if (role?.toPrimitives().name === 'MANAGER') {
                isBranchLocked = true;
                const primitives = employee.toPrimitives();
                if (primitives.branch_id) {
                    defaultBranchId = primitives.branch_id;
                }
            }
        }

        // 4. Prepare Filters overrides if locked
        const effectiveFilters: BiFilters = {
            ...filters,
            period: filters?.period || 'week',
            branchId: isBranchLocked && defaultBranchId ? defaultBranchId : filters?.branchId
        };

        // 5. Execute Use Case
        const biRepository = new SupabaseBiRepository(rawServiceRoleClient);
        const getBiData = new GetBiDashboardDataUseCase(biRepository);
        const dashboardData = await getBiData.execute(tenantId, effectiveFilters);

        // 6. Fetch Metadata (Branches & Products) for controls
        // Fetch only if needed (e.g. first load), but for simplicity fetch always or let UI cache?
        // Let's fetch always for now to ensure sync.

        const { data: branches } = await rawServiceRoleClient
            .schema('core')
            .from('branch')
            .select('id, name')
            .eq('tenant_id', tenantId);

        const { data: products } = await rawServiceRoleClient
            .schema('core')
            .from('products')
            .select('id, name')
            .eq('tenant_id', tenantId)
            .eq('is_active', true);

        return {
            data: dashboardData,
            branches: branches || [],
            products: products || [],
            isBranchLocked,
            defaultBranchId,
            userFirstName
        };

    } catch (error) {
        console.error("Error in getBiDashboardDataAction:", error);
        return { data: null, branches: [], products: [], error: 'Error interno del servidor' };
    }
}
