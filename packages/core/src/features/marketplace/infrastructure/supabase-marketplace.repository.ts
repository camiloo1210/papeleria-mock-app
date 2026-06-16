import { createServiceRoleClient } from "@/lib/supabase/server";
import { MarketplaceProduct } from "../domain/marketplace-product.entity";
import { MarketplaceBusiness } from "../domain/marketplace-business.entity";
import { BusinessCategory } from "../../business/domain/business-category.entity";
import { MarketplaceOrder, MarketplaceOrderItem } from "../domain/marketplace-order.entity";


export class SupabaseMarketplaceRepository {
    async findAllCategories(): Promise<BusinessCategory[]> {
        const supabase = createServiceRoleClient();
        const { data, error } = await supabase
            .schema('core')
            .from('business_categories')
            .select('*')
            .order('name');

        if (error) {
            console.error("Marketplace Repo (Categories) Error:", error);
            return [];
        }

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return data.map((row: any) => ({
            id: row.id,
            name: row.name,
            slug: row.slug,
            description: row.description,
            created_at: new Date(row.created_at)
        }));
    }

    async findAllBusinesses(categorySlug?: string, searchQuery?: string): Promise<MarketplaceBusiness[]> {
        const supabase = createServiceRoleClient();

        // Re-construct query to handle optional filter correctly
        let selectQuery = `
            id,
            uuid,
            trade_name,
            legal_name,
            logo_url,
            brand_color,
            accepts_suppliers,
            categories:business_category_links(
                category:business_categories(name, slug)
            )
        `;

        // If filtering by category, we need the !inner join
        if (categorySlug) {
            selectQuery = `
                id,
                uuid,
                trade_name,
                legal_name,
                logo_url,
                brand_color,
                accepts_suppliers,
                categories:business_category_links!inner(
                    category:business_categories!inner(name, slug)
                )
            `;
        }

        const dbQuery = supabase
            .schema('core')
            .from('business')
            .select(selectQuery)
            .eq('status', true);

        if (categorySlug) {
            dbQuery.eq('categories.category.slug', categorySlug);
        }

        if (searchQuery) {
            dbQuery.ilike('trade_name', `%${searchQuery}%`);
        }

        const { data: businesses, error } = await dbQuery;

        if (error) {
            console.error("Marketplace Repo (Businesses) Error:", error);
            return [];
        }

        // Fetch all ratings and compute stats per business
        const { data: ratings } = await supabase
            .schema('core')
            .from('business_ratings')
            .select('target_business_id, rating');

        // Compute rating stats per business
        const ratingStatsMap = new Map<number, { sum: number; count: number }>();
        if (ratings) {
            for (const r of ratings) {
                const existing = ratingStatsMap.get(r.target_business_id) || { sum: 0, count: 0 };
                existing.sum += r.rating;
                existing.count += 1;
                ratingStatsMap.set(r.target_business_id, existing);
            }
        }

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return (businesses as any[]).map((b) => {
            const stats = ratingStatsMap.get(b.id) || { sum: 0, count: 0 };
            return {
                id: b.id,
                uuid: b.uuid,
                tradeName: b.trade_name,
                legalName: b.legal_name,
                logoUrl: b.logo_url,
                brandColor: b.brand_color,
                ratingAverage: stats.count > 0 ? Number((stats.sum / stats.count).toFixed(1)) : 0,
                ratingCount: stats.count,
                acceptsSuppliers: b.accepts_suppliers ?? false,
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                categories: b.categories?.map((c: any) => c.category?.name).filter(Boolean) || [],
            };
        });
    }

