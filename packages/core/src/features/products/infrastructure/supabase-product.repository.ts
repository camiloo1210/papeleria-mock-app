// import { createClient } from '@/lib/supabase/server'; // Removed to allow client-side usage
// TODO [EXTRACCION]: import a modulo no incluido en este repo -> Dexie/IndexedDB offline (EXCLUIDO). Resolver: copiar/stubear o eliminar.
import { db } from '@/lib/db';
import { LocalProductMapper } from './mappers/local-product.mapper';
import { IProductRepository } from "../domain/product.repository";
import { Product, ProductStatus } from "../domain/product.entity";
import { ProductVariant } from "../domain/product-variant.entity";
import { SupabaseClient } from '@supabase/supabase-js';
import { PaginatedResult, PaginationOptions } from '../../shared/domain/PaginationOptions';

// DB Interface matching the core.products table
interface DBProduct {
  id: number;
  uuid: string;
  name: string;
  price: number;
  cost: number;
  wholesale_price: number;
  description: string;
  stock: number;
  category_id: number;
  expiration_date?: string | null; // Supabase returns string for dates
  status: ProductStatus;
  sku: string;
  tenant_id: number;
  image_path: string | null;
  created_at: string;
  updated_at?: string;
  deleted_at?: string;
  is_active: boolean;
  is_deleted: boolean;
  has_variants: boolean;
  is_vat_exempt: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  variants?: any[]; // For joins
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function toPersistence(product: Product, categoryId: number): Partial<DBProduct> {
  return {
    uuid: product.id,
    name: product.getName(),
    price: product.getPrice().getValue(),
    cost: product.getCost().getValue(),
    description: product.getDescription(),
    stock: product.getStock(),
    category_id: categoryId,
    expiration_date: product.getExpirationDate() ? product.getExpirationDate()?.toISOString() : null,
    status: product.getStatus(),
    sku: product.getSku(),
    tenant_id: product.getTenantId(),
    image_path: product.getImagePath(),
    has_variants: product.getHasVariants(),
    is_vat_exempt: product.getIsVatExempt(),
    wholesale_price: product.getWholesalePrice().getValue(),
  };
}

function toDomain(data: DBProduct, seasonIds: string[] = []): Product {

  return Product.createProduct(
    data.uuid,
    data.name,
    data.price,
    data.cost,
    data.description,
    data.stock,
    String(data.category_id), // This really should be the UUID of the category, but we only have int ID here unless we join.
    // Keeping as string for now, but this might need a fix if domain expects UUID.
    data.sku,
    data.tenant_id,
    data.expiration_date ? new Date(data.expiration_date) : undefined,
    data.status,
    seasonIds,
    data.image_path || undefined,
    data.has_variants || false,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (data.variants || []).map((v: any) => ProductVariant.create(
      v.id?.toString(),
      v.product_id?.toString(),
      v.sku,
      v.price,
      v.cost || 0,
      v.stock || 0,
      v.attributes || {},
      v.status || 'active',
      v.image_path
    )),
    data.is_vat_exempt || false,
    data.wholesale_price || 0
  );
}

export class SupabaseProductRepository implements IProductRepository {
  constructor(private readonly supabase: SupabaseClient) { }

  private async mapToDomain(rows: DBProduct[]): Promise<Product[]> {
    if (!rows.length) return [];

    const imagePaths = rows.map(r => r.image_path).filter((p): p is string => !!p);
    const signedUrlsMap: Record<string, string> = {};

    if (imagePaths.length > 0) {
      const { data, error } = await this.supabase.storage
        .from('products')
        .createSignedUrls(imagePaths, 3600);

      if (!error && data) {
        data.forEach(item => {
          if (item.path && item.signedUrl) {
            signedUrlsMap[item.path] = item.signedUrl;
          }
        });
      }
    }

    return rows.map(row => {
      const product = toDomain(row, []); // Note: List methods currently don't fetch seasons.
      if (row.image_path && signedUrlsMap[row.image_path]) {
        product.imageUrl = signedUrlsMap[row.image_path];
      }
      return product;
    });
  }

