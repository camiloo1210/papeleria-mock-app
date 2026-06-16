'use server';

import { createClient } from "@/lib/supabase/server";
import { SupabaseBusinessRelationshipRepository } from "../infrastructure/supabase-business-relationship.repository";
import { revalidatePath } from "next/cache";

import { resolveTenantId } from "@/shared/utils/auth.utils";

export async function requestSupplierConnectionAction(targetBusinessId: number) {
    const supabase = await createClient();

    // 1. Get current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return { success: false, error: "Debes iniciar sesión" };
    }

    // 2. Get current user's business (requester)
    const tenantId = await resolveTenantId(user);

    if (!tenantId) {
        return { success: false, error: "No tienes un negocio asociado" };
    }

    const requesterBusinessId = tenantId;

    if (requesterBusinessId === targetBusinessId) {
        return { success: false, error: "No puedes conectarte contigo mismo" };
    }

    const repository = new SupabaseBusinessRelationshipRepository();

    // Check if target business accepts suppliers
    const { data: targetBusiness, error: bizError } = await supabase
        .schema('core')
        .from('business')
        .select('accepts_suppliers')
        .eq('id', targetBusinessId)
        .single();

    if (bizError || !targetBusiness) {
        return { success: false, error: "Negocio no encontrado" };
    }

    if (!targetBusiness.accepts_suppliers) {
        return { success: false, error: "Este negocio no acepta solicitudes de proveedor" };
    }

    try {
        // 3. Check if relationship already exists
        const existing = await repository.findByBusinessIds(requesterBusinessId, targetBusinessId);

        if (existing) {
            return { success: false, error: `Ya existe una relación con estado: ${existing.status}` };
        }

        // 4. Create request
        await repository.createRequest(requesterBusinessId, targetBusinessId);

        revalidatePath('/marketplace');
        return { success: true };
    } catch (error) {
        console.error("Connect Supplier Action Error:", error);
        return { success: false, error: "Error al enviar la solicitud" };
    }
}