    async findBusinessByUuid(uuid: string): Promise<MarketplaceBusiness | null> {
        const supabase = createServiceRoleClient();

        const { data, error } = await supabase
            .schema('core')
            .from('business')
            .select(`
                id,
                uuid,
                trade_name,
                legal_name,
                logo_url,
                brand_color,
                accepts_suppliers,
                categories:business_category_links(
                    category:business_categories(name)
                )
            `)
            .eq('uuid', uuid)
            .single();

        if (error || !data) {
            // PGRST116: JSON object requested, multiple (or no) rows returned
            // 22P02: invalid input syntax for type uuid
            if (error && error.code !== 'PGRST116' && error.code !== '22P02') {
                console.error("Marketplace Repo (Find Business) Error:", JSON.stringify(error, null, 2));
            }
            return null;
        }

        // Fetch rating stats for this business
        const { data: ratings } = await supabase
            .schema('core')
            .from('business_ratings')
            .select('rating')
            .eq('target_business_id', data.id);

        let ratingAverage = 0;
        let ratingCount = 0;
        if (ratings && ratings.length > 0) {
            ratingCount = ratings.length;
            const sum = ratings.reduce((acc, r) => acc + r.rating, 0);
            ratingAverage = Number((sum / ratingCount).toFixed(1));
        }

        return {
            id: data.id,
            uuid: data.uuid,
            tradeName: data.trade_name,
            legalName: data.legal_name,
            logoUrl: data.logo_url,
            brandColor: data.brand_color,
            ratingAverage,
            ratingCount,
            acceptsSuppliers: data.accepts_suppliers ?? false,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            categories: (data as any).categories?.map((c: any) => c.category?.name).filter(Boolean) || [],
        };
    }

    async findProductsByBusiness(tenantId: number): Promise<MarketplaceProduct[]> {
        const supabase = createServiceRoleClient();

        const { data, error } = await supabase
            .schema('core')
            .from('products')
            .select(`
                id,
                uuid,
                name,
                description,
                price,
                wholesale_price,
                image_path,
                tenant_id,
                stock,
                category:category_id(name),
                business:tenant_id(trade_name)
            `)
            .eq('tenant_id', tenantId);

        if (error) {
            console.error("Marketplace Repo (Store Products) Error:", error);
            return [];
        }

        // 1. Collect all image paths
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const imagePaths = (data as any[]).map(p => p.image_path).filter((p): p is string => !!p);
        const signedUrlsMap: Record<string, string> = {};

        // 2. Generate Signed URLs
        if (imagePaths.length > 0) {
            const { data: signedData, error: signedError } = await supabase.storage
                .from('products')
                .createSignedUrls(imagePaths, 3600); // 1 hour expiry

            if (!signedError && signedData) {
                signedData.forEach(item => {
                    if (item.path && item.signedUrl) {
                        signedUrlsMap[item.path] = item.signedUrl;
                    }
                });
            }
        }

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return (data as any[]).map((p: any) => ({
            id: p.id,
            uuid: p.uuid,
            name: p.name,
            description: p.description,
            price: p.price,
            image_path: (p.image_path && signedUrlsMap[p.image_path]) ? signedUrlsMap[p.image_path] : undefined,
            tenant_id: p.tenant_id,
            stock: p.stock,
            business_name: p.business?.trade_name || 'Desconocido',
            category_name: p.category?.name || 'Varios',
            wholesale_price: p.wholesale_price || 0,
        }));
    }

    // Keep legacy method but maybe deprecated? Or just useful for "All Products" view if requested.
    async findAllProducts(): Promise<MarketplaceProduct[]> {
        const supabase = createServiceRoleClient();
        // ... (Keep existing implementation)
        const { data, error } = await supabase
            .schema('core')
            .from('products')
            .select(`
        id,
        uuid,
        name,
        description,
        price,
        image_path,
        tenant_id,
        stock,
        category:category_id(name),
        business:tenant_id(trade_name)
      `)
            .eq('status', 'ACTIVE')
            .gt('stock', 0);

        if (error) {
            console.error("Marketplace Repo Error:", error);
            return [];
        }

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return (data as any[]).map((p: any) => ({
            id: p.id,
            uuid: p.uuid,
            name: p.name,
            description: p.description,
            price: p.price,
            image_path: p.image_path || undefined, // Coerce null to undefined
            tenant_id: p.tenant_id,
            stock: p.stock,
            business_name: p.business?.trade_name || 'Desconocido',
            category_name: p.category?.name || 'Varios',
        }));
    }

    async createOrder(order: Partial<MarketplaceOrder>): Promise<number | null> {
        const supabase = createServiceRoleClient();
        const { data, error } = await supabase
            .schema('core')
            .from('marketplace_orders')
            .insert({
                buyer_tenant_id: order.buyerTenantId, // Can be undefined for C2B
                buyer_user_id: order.buyerUserId,     // Can be undefined for B2B
                order_type: order.orderType,
                seller_tenant_id: order.sellerTenantId,
                total_amount: order.totalAmount,
                status: 'PENDING',
                currency: 'USD'
            })
            .select('id')
            .single();

        if (error) {
            console.error("Create Order Error:", error);
            return null;
        }
        return data.id;
    }