  async save(product: Product): Promise<void> {
    // console.log("Saving product:", product.getSku());

    // 1. Resolve Category UUID to Integer ID
    const { data: categoryData, error: categoryError } = await this.supabase
      .schema('core')
      .from('product_categories')
      .select('id')
      .eq('uuid', product.getCategory()) // Assuming getCategory returns the UUID from the form
      .single();

    if (categoryError || !categoryData) {
      console.error("Error resolving category:", categoryError);
      throw new Error(`Invalid category ID: ${product.getCategory()}`);
    }

    const persistenceProduct = toPersistence(product, categoryData.id);

    // console.log("Persistence Product:", JSON.stringify(persistenceProduct, null, 2));

    const { data: savedProduct, error } = await this.supabase
      .schema('core')
      .from('products')
      .upsert(persistenceProduct, { onConflict: 'uuid' })
      .select('id')
      .single();

    if (error || !savedProduct) {
      console.error("Upsert Error:", error);
      throw new Error(`Failed to save product: ${error.message}`);
    }

    // Handle Seasons
    const seasonIds = product.getSeasonIds();

    // 1. Resolve Season UUIDs to IDs
    let seasonIntIds: number[] = [];
    if (seasonIds.length > 0) {
      const { data: seasonsData, error: seasonsError } = await this.supabase
        .schema('core')
        .from('seasons')
        .select('id')
        .in('uuid', seasonIds);

      if (seasonsError) {
        console.error("Error resolving seasons:", seasonsError);
        throw new Error(`Error resolving seasons: ${seasonsError.message}`);
      }
      seasonIntIds = seasonsData.map(s => s.id);
    }

    // 2. Delete existing associations
    const { error: deleteError } = await this.supabase
      .schema('core')
      .from('product_seasons')
      .delete()
      .eq('product_id', savedProduct.id);

    if (deleteError) {
      console.error("Error deleting old seasons:", deleteError);
      throw new Error(`Failed to update product seasons: ${deleteError.message}`);
    }

    // 3. Insert new associations
    if (seasonIntIds.length > 0) {
      const productSeasons = seasonIntIds.map(sid => ({
        product_id: savedProduct.id,
        season_id: sid
      }));

      const { error: insertError } = await this.supabase
        .schema('core')
        .from('product_seasons')
        .insert(productSeasons);

      if (insertError) {
        console.error("Error inserting new seasons:", insertError);
        throw new Error(`Failed to insert product seasons: ${insertError.message}`);
      }
    }

    // 4. Handle Variants
    if (product.getHasVariants()) {
      const variants = product.getVariants();
      // Delete all old variants? No, user might just be updating one.
      // But for simplicity/correctness, upserting is tricky if we don't have IDs.
      // If variants have IDs (edits), upsert. If new, insert.
      // For strict sync, maybe safe delete/insert or true upsert by SKU?
      // Let's use Upsert by ID if exists, or Insert. 
      // NOTE: If user deleted a variant in UI, it won't be in this list. 
      // So we should ideally delete variants NOT in this list.

      // Get existing variant IDs
      const currentVariantIds = variants.map(v => v.getId()).filter(id => id); // Only existing IDs

      // Delete removed variants
      if (savedProduct.id) {
        let deleteQuery = this.supabase
          .schema('core')
          .from('product_variants')
          .delete()
          .eq('product_id', savedProduct.id);

        if (currentVariantIds.length > 0) {
          deleteQuery = deleteQuery.not('id', 'in', `(${currentVariantIds.join(',')})`);
        }

        const { error: delError } = await deleteQuery;
        if (delError) {
          console.error("Error deleting old variants", delError);
        }
      }

      const variantsToUpsert = variants.map(v => ({
        id: v.getId() ? Number(v.getId()) : undefined,
        product_id: savedProduct.id,
        tenant_id: product.getTenantId(),
        sku: v.getSku(),
        price: v.getPrice().getValue(),
        cost: v.getCost().getValue(),
        stock: v.getStock(),
        attributes: v.getAttributes(),
        status: v.getStatus(),
        image_path: v.getImagePath()
      }));

      const cleanVariants = variantsToUpsert.map(v => {
        const { id, ...rest } = v;
        return isNaN(Number(id)) ? rest : v;
      });

      const { data: upsertedVariants, error: varError } = await this.supabase
        .schema('core')
        .from('product_variants')
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .upsert(cleanVariants as any, { onConflict: 'id' })
        .select('id');

      if (varError) {
        console.error("Error upserting variants:", varError);
        if (varError.code === '23505') { // Unique violation
          throw new Error(`Error de duplicado: El SKU de una variante ya existe. Detalle: ${varError.details || varError.message}`);
        }
        throw new Error(`Failed to save variants: ${varError.message}`);
      }

      // Delete missing (Double check to ensure cleanliness)
      if (upsertedVariants) {
        const upsertedIds = upsertedVariants.map(v => v.id);
        if (upsertedIds.length > 0) {
          await this.supabase.schema('core').from('product_variants').delete().eq('product_id', savedProduct.id).not('id', 'in', `(${upsertedIds.join(',')})`);
        }
      }
    }
  }

