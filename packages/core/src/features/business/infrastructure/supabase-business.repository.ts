import { SupabaseClient } from '@supabase/supabase-js';
import { Business } from '../domain/business.entity';
import { BusinessRepository } from '../domain/business.repository';
import { TaxId } from '@/features/shared/domain/value-objects/TaxId';
import { CurrencyCode } from '@/features/shared/domain/value-objects/CurrencyCode';
import { BusinessRepositoryError } from '../domain/errors/business-repository.error';

export class SupabaseBusinessRepository implements BusinessRepository {
  constructor(private readonly supabase: SupabaseClient) { }

  /* ---------- helpers ---------- */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private toDomain(row: any): Business {
    return Business.create({
      id: row.id,
      uuid: row.uuid,
      legalName: row.legal_name,
      tradeName: row.trade_name,
      taxId: TaxId.create(row.tax_id),
      taxpayerType: row.taxpayer_type,
      logoUrl: row.logo_url,
      brandColor: row.brand_color,
      timezone: row.timezone,
      currency: CurrencyCode.create(row.currency),
      planId: row.plan_id,
      subscriptionDate: row.subscription_date ? new Date(row.subscription_date) : undefined,
      subscriptionStatus: row.subscription_status,
      status: row.status,
      createdAt: row.created_at ? new Date(row.created_at) : undefined,
      updatedAt: row.updated_at ? new Date(row.updated_at) : undefined,
      deletedAt: row.deleted_at ? new Date(row.deleted_at) : undefined,
      countryId: row.country_id,
      countryCode: row.country?.iso_code_2,
      categories: row.categories, // Already mapped in findById or passed through
      acceptsSuppliers: row.accepts_suppliers ?? false,
    });
  }

  async findAll(tenantId?: number): Promise<Business[]> {
    let query = this.supabase
      .schema('core')
      .from('business')
      .select('*');

    if (tenantId) {
      query = query.eq('id', tenantId);
    }

    const { data, error } = await query;

    if (error) throw new BusinessRepositoryError(error.message, 'DATABASE_ERROR');
    return data.map(row => this.toDomain(row));
  }

  async findById(id: number): Promise<Business | null> {
    const { data: businessData, error } = await this.supabase
      .schema('core')
      .from('business')
      .select('*, categories:business_category_links(category:business_categories(slug))')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw new BusinessRepositoryError(error.message, 'DATABASE_ERROR');
    }

    // Fetch country manually to avoid "relationship not found" error
    let countryCode: string | undefined;
    if (businessData.country_id) {
      const { data: countryData } = await this.supabase
        .schema('shared')
        .from('country')
        .select('iso_code_2')
        .eq('id', businessData.country_id)
        .single();

      if (countryData) {
        countryCode = countryData.iso_code_2;
      }
    }

    // Inject country object to match expected structure
    const joinedData = {
      ...businessData,
      country: countryCode ? { iso_code_2: countryCode } : undefined,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      categories: businessData.categories?.map((link: any) => link.category?.slug) || []
    };

    return this.toDomain(joinedData);
  }

  async findByUuid(uuid: string): Promise<Business | null> {
    const { data, error } = await this.supabase
      .schema('core')
      .from('business')
      .select('*')
      .eq('uuid', uuid)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw new BusinessRepositoryError(error.message, 'DATABASE_ERROR');
    }
    return this.toDomain(data);
  }

  async create(business: Business): Promise<Business> {
    const primitives = business.toPrimitives();
    // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any
    const { categories: _cats, country, ...createPayload } = primitives as any;

    const { data, error } = await this.supabase
      .schema('core')
      .from('business')
      .insert(createPayload)
      .select()
      .single();

    if (error) throw new BusinessRepositoryError(error.message, 'DATABASE_ERROR');
    if (!data) throw new BusinessRepositoryError('Failed to create business: no data returned.', 'CREATION_ERROR');

    // Handle Categories
    const categories = business.getCategories();
    if (categories && categories.length > 0) {
      // 1. Resolve Slugs/Names to IDs (assuming slugs for now)
      const { data: categoryRows, error: catError } = await this.supabase
        .schema('core')
        .from('business_categories')
        .select('id')
        .in('slug', categories);

      if (!catError && categoryRows && categoryRows.length > 0) {
        const links = categoryRows.map(cat => ({
          business_id: data.id,
          category_id: cat.id
        }));

        await this.supabase
          .schema('core')
          .from('business_category_links')
          .insert(links);
      }
    }

    return this.toDomain(data);
  }

  async update(id: number, business: Business, tenantId: number): Promise<Business> {
    // IDOR Protection: Ensure we are updating the business that matches the authorized tenant
    if (id !== tenantId) {
      throw new BusinessRepositoryError('Unauthorized: Cannot update a business different from the current tenant.', 'UNAUTHORIZED');
    }

    const primitives = business.toPrimitives();
    // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any
    const { categories: _cats, country, ...updatePayload } = primitives as any;

    const { data, error } = await this.supabase
      .schema('core')
      .from('business')
      .update(updatePayload)
      .eq('id', id)
      .eq('id', tenantId) // Double check at DB level
      .select()
      .single();

    if (error) throw new BusinessRepositoryError(error.message, 'DATABASE_ERROR');
    if (!data) throw new BusinessRepositoryError(`Business with id ${id} not found.`, 'NOT_FOUND');

    // Handle Categories Update
    const categories = business.getCategories();
    if (categories !== undefined) { // Check if categories were included in the update request
      // 1. Resolve Slugs to IDs
      const { data: categoryRows, error: catError } = await this.supabase
        .schema('core')
        .from('business_categories')
        .select('id')
        .in('slug', categories);

      if (!catError && categoryRows) {
        const categoryIds = categoryRows.map(c => c.id);

        // 2. Clear existing links
        // We need a DELETE policy for this to work (added in migration 20260213150000)
        await this.supabase
          .schema('core')
          .from('business_category_links')
          .delete()
          .eq('business_id', id);

        // 3. Insert new links
        if (categoryIds.length > 0) {
          const links = categoryIds.map(catId => ({
            business_id: id,
            category_id: catId
          }));
          await this.supabase
            .schema('core')
            .from('business_category_links')
            .insert(links);
        }
      }
    }

    return this.toDomain(data);
  }

  async delete(id: number, tenantId: number): Promise<void> {
    if (id !== tenantId) {
      throw new BusinessRepositoryError('Unauthorized: Cannot delete a business different from the current tenant.', 'UNAUTHORIZED');
    }

    const { error } = await this.supabase
      .schema('core')
      .from('business')
      .delete()
      .eq('id', id)
      .eq('id', tenantId);

    if (error) throw new BusinessRepositoryError(error.message, 'DATABASE_ERROR');
  }
}