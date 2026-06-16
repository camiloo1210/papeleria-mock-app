import { Money } from "@/features/shared/domain/value-objects/Money";
import { ProductVariant, ProductVariantPrimitives } from "./product-variant.entity";

export enum ProductStatus {
    ACTIVE = 'active',
    INACTIVE = 'inactive',
    OUT_OF_STOCK = 'out_of_stock',
    ARCHIVED = 'archived',
}

export interface ProductPrimitives {
    id: string;
    name: string;
    price: number;
    cost: number;
    wholesale_price: number;
    description: string;
    stock: number;
    category_id: string;
    expiration_date: Date | null;
    status: ProductStatus;
    sku: string;
    tenant_id: number;
    season_ids?: string[]; // Assuming seasonIds exported as array? logic below used seasonIds.
    image_path: string | null;
    has_variants: boolean;
    variants?: ProductVariantPrimitives[];
    is_vat_exempt: boolean;
}

export class Product {
    private constructor(
        readonly id: string,
        private name: string,
        private price: Money,
        private cost: Money, // Added cost
        private wholesalePrice: Money,
        private description: string,
        private stock: number,
        private categoryId: string,
        private expirationDate: Date | null,
        private status: ProductStatus,
        private sku: string,
        private tenantId: number,
        private seasonIds: string[] = [],
        private imagePath: string | null = null,
        public imageUrl: string | null = null,
        private hasVariants: boolean = false,
        private variants: ProductVariant[] = [],
        private isVatExempt: boolean = false
    ) { }


    public static createProduct(id: string, name: string, price: number, cost: number, description: string, stock: number, categoryId: string, sku: string, tenantId: number, expirationDate?: Date, status?: ProductStatus, seasonIds: string[] = [], imagePath?: string, hasVariants: boolean = false, variants: ProductVariant[] = [], isVatExempt: boolean = false, wholesalePrice: number = 0): Product {

        if (!name || price === undefined || price === null || cost === undefined || cost === null || !description || stock === undefined || stock === null || !categoryId) {
            throw new Error('All required fields must be provided.');
        }
        if (name.length < 2 || name.length > 50) {
            throw new Error('Name must be between 2 and 50 characters long.');
        }
        if (price <= 0) {
            throw new Error('Price must be a positive number.');
        }
        if (cost <= 0) {
            throw new Error('Cost must be a positive number.');
        }
        if (description.length > 200) {
            throw new Error('Description must not exceed 200 characters.');
        }
        if (stock < 0) {
            throw new Error('Stock must be a non-negative integer.');
        }
        if (!categoryId) {
            throw new Error('Category ID must be provided.');
        }
        if (!sku) {
            throw new Error('SKU must be provided.');
        }
        if (!tenantId) {
            throw new Error('Tenant ID must be provided.');
        }
        if (expirationDate && expirationDate <= new Date()) {
            throw new Error('Expiration date must be a future date.');
        }

        let finalStatus = status;

        if (!finalStatus) {
            if (stock === 0) {
                finalStatus = ProductStatus.OUT_OF_STOCK;
            } else {
                finalStatus = ProductStatus.ACTIVE;
            }
        }

        return new Product(id, name, Money.from(price), Money.from(cost), Money.from(wholesalePrice), description, stock, categoryId, expirationDate || null, finalStatus, sku, tenantId, seasonIds, imagePath || null, null, hasVariants, variants, isVatExempt);
    }
    //Archive
    public archive(): void {
        if (this.status === ProductStatus.ARCHIVED) {
            throw new Error('Product is already archived.');
        }
        this.status = ProductStatus.ARCHIVED;
    }
    //Name actions
    public updateName(newName: string): void {
        if (newName.length < 2 || newName.length > 50) {
            throw new Error('Name must be between 2 and 50 characters long.');
        }
        else {
            this.name = newName;
        }
    }
    public getName(): string {
        return this.name;
    }

    // Price actions 
    public updatePrice(newPrice: Money): void {
        if (newPrice.getValue() <= 0) {
            throw new Error('Price must be a positive number.');
        }
        this.price = newPrice;
    }

    public getPrice(): Money {
        return this.price;
    }

    public getCost(): Money {
        return this.cost;
    }

    // Wholesale Price actions
    public getWholesalePrice(): Money {
        return this.wholesalePrice;
    }

