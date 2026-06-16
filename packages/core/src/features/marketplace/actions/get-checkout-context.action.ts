"use server";

import { createClient } from "@/lib/supabase/server";
import { resolveTenantId } from "@/shared/utils/auth.utils";

export async function getCheckoutContextAction() {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return { isAuthenticated: false };
        }

        const tenantId = await resolveTenantId(user);

        let businessName = null;
        if (tenantId) {
            const { data: business } = await supabase
                .schema('core')
                .from('business')
                .select('trade_name')
                .eq('id', tenantId)
                .single();

            businessName = business?.trade_name;
        }

        return {
            isAuthenticated: true,
            tenantId,
            businessName,
            userName: user.user_metadata?.first_name || user.email
        };

    } catch (error) {
        console.error("Get Checkout Context Error:", error);
        return { isAuthenticated: false };
    }
}
