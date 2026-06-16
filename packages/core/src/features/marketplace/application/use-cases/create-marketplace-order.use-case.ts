import { SupabaseMarketplaceRepository } from "../../infrastructure/supabase-marketplace.repository";
import { MarketplaceOrderItem } from "../../domain/marketplace-order.entity";
import { CartItem } from "../cart.store";

export class CreateMarketplaceOrderUseCase {
    private repo: SupabaseMarketplaceRepository;

    constructor() {
        this.repo = new SupabaseMarketplaceRepository();
    }

    async execute(params: {
        sellerTenantId: number;
        items: CartItem[];
        buyerTenantId?: number; // Only for B2B
        buyerUserId?: string;   // Only for C2B
    }): Promise<{ success: boolean; orderId?: number; error?: string }> {
        const { buyerTenantId, buyerUserId, sellerTenantId, items } = params;

        // 0. Determine Order Type
        let orderType: 'B2B' | 'C2B' = 'C2B';
        if (buyerTenantId) {
            orderType = 'B2B';
        } else if (!buyerUserId) {
            return { success: false, error: "Missing buyer identifier (Tenant ID or User ID)" };
        }

        // 1. Calculate Total
        const totalAmount = items.reduce((acc, item) => acc + (item.price * item.quantity), 0);

        // 2. Create Order in Marketplace
        const orderId = await this.repo.createOrder({
            buyerTenantId,
            buyerUserId,
            sellerTenantId,
            totalAmount,
            orderType
        });

        if (!orderId) {
            return { success: false, error: "Failed to create marketplace order" };
        }

        // 3. Create Items
        const orderItems: MarketplaceOrderItem[] = items.map(item => ({
            productId: item.productId,
            quantity: item.quantity,
            unitPrice: item.price,
            totalPrice: item.price * item.quantity
        }));

        const itemsSuccess = await this.repo.createOrderItems(orderId, orderItems);

        if (!itemsSuccess) {
            // TODO: Rollback order (delete it) - For MVP we rely on manual cleanup or ignore
            return { success: false, error: "Failed to create order items" };
        }

        // 4. "Magic Link": Sync to ERP (Create PO/SO)
        // This handles:
        // - Creating Sales Order for Seller
        // - Creating Purchase Order for Buyer (if B2B)
        // - Auto-creating Client/Supplier entities if missing
        const syncResult = await this.repo.syncToERP(orderId);

        if (!syncResult.success) {
            console.warn(`Order ${orderId} created but ERP sync failed: ${syncResult.error}`);
            // We return success true because the order IS placed, but maybe with a warning?
            // For now, treat as success but log error.
        }

        return { success: true, orderId };
    }
}