    async createOrderItems(orderId: number, items: MarketplaceOrderItem[]): Promise<boolean> {
        const supabase = createServiceRoleClient();
        const rows = items.map(item => ({
            order_id: orderId,
            product_id: item.productId,
            quantity: item.quantity,
            unit_price: item.unitPrice,
            total_price: item.totalPrice
        }));

        const { error } = await supabase
            .schema('core')
            .from('marketplace_order_items')
            .insert(rows);

        if (error) {
            console.error("Create Order Items Error:", error);
            return false;
        }
        return true;
    }

    async syncToERP(orderId: number): Promise<{ success: boolean; error?: string }> {
        const supabase = createServiceRoleClient();

        try {
            // 1. Fetch Order
            const { data: order, error: orderError } = await supabase
                .schema('core')
                .from('marketplace_orders')
                .select(`
                    *,
                    items:marketplace_order_items(*),
                    buyer_business:buyer_tenant_id(*),
                    seller_business:seller_tenant_id(*)
                `)
                .eq('id', orderId)
                .single();

            if (orderError || !order) throw new Error(orderError?.message || "Order not found");

            // 2. Sync to Seller (Create Sales Order)
            const salesOrderId = await this.createSalesOrder(supabase, order);

            // 3. Sync to Buyer (Create Purchase Order) - ONLY B2B
            if (order.order_type === 'B2B' && order.buyer_tenant_id) {
                const purchaseOrderId = await this.createPurchaseOrder(supabase, order);
            }

            return { success: true };
        } catch (error) {
            console.error("Sync to ERP Error:", error);
            return { success: false, error: (error as Error).message };
        }
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    private async createSalesOrder(supabase: any, order: any) {
        const sellerId = order.seller_tenant_id;

        // A. Find or Create Client
        let clientId: number | null = null;

        if (order.order_type === 'B2B') {
            const buyerBusiness = order.buyer_business;
            // Try find by Tax ID
            const { data: existingClient } = await supabase
                .schema('core')
                .from('clients')
                .select('id')
                .eq('tenant_id', sellerId)
                .eq('tax_id', buyerBusiness.tax_id)
                .single();

            if (existingClient) {
                clientId = existingClient.id;
            } else {
                // Create Client from Business Data
                // Need a Person first? core.clients requires person_id.
                // We can't easily create a person for a Business Entity without a rep.
                // Hack for MVP: Use a "placeholder" person or try to find the User rep?
                // Better: Check if core.clients can have NULL person_id?
                // Let's check schema/migration if possible. 
                // Assuming we need a Person. 
                // Let's fallback to: If client doesn't exist, we skip creation or use a "Walk-in" client?
                // User requirement: "Auto-create".
                // We will skip strict Person creation for now and assume we can reuse the Business Owner's person if we find it?
                // Complex. Let's just create a Client with the Business Name as First Name?
                // Creating a Person requires valid data.
                // Strategy: Create a "Business Person" record.

                // 1. Create Shared Person
                const { data: person } = await supabase
                    .schema('shared')
                    .from('person')
                    .insert({
                        first_name: buyerBusiness.trade_name,
                        last_name: '(Empresa)',
                        tenant_id: sellerId, // Belongs to seller's list
                        email: 'noreply@fiado.app' // Dummy
                    })
                    .select('id')
                    .single();

                if (person) {
                    const { data: newClient } = await supabase
                        .schema('core')
                        .from('clients')
                        .insert({
                            tenant_id: sellerId,
                            person_id: person.id,
                            is_active: true
                        })
                        .select('id')
                        .single();
                    clientId = newClient?.id;
                }
            }
        } else {
            // C2B: Buyer is User
            // Fetch User -> Person
            const { data: user } = await supabase
                .schema('core')
                .from('users')
                .select('*, person:person_id(*)')
                .eq('uuid', order.buyer_user_id)
                .single();

            if (user && user.person) {
                // Check existence
                const { data: existingClient } = await supabase
                    .schema('core')
                    .from('clients')
                    .select('id')
                    .eq('tenant_id', sellerId)
                    .eq('person_id', user.person_id) // Same person might be linked? No, person is tenant-scoped usually?
                    // shared.person has tenant_id? Yes. 
                    // So we need to copy the person or link it?
                    // shared.person table: tenant_id FK.
                    // So we must COPY the person data to a new Person in Seller's Tenant.
                    .single();

                if (existingClient) {
                    clientId = existingClient.id;
                } else {
                    // Copy Person
                    const { data: newPerson } = await supabase
                        .schema('shared')
                        .from('person')
                        .insert({
                            tenant_id: sellerId,
                            first_name: user.person.first_name,
                            last_name: user.person.last_name,
                            email: user.email,
                            // other fields...
                        })
                        .select('id')
                        .single();

                    if (newPerson) {
                        const { data: newClient } = await supabase
                            .schema('core')
                            .from('clients')
                            .insert({
                                tenant_id: sellerId,
                                person_id: newPerson.id,
                                is_active: true
                            })
                            .select('id')
                            .single();
                        clientId = newClient?.id;
                    }
                }
            }
        }

        // B. Create Order
        const { data: salesOrder } = await supabase
            .schema('core')
            .from('orders')
            .insert({
                tenant_id: sellerId,
                client_id: clientId,
                status: 'PENDING',
                total: order.total_amount, // Simplified, taxes/subtotal should be calculated
                subtotal: order.total_amount,
                notes: `Marketplace Order #${order.uuid}`,
                created_at: new Date()
            })
            .select('id, created_at')
            .single();

        if (salesOrder) {
            // C. Create Items
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const items = order.items.map((item: any) => ({
                order_id: salesOrder.id,
                tenant_id: sellerId,
                order_created_at: salesOrder.created_at,
                product_id: item.product_id, // Seller's Product ID
                quantity: item.quantity,
                unit_price: item.unit_price,
                line_total: item.total_price
            }));

            await supabase
                .schema('core')
                .from('order_items')
                .insert(items);
        }

        return salesOrder?.id;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    private async createPurchaseOrder(supabase: any, order: any) {
        const buyerId = order.buyer_tenant_id;
        const sellerBusiness = order.seller_business;

        // A. Find or Create Supplier
        let supplierId: number | null = null;

        const { data: existingSupplier } = await supabase
            .schema('core')
            .from('suppliers')
            .select('id')
            .eq('tenant_id', buyerId)
            .eq('tax_id', sellerBusiness.tax_id) // Checking by RUC
            .single();

        if (existingSupplier) {
            supplierId = existingSupplier.id;
        } else {
            // Auto-create Supplier
            const { data: newSupplier } = await supabase
                .schema('core')
                .from('suppliers')
                .insert({
                    tenant_id: buyerId,
                    commercial_name: sellerBusiness.trade_name,
                    legal_name: sellerBusiness.legal_name,
                    tax_id: sellerBusiness.tax_id,
                    is_active: true,
                    notes: 'Auto-created from Marketplace Purchase'
                })
                .select('id')
                .single();

            supplierId = newSupplier?.id;
        }

        if (supplierId) {
            // B. Create Purchase Order
            const { data: po } = await supabase
                .schema('core')
                .from('purchase_orders')
                .insert({
                    tenant_id: buyerId,
                    supplier_id: supplierId,
                    status: 'ISSUED', // Automatically issued
                    issue_date: new Date(),
                    total: order.total_amount,
                    subtotal: order.total_amount,
                    notes: `Marketplace Order #${order.uuid}`
                })
                .select('id')
                .single();

            if (po) {
                // C. Create Items
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const items = order.items.map((item: any) => ({
                    purchase_order_id: po.id,
                    tenant_id: buyerId,
                    product_id: item.product_id, // Referencing Seller's Product ID as local stock ref? 
                    // WARNING: This assumes Buyer can stock Seller's Product. 
                    // If foreign keys enforce Tenant, this might fail if product_id is not in Buyer's tenant?
                    // Checked migration: product_stock doesn't enforce same tenant. 
                    // But purchase_order_items references core.products(id). 
                    // It does NOT check tenant. So it should work technically.
                    quantity: item.quantity,
                    unit_cost: item.unit_price,
                    line_total: item.total_price
                }));

                await supabase
                    .schema('core')
                    .from('purchase_order_items')
                    .insert(items);
            }
            return po.id;
        }
        return null;
    }
}
