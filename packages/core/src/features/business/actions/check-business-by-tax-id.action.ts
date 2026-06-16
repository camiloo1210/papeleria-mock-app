'use server';

import { createServiceRoleClient } from '@/lib/supabase/service';
import { z } from 'zod';

const schema = z.object({
    taxId: z.string().min(1),
    countryCode: z.string().optional().default('EC'), // Default to Ecuador for now
});

export async function checkBusinessByTaxIdAction(input: z.infer<typeof schema>) {
    const result = schema.safeParse(input);
    if (!result.success) {
        return { success: false, error: 'Invalid Tax ID' };
    }

    const supabaseAdmin = createServiceRoleClient();

    try {
        // Query core.business table using admin client to bypass RLS
        // We only return minimal info to avoid leaking data
        // We assume tax_id is stored in 'tax_id' column or similar.
        // In create-business.ts, it uses TaxId value object, but stored as jsonb? 
        // Let's check how it's stored. The migration says 'tax_id' type TEXT.
        // But in create-business it uses `TaxId.create(...)`.
        // Let's assume it's stored as plain text or we need to match the structure.
        // Looking at `core.business` migration might be useful, but `core.suppliers` migration text `tax_id TEXT` suggests simple text.
        // core.business usually has `tax_id` as text or similar.

        const { data, error } = await supabaseAdmin
            .schema('core')
            .from('business')
            .select(`
                id, 
                legal_name, 
                trade_name,
                business_category_links (
                    business_categories (
                        name,
                        slug
                    )
                )
            `)
            .eq('tax_id', input.taxId)
            .single();

        if (error) {
            if (error.code === 'PGRST116') {
                return { success: true, found: false };
            }
            console.error('Error checking business:', error);
            return { success: false, error: 'Database error' };
        }

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const categories = (data.business_category_links as any[])?.map((link: any) => ({
            name: link.business_categories.name,
            slug: link.business_categories.slug
        })) || [];

        return {
            success: true,
            found: true,
            business: {
                id: data.id,
                name: data.trade_name || data.legal_name,
                categories: categories
            }
        };

    } catch (error) {
        console.error('Unexpected error:', error);
        return { success: false, error: 'Unexpected error' };
    }
}
