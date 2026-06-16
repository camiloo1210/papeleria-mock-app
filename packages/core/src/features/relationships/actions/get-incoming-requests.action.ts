'use server';

import { createClient } from "@/lib/supabase/server";
import { resolveTenantId } from "@/shared/utils/auth.utils";

export interface IncomingRequest {
    id: number;
    requesterBusinessId: number;
    requesterName: string;
    requesterLogoUrl?: string | null;
    createdAt: string;
    status: string;
}

export async function getIncomingRequestsAction(): Promise<IncomingRequest[]> {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return [];

    const tenantId = await resolveTenantId(user);

    if (!tenantId) {
        console.log("getIncomingRequestsAction: No tenant_id resolved for user", user.email);
        return [];
    }

    console.log("getIncomingRequestsAction: Resolved Tenant ID:", tenantId);

    const { data: requests, error } = await supabase
        .schema('core')
        .from('business_relationships')
        .select(`
            id,
            requester_business_id,
            target_business_id,
            status,
            created_at,
            requester:business!requester_business_id (
                trade_name,
                logo_url
            )
        `)
        .eq('target_business_id', tenantId)
        .eq('status', 'PENDING')
        .order('created_at', { ascending: false });

    if (error) {
        console.error("Error fetching incoming requests:", error);
        return [];
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return requests.map((r: any) => ({
        id: r.id,
        requesterBusinessId: r.requester_business_id,
        requesterName: r.requester?.trade_name || 'Desconocido',
        requesterLogoUrl: r.requester?.logo_url,
        createdAt: r.created_at,
        status: r.status
    }));
}
