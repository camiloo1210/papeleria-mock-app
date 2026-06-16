"use server";

import { createClient } from "@/lib/supabase/server";
import { SupabaseProductRepository } from "@/features/products/infrastructure/supabase-product.repository";
import { createProductUseCase } from "@/features/products/application/create-product.use-case";


export async function syncMarketplaceProductAction(
    tenantId: number,
    externalProduct: {
        uuid: string;
        name: string;
        price: number;
        wholesalePrice?: number;
        imageUrl?: string;
    }
) {
    const supabase = await createClient();

    // 1. Check if product exists locally by SKU (using external UUID as SKU)
    const { data: existingProduct } = await supabase
        .schema('core')
        .from('products')
        .select('id, price, average_cost')
        .eq('tenant_id', tenantId)
        .eq('sku', externalProduct.uuid)
        .single();

    if (existingProduct) {
        return {
            success: true,
            productId: existingProduct.id,
            cost: existingProduct.average_cost || existingProduct.price
        };
    }

    // 2. If not exists, create it
    try {
        const productRepo = new SupabaseProductRepository(supabase);

        // Find a default category
        const { data: category } = await supabase
            .schema('core')
            .from('product_categories')
            .select('id')
            .eq('tenant_id', tenantId)
            .limit(1)
            .single();

        const categoryId = category?.id; // Use first found or undefined (if allowed, but DB usually requires it)

        // Generate a simplified ID if needed, or let DB handle it. 
        // NOTE: createProductUseCase requires 'id' (UUID) usually for ID. 
        // But our repo might handle it. Let's check SupabaseProductRepository.
        // Actually createProductUseCase expects 'id' as string (UUID).
        const newProductUuid = crypto.randomUUID();

        await createProductUseCase({
            id: newProductUuid,
            tenantId: tenantId,
            name: externalProduct.name,
            description: "Imported from Marketplace",
            price: externalProduct.price, // Default sale price = supplier price
            cost: (externalProduct.wholesalePrice && externalProduct.wholesalePrice > 0) ? externalProduct.wholesalePrice : externalProduct.price,
            stock: 0,
            sku: externalProduct.uuid, // KEY: Link to external UUID
            categoryId: categoryId ? String(categoryId) : "", // Handling might fail if empty
            imagePath: externalProduct.imageUrl,
            hasVariants: false
        }, productRepo);

        // Fetch back the numeric ID (since Supabase repo might be using numeric IDs internally for relations)
        const { data: newProd } = await supabase
            .schema('core')
            .from('products')
            .select('id')
            .eq('uuid', newProductUuid)
            .single();

        return {
            success: true,
            productId: newProd?.id,
            cost: externalProduct.price
        };

    } catch (error) {
        console.error("Error syncing marketplace product:", error);
        return { success: false, error: "Failed to sync product" };
    }
}