  async findById(id: string): Promise<Product | null> {
    // 1. Local Read
    if (typeof window !== 'undefined') {
      const localProduct = await db.products.where('id').equals(id).first();
      if (localProduct) {
        // console.log("⚡ Instant Read from Dexie (findById)");
        return LocalProductMapper.toDomain(localProduct);
      }
    }

    const { data, error } = await this.supabase
      .schema('core')
      .from('products')
      .select('*, variants:product_variants(*)')
      .eq('uuid', id) // Query by uuid column
      .maybeSingle();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw new Error(`Failed to find product: ${error.message}`);
    }

    if (!data) return null;

    // Fetch associated seasons
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: seasonData, error: _seasonError } = await this.supabase
      .schema('core')
      .from('product_seasons')
      .select('season_id, seasons:core.seasons(uuid)')
      .eq('product_id', data.id);

    let seasonIds: string[] = [];
    if (seasonData) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      seasonIds = (seasonData as any[]).map((s) => s.seasons?.uuid).filter((uuid): uuid is string => !!uuid);
    }

    const product = toDomain(data, seasonIds); // Modified: 'data' is ProductPrimitives

    if (data.image_path) {
      const { data: signedUrlData } = await this.supabase.storage
        .from('products')
        .createSignedUrl(data.image_path, 3600);

      if (signedUrlData?.signedUrl) {
        product.imageUrl = signedUrlData.signedUrl;
      }
    }

    return product;
  }

  async archive(id: string): Promise<void> {
    const { error } = await this.supabase
      .schema('core')
      .from('products')
      .update({ status: ProductStatus.ARCHIVED })
      .eq('uuid', id); // Query by uuid column

    if (error) {
      throw new Error(`Failed to archive product: ${error.message}`);
    }
  }

  async deleteById(id: string): Promise<void> {
    const { error } = await this.supabase
      .schema('core')
      .from('products')
      .delete()
      .eq('uuid', id); // Query by uuid column

    if (error) {
      throw new Error(`Failed to delete product: ${error.message}`);
    }
  }

  async findAll(tenantId?: number, pagination?: PaginationOptions): Promise<Product[] | PaginatedResult<Product>> {
    if (typeof window !== 'undefined') {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let localProducts: any[] = [];
      if (tenantId) {
        localProducts = await db.products.where('tenant_id').equals(tenantId).toArray();
      } else {
        localProducts = await db.products.toArray();
      }

      // Filter out deleted
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      localProducts = localProducts.filter((p) => !(p as any).is_deleted);

      if (localProducts.length > 0) {
        const products = localProducts.map(LocalProductMapper.toDomain);
        if (pagination) {
          const sliced = products.slice(pagination.offset, pagination.offset + pagination.limit);
          return { data: sliced, total: products.length, limit: pagination.limit, offset: pagination.offset };
        }
        return products;
      }
    }

    let query = this.supabase
      .schema('core')
      .from('products')
      .select('*', { count: pagination ? 'exact' : undefined })
      .neq('status', ProductStatus.ARCHIVED);

    if (tenantId) {
      query = query.eq('tenant_id', tenantId);
    }

    if (pagination) {
      query = query.range(pagination.offset, pagination.offset + pagination.limit - 1);
    }

    const { data, error, count } = await query;

    if (error) {
      throw new Error(`Failed to find all products: ${error.message}`);
    }

    const products = await this.mapToDomain(data || []);

    if (pagination) {
      return {
        data: products,
        total: count ?? 0,
        limit: pagination.limit,
        offset: pagination.offset,
      };
    }

    return products;
  }

  async findByCategory(categoryId: string, tenantId?: number): Promise<Product[]> {
    // We need to resolve the UUID categoryId to Int first, or join.
    // For simplicity, let's resolve it.
    const { data: categoryData, error: categoryError } = await this.supabase
      .schema('core')
      .from('product_categories')
      .select('id')
      .eq('uuid', categoryId)
      .single();

    if (categoryError || !categoryData) {
      return []; // Or throw error
    }

    let query = this.supabase
      .schema('core')
      .from('products')
      .select('*')
      .eq('category_id', categoryData.id);

    if (tenantId) {
      query = query.eq('tenant_id', tenantId);
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(`Failed to find products by category: ${error.message}`);
    }

    return this.mapToDomain(data || []);
  }

  async findAvailable(tenantId?: number): Promise<Product[]> {
    if (typeof window !== 'undefined') {
      const localProducts = await db.products.where('tenant_id').equals(tenantId || -1).toArray(); // Handle tenantId
      // Simplified filter
      const available = localProducts.filter((p) => !p.is_deleted && p.stock > 0);
      // Need to check status too? LocalProduct doesn't have explicit status string usually in my mapper? 
      // Mapper sets status based on stock. 
      // Let's rely on filter.

      if (available.length > 0) {
        return available.map(LocalProductMapper.toDomain);
      }
    }

    let query = this.supabase
      .schema('core')
      .from('products')
      .select('*')
      .eq('status', ProductStatus.ACTIVE)
      .gt('stock', 0);

    if (tenantId) {
      query = query.eq('tenant_id', tenantId);
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(`Failed to find available products: ${error.message}`);
    }

    return this.mapToDomain(data || []);
  }

  async findByStatus(status: ProductStatus, tenantId?: number): Promise<Product[]> {
    let query = this.supabase
      .schema('core')
      .from('products')
      .select('*')
      .eq('status', status);

    if (tenantId) {
      query = query.eq('tenant_id', tenantId);
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(`Failed to find products by status: ${error.message}`);
    }

    return this.mapToDomain(data || []);
  }

  async searchProductsByName(queryStr: string, tenantId?: number): Promise<Product[]> {
    if (typeof window !== 'undefined') {
      const lowerQuery = queryStr.toLowerCase();
      let collection = db.products.toCollection();
      if (tenantId) collection = db.products.where('tenant_id').equals(tenantId);

      const localProducts = await collection.filter((p) =>
        p.name.toLowerCase().includes(lowerQuery) && !p.is_deleted
      ).toArray();

      if (localProducts.length > 0 || queryStr.length > 0) { // If query is present but no results, return empty (don't go to server if synced? Maybe fallback if 0 results? No, if we have synced, we trust local.)
        // Assumption: If pendingItemsCount > 0 OR we have products in DB, we trust DB.
        // For now, simple fallback: if local returns, return it.
        // console.log("⚡ Instant Search from Dexie");
        return localProducts.map(LocalProductMapper.toDomain);
      }
    }

    let query = this.supabase
      .schema('core')
      .from('products')
      .select('*')
      .ilike('name', `%${queryStr}%`);

    if (tenantId) {
      query = query.eq('tenant_id', tenantId);
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(`Failed to search products: ${error.message}`);
    }

    return this.mapToDomain(data || []);
  }

  async getChanges(since: Date, tenantId?: number): Promise<ProductSyncChanges> {
    const isoSince = since.toISOString();

    let query = this.supabase
      .schema('core')
      .from('products')
      .select('*')
      .gt('updated_at', isoSince);

    if (tenantId) {
      query = query.eq('tenant_id', tenantId);
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(`Failed to fetch product changes: ${error.message}`);
    }

    if (!data || data.length === 0) {
      return { upserted: [], deletedIds: [] };
    }

    const rows = data as DBProduct[];
    const upserted: Product[] = [];
    const deletedIds: string[] = [];

    const activeRows = rows.filter(r => !r.is_deleted && !r.deleted_at);
    const deletedRows = rows.filter(r => r.is_deleted || r.deleted_at);

    // Map active rows to domain
    if (activeRows.length > 0) {
      const domains = await this.mapToDomain(activeRows);
      upserted.push(...domains);
    }

    // Collect deleted UUIDs
    deletedRows.forEach(r => deletedIds.push(r.uuid));

    return { upserted, deletedIds };
  }

  async saveMany(products: Product[]): Promise<void> {
    if (products.length === 0) return;

    const { data: categories, error: catError } = await this.supabase
      .schema('core')
      .from('product_categories')
      .select('id, uuid');

    if (catError) throw new Error("Failed to load categories for batch save");

    const catMap = new Map<string, number>();
    categories.forEach(c => catMap.set(c.uuid, c.id));

    const persistenceProducts: Partial<DBProduct>[] = [];

    for (const p of products) {
      const catId = catMap.get(p.getCategory());
      if (!catId) {
        console.warn(`Category not found for product ${p.getName()} (${p.getCategory()}). Skipping.`);
        continue;
      }
      persistenceProducts.push(toPersistence(p, catId));
    }

    if (persistenceProducts.length === 0) return;

    const { error } = await this.supabase
      .schema('core')
      .from('products')
      .upsert(persistenceProducts, { onConflict: 'uuid' });

    if (error) {
      throw new Error(`Failed to batch save products: ${error.message}`);
    }
  }
}

export interface ProductSyncChanges {
  upserted: Product[];
  deletedIds: string[];
}