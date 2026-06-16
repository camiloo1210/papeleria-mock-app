export interface MarketplaceOrderItem {
    id?: number;
    orderId?: number;
    productId: number;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
    productName?: string;
    productImage?: string;
}

export interface MarketplaceOrder {
    id: number;
    uuid: string;
    buyerTenantId?: number; // Nullable for C2B
    buyerUserId?: string;   // For C2B
    orderType: 'B2B' | 'C2B';
    sellerTenantId: number;
    status: 'PENDING' | 'CONFIRMED' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
    totalAmount: number;
    currency: string;
    createdAt: Date;
    items?: MarketplaceOrderItem[];
}
