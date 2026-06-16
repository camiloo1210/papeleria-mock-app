import { SupabaseClient } from '@supabase/supabase-js';
import { BusinessCategoryRepository } from '../../domain/repositories/business-category.repository';
import { BusinessCategory } from '../../domain/business-category.entity';

export class SupabaseBusinessCategoryRepository implements BusinessCategoryRepository {
    constructor(private readonly supabase: SupabaseClient) { }

    async findAll(): Promise<BusinessCategory[]> {
        const { data, error } = await this.supabase
            .schema('core')
            .from('business_categories')
            .select('*')
            .order('name');

        if (error) throw new Error(error.message);

        return data.map(this.toDomain);
    }

    async findById(id: number): Promise<BusinessCategory | null> {
        const { data, error } = await this.supabase
            .schema('core')
            .from('business_categories')
            .select('*')
            .eq('id', id)
            .single();

        if (error) return null;

        return this.toDomain(data);
    }

    async findBySlug(slug: string): Promise<BusinessCategory | null> {
        const { data, error } = await this.supabase
            .schema('core')
            .from('business_categories')
            .select('*')
            .eq('slug', slug)
            .single();

        if (error) return null;

        return this.toDomain(data);
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    private toDomain(row: any): BusinessCategory {
        return {
            id: row.id,
            name: row.name,
            slug: row.slug,
            description: row.description,
            created_at: new Date(row.created_at)
        };
    }

    async assignToBusiness(businessId: number, categoryIds: number[]): Promise<void> {
        // 1. Delete existing links
        const { error: deleteError } = await this.supabase
            .schema('core')
            .from('business_category_links')
            .delete()
            .eq('business_id', businessId);

        if (deleteError) throw new Error(deleteError.message);

        // 2. Insert new links
        if (categoryIds.length > 0) {
            const rows = categoryIds.map(catId => ({
                business_id: businessId,
                category_id: catId
            }));

            const { error: insertError } = await this.supabase
                .schema('core')
                .from('business_category_links')
                .insert(rows);

            if (insertError) throw new Error(insertError.message);
        }
    }
}
