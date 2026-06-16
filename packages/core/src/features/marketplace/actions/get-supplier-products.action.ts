"use server";


import { SupabaseMarketplaceRepository } from "../infrastructure/supabase-marketplace.repository";

export async function getSupplierProductsAction(supplierTenantId: number) {
    try {
        const repository = new SupabaseMarketplaceRepository();
        const products = await repository.findProductsByBusiness(supplierTenantId);

        // Map to PosProduct interface roughly
        return {
            success: true,
            data: products.map(p => ({
                id: p.id,
                name: p.name,
                price: (p.wholesale_price && p.wholesale_price > 0) ? p.wholesale_price : p.price,
                stock: p.stock,
                imageUrl: p.image_path,
                hasVariants: false, // Marketplace v1 assumes simple products for now
                variants: [],
                sku: p.uuid // Use UUID as SKU for syncing
            }))
        };
    } catch (error) {
        console.error("Error fetching supplier products:", error);
        return { success: false, error: "Failed to fetch products" };
    }
}
