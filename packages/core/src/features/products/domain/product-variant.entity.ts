import { Money } from "@/features/shared/domain/value-objects/Money";

export interface ProductVariantPrimitives {
    id: string;
    product_id: string;
    sku: string;
    price: number;
    cost: number;
    stock: number;
    attributes: Record<string, string>;
    status: 'active' | 'inactive' | 'archived';
    image_path: string | null;
}

export class ProductVariant {
    private constructor(
        readonly id: string,
        private productId: string,
        private sku: string,
        private price: Money,
        private cost: Money,
        private stock: number,
        private attributes: Record<string, string>,
        private status: 'active' | 'inactive' | 'archived',
        private imagePath: string | null
    ) { }

    public static create(
        id: string = '',
        productId: string = '',
        sku: string,
        price: number,
        cost: number,
        stock: number,
        attributes: Record<string, string>,
        status: 'active' | 'inactive' | 'archived' = 'active',
        imagePath: string | null = null
    ): ProductVariant {
        if (!sku) throw new Error("SKU is required for variant");
        if (stock < 0) throw new Error("Stock cannot be negative");
        if (price < 0) throw new Error("Price cannot be negative");

        return new ProductVariant(
            id,
            productId,
            sku,
            Money.from(price),
            Money.from(cost),
            stock,
            attributes,
            status,
            imagePath
        );
    }

    // Getters
    public getId(): string { return this.id; }
    public getProductId(): string { return this.productId; }
    public getSku(): string { return this.sku; }
    public getPrice(): Money { return this.price; }
    public getCost(): Money { return this.cost; }
    public getStock(): number { return this.stock; }
    public getAttributes(): Record<string, string> { return this.attributes; }
    public getStatus(): string { return this.status; }
    public getImagePath(): string | null { return this.imagePath; }

    // Actions
    public updateStock(newStock: number): void {
        if (newStock < 0) throw new Error("Stock cannot be negative");
        this.stock = newStock;
    }

    public updatePrice(newPrice: number): void {
        this.price = Money.from(newPrice);
    }

    public updateAttributes(attrs: Record<string, string>): void {
        this.attributes = attrs;
    }

    public toPrimitives(): ProductVariantPrimitives {
        return {
            id: this.id,
            product_id: this.productId,
            sku: this.sku,
            price: this.price.getValue(),
            cost: this.cost.getValue(),
            stock: this.stock,
            attributes: this.attributes,
            status: this.status,
            image_path: this.imagePath
        };
    }
}
