'use server';

import { createClient } from '@/lib/supabase/server';
import { SupabaseBusinessCategoryRepository } from '@/features/business/infrastructure/repositories/supabase-business-category.repository';

export async function getBusinessCategoriesAction() {
    const supabase = await createClient();
    const repository = new SupabaseBusinessCategoryRepository(supabase);

    try {
        const categories = await repository.findAll();
        return { success: true, data: categories };
    } catch (error: unknown) {
        console.error('Error fetching business categories:', error);
        return { success: false, error: 'Failed to fetch categories' };
    }
}
