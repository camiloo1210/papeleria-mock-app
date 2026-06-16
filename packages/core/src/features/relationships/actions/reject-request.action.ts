'use server';

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { resolveTenantId } from "@/shared/utils/auth.utils";

export async function rejectRequestAction(relationshipId: number) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { success: false, error: 'Unauthorized' };

    const tenantId = await resolveTenantId(user);
    if (!tenantId) return { success: false, error: 'No tenant found' };

    // Use standard client (RLS now allows this)
    const adminSupabase = await createClient();

    // Update Status
    const { error } = await adminSupabase
        .schema('core')
        .from('business_relationships')
        .update({ status: 'REJECTED', updated_at: new Date().toISOString() })
        .eq('id', relationshipId)
        .eq('target_business_id', tenantId)
        .eq('status', 'PENDING');

    if (error) {
        return { success: false, error: "Error al rechazar" };
    }

    revalidatePath('/protected/marketplace/requests');
    return { success: true };
}
