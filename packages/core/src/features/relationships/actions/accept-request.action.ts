'use server';

import { createClient, createServiceRoleClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { resolveTenantId } from "@/shared/utils/auth.utils";

export async function acceptRequestAction(relationshipId: number) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { success: false, error: 'Unauthorized' };

    const tenantId = await resolveTenantId(user);
    if (!tenantId) return { success: false, error: 'No tenant found' };

    // 2. Verify Relationship Ownership (Target)
    const { data: relationship } = await supabase
        .schema('core')
        .from('business_relationships')
        .select('*')
        .eq('id', relationshipId)
        .eq('target_business_id', tenantId)
        .eq('status', 'PENDING')
        .single();

    if (!relationship) return { success: false, error: "Solicitud no encontrada o ya procesada" };

    // Use standard client (RLS now allows this)
    const adminSupabase = await createClient();

    // 3. Update Relationship Status
    const { error: updateError } = await adminSupabase
        .schema('core')
        .from('business_relationships')
        .update({ status: 'ACCEPTED', updated_at: new Date().toISOString() })
        .eq('id', relationshipId);

    if (updateError) {
        console.error("Error accepting request:", updateError);
        return { success: false, error: "Error al aceptar la solicitud" };
    }

    // 4. Sync to Suppliers (Add Requester as Supplier for Target)
    // Use Service Role for BOTH fetching requester details (might be hidden by RLS) and inserting supplier
    const serviceRoot = createServiceRoleClient();

    // Fetch Requester Details (Business)
    const { data: requester, error: reqError } = await serviceRoot
        .schema('core')
        .from('business')
        .select('id, trade_name, legal_name, tax_id') // Removed non-existent contact_email
        .eq('id', relationship.requester_business_id)
        .single();

    if (reqError || !requester) {
        console.error("Failed to fetch requester business:", reqError);
        return { success: true, message: "Relación aceptada, pero no se pudo obtener datos del proveedor." };
    }

    // Try to fetch Owner email
    let requesterEmail = '';
    const { data: ownerData } = await serviceRoot
        .schema('core')
        .from('employees')
        .select('user:users(email)')
        .eq('tenant_id', requester.id)
        .eq('is_owner', true)
        .single();

    // Safety check for deep nested data
    if (ownerData && ownerData.user && Array.isArray(ownerData.user) === false) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        requesterEmail = (ownerData.user as any).email || '';
    } else if (ownerData && ownerData.user && Array.isArray(ownerData.user) && ownerData.user.length > 0) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        requesterEmail = (ownerData.user[0] as any).email || '';
    }

    if (requester) {

        // Insert into core.suppliers
        // Use standard client to ensure we respect RLS/policies for the current user (Target Business)
        const { error: supplierError } = await adminSupabase
            .schema('core')
            .from('suppliers')
            .insert({
                tenant_id: tenantId, // My business (Target)
                linked_tenant_id: requester.id, // The requester
                commercial_name: requester.trade_name,
                legal_name: requester.legal_name || requester.trade_name,
                tax_id: requester.tax_id || '',
                email: requesterEmail, // Use fetched owner email
                connection_status: 'CONNECTED',
                is_active: true
            });

        if (supplierError) {
            console.error("Error creating supplier record:", supplierError);
            return { success: false, error: "Relación aceptada, pero error al crear proveedor: " + supplierError.message };
        }
    }

    // TODO: Bilateral? Add Target as Client for Requester?

    revalidatePath('/protected/marketplace/requests');
    return { success: true };
}
