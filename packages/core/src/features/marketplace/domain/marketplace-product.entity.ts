export interface MarketplaceProduct {
    id: number;
    uuid: string;
    name: string;
    description: string;
    price: number;
    image_path?: string;
    tenant_id: number;
    business_name?: string; // We will join this
    category_name?: string;
    stock: number;
    wholesale_price?: number;
}
