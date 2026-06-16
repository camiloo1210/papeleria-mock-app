import { SupabaseClient } from '@supabase/supabase-js';

export interface WhatsAppConfig {
    id: string;
    tenant_id: string;
    phone_number_id: string;
    access_token: string;
    business_account_id?: string;
    verify_token?: string;
    name?: string;
}

export class WhatsAppRepository {
    constructor(private readonly supabase: SupabaseClient) { }

    async getByPhoneNumberId(phoneNumberId: string): Promise<WhatsAppConfig | null> {
        const { data, error } = await this.supabase
            .schema('marketplace')
            .from('whatsapp_accounts')
            .select('*')
            .eq('phone_number_id', phoneNumberId)
            .single();

        if (error) {
            console.error('[WhatsAppRepo] Error fetching by phone ID:', error);
            return null;
        }

        return data;
    }

    async getByTenantId(tenantId: string): Promise<WhatsAppConfig | null> {
        const { data, error } = await this.supabase
            .schema('marketplace')
            .from('whatsapp_accounts')
            .select('*')
            .eq('tenant_id', tenantId)
            .single();

        if (error) return null;
        return data;
    }

    async saveConfig(_config: Partial<WhatsAppConfig>) {
        // Implementation for UI settings later
    }
}
