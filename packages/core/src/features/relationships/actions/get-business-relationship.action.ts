'use server';

import { createClient } from "@/lib/supabase/server";
import { SupabaseBusinessRelationshipRepository } from "../infrastructure/supabase-business-relationship.repository";

export async function getBusinessRelationshipStatusAction(targetBusinessId: number) {
    const supabase = await createClient();

    // 1. Get current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return { success: true, status: null }; // Not logged in
    }

    // 2. Get current user's business (requester)
    const { data: employee } = await supabase
        .schema('core')
        .from('employees')
        .select('tenant_id')
        .eq('user_id', user.id)
        .single();

    if (!employee?.tenant_id) {
        return { success: true, status: null }; // No business
    }

    const requesterBusinessId = employee.tenant_id;
    const repository = new SupabaseBusinessRelationshipRepository();

    try {
        const relationship = await repository.findByBusinessIds(requesterBusinessId, targetBusinessId);

        return {
            success: true,
            status: relationship ? relationship.status : null,
            isRequester: relationship ? relationship.requesterBusinessId === requesterBusinessId : false
        };
    } catch (error) {
        console.error("Get Relationship Status Error:", error);
        return { success: false, error: "Error al obtener estado" };
    }
}
