'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function saveWhatsAppConfig(formData: FormData) {
    const supabase = await createClient();

    // 1. Get current user/tenant context
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
        return { error: 'Unauthorized' };
    }

    // Resolve tenant from employee/user table
    // For now assuming existing tenant resolution logic or single tenant per user context
    const { data: employee } = await supabase
        .schema('core')
        .from('employees')
        .select('tenant_id')
        .eq('user_id', user.id)
        .single();

    if (!employee) {
        return { error: 'No tenant found for user' };
    }

    const tenantId = employee.tenant_id;

    // 2. Extract Data
    const phoneNumberId = formData.get('phoneNumberId') as string;
    const accessToken = formData.get('accessToken') as string;
    const verifyToken = formData.get('verifyToken') as string;
    const name = formData.get('name') as string;
    const businessAccountId = formData.get('businessAccountId') as string;

    if (!phoneNumberId || !accessToken) {
        return { error: 'Missing required fields: Phone ID or Access Token' };
    }

    // 3. Upsert Config
    const { error } = await supabase
        .schema('marketplace')
        .from('whatsapp_accounts')
        .upsert({
            tenant_id: tenantId,
            phone_number_id: phoneNumberId,
            access_token: accessToken,
            business_account_id: businessAccountId,
            verify_token: verifyToken,
            name: name || 'WhatsApp Business',
            updated_at: new Date().toISOString()
        }, {
            onConflict: 'tenant_id, phone_number_id'
        });

    if (error) {
        console.error('Error saving WhatsApp config:', error);
        return { error: 'Failed to save configuration' };
    }

    revalidatePath('/marketplace/whatsapp');
    return { success: true };
}