    public updateWholesalePrice(newPrice: Money): void {
        if (newPrice.getValue() < 0) {
            throw new Error('Wholesale price cannot be negative.');
        }
        this.wholesalePrice = newPrice;
    }

    // Cost actions
    public updateCost(newCost: Money): void {
        if (newCost.getValue() <= 0) {
            throw new Error('Cost must be a positive number.');
        }
        this.cost = newCost;
    }

    //Description actions
    public updateDescription(newDescription: string): void {
        if (newDescription.length > 200) {
            throw new Error('Description must not exceed 200 characters.');
        }
        else {
            this.description = newDescription;
        }
    }

    public getDescription(): string {
        return this.description;
    }
    // Stock actions
    public updateStock(newStock: number): void {
        if (newStock < 0) {
            throw new Error('Stock must be a non-negative integer.');
        }

        this.stock = newStock; // Always update the stock

        // Automatically update status based on stock, but don't override statuses like INACTIVE or ARCHIVED
        if (this.stock === 0 && this.status === ProductStatus.ACTIVE) {
            this.status = ProductStatus.OUT_OF_STOCK;
        } else if (this.stock > 0 && this.status === ProductStatus.OUT_OF_STOCK) {
            this.status = ProductStatus.ACTIVE;
        }
    }

    public getStock(): number {
        return this.stock;
    }


    //Category actions
    public updateCategory(newCategoryId: string): void {
        if (!newCategoryId) {
            throw new Error('Category ID must be provided.');
        }
        else {
            this.categoryId = newCategoryId;
        }
    }
    public getCategory(): string {
        return this.categoryId;
    }

    //Expiration date actions
    public updateExpirationDate(newExpirationDate: Date): void {
        if (newExpirationDate && newExpirationDate <= new Date()) {
            throw new Error('Expiration date must be a future date.');
        }
        else {
            this.expirationDate = newExpirationDate;
        }
    }
    public getExpirationDate(): Date | null {
        return this.expirationDate;
    }
    //Status actions
    public getStatus(): ProductStatus {
        return this.status;
    }
    public updateStatus(newStatus: ProductStatus): void {
        if (!Object.values(ProductStatus).includes(newStatus)) {
            throw new Error('Invalid status value.');
        }
        this.status = newStatus;
    }

    public getSku(): string {
        return this.sku;
    }

    public getTenantId(): number {
        return this.tenantId;
    }

    public getSeasonIds(): string[] {
        return this.seasonIds;
    }

    public updateSeasons(newSeasonIds: string[]): void {
        this.seasonIds = newSeasonIds;
    }

    public updateImagePath(newPath: string | null): void {
        this.imagePath = newPath;
    } // Added method

    public toPrimitives(): ProductPrimitives {
        return {
            id: this.id,
            name: this.name,
            price: this.price.getValue(),
            cost: this.cost.getValue(),
            wholesale_price: this.wholesalePrice.getValue(),
            description: this.description,
            stock: this.stock,
            category_id: this.categoryId,
            expiration_date: this.expirationDate,
            status: this.status,
            sku: this.sku,
            tenant_id: this.tenantId,
            season_ids: this.seasonIds,
            image_path: this.imagePath,
            has_variants: this.hasVariants,
            variants: this.variants.map(v => v.toPrimitives()),
            is_vat_exempt: this.isVatExempt
        };
    }

    public getImagePath(): string | null {
        return this.imagePath;
    }

    public getHasVariants(): boolean { return this.hasVariants; }
    public getVariants(): ProductVariant[] { return this.variants; }

    public setVariants(variants: ProductVariant[]): void {
        this.variants = variants;
        // logic moved to setHasVariants or kept here? 
        // If I use setHasVariants explicity, I should probably respecting it here or not?
        // Let's keep implicit for now but allow explicit override.
        // this.hasVariants = variants.length > 0; // Commenting out implicit for now if I want manual control, 
        // OR better: keep implicit logic in setVariants ONLY IF hasVariants is not set? 
        // Simpler: Just allow setting it.
    }

    public setHasVariants(hasVariants: boolean): void {
        this.hasVariants = hasVariants;
    }

    // Tax Actions
    public getIsVatExempt(): boolean {
        return this.isVatExempt;
    }

    public updateIsVatExempt(isExempt: boolean): void {
        this.isVatExempt = isExempt;
    }
}

