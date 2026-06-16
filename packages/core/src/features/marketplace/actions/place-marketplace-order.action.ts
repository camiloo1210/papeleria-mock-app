"use server";

import { CreateMarketplaceOrderUseCase } from "../application/use-cases/create-marketplace-order.use-case";
import { CartItem } from "../application/cart.store";
import { resolveTenantId } from "@/shared/utils/auth.utils";

import { createClient } from "@/lib/supabase/server";

export async function placeMarketplaceOrderAction(items: CartItem[], options?: { mode: 'BUSINESS' | 'PERSONAL' }) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return { success: false, error: "Unauthorized" };
        }

        let tenantId = await resolveTenantId(user);

        // If mode is PERSONAL, ignore tenantId
        if (options?.mode === 'PERSONAL') {
            tenantId = null;
        }
        // if (!tenantId) {
        //    For C2B we allow no tenantId
        // }

        const useCase = new CreateMarketplaceOrderUseCase();

        // Group items by supplier
        const itemsBySupplier: Record<number, CartItem[]> = {};
        for (const item of items) {
            // Ensure supplierId is number
            const supplierId = Number(item.supplierId);
            if (!itemsBySupplier[supplierId]) {
                itemsBySupplier[supplierId] = [];
            }
            itemsBySupplier[supplierId].push(item);
        }

        const results = [];
        const errors = [];

        // Create an order for each supplier
        for (const [supplierIdStr, supplierItems] of Object.entries(itemsBySupplier)) {
            const supplierId = Number(supplierIdStr);

            const result = await useCase.execute({
                sellerTenantId: supplierId,
                items: supplierItems,
                buyerTenantId: tenantId || undefined,
                buyerUserId: user.id
            });

            if (result.success) {
                results.push(result.orderId);
            } else {
                errors.push(result.error || "Unknown error");
            }
        }

        if (errors.length > 0) {
            return { success: false, error: errors.join(", "), partialSuccess: results.length > 0 };
        }

        return { success: true, orderIds: results };

    } catch (error) {
        console.error("Place Order Action Error:", error);
        return { success: false, error: "Failed to place order" };
    }
}
