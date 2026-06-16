import { Product } from "../domain/product.entity";
import { IProductRepository } from '../domain/product.repository';
import { ProductVariant, ProductVariantPrimitives } from "../domain/product-variant.entity";

export type CreateProductInput = {
    id: string;
    name: string;
    price: number;
    cost: number;
    description: string;
    stock: number;
    categoryId: string;
    sku: string;
    tenantId: number;
    expirationDate?: Date;
    seasonIds?: string[];
    imagePath?: string;
    hasVariants?: boolean;
    variants?: ProductVariantPrimitives[];
    isVatExempt?: boolean;
    wholesalePrice?: number;
}

export async function createProductUseCase(input: CreateProductInput, productRepository: IProductRepository): Promise<void> {
    const variants = input.variants?.map(v => ProductVariant.create(
        undefined, // id
        undefined, // product_id
        v.sku,
        v.price,
        v.cost,
        v.stock,
        v.attributes,
        v.status,
        v.image_path
    )) || [];

    const newProduct = Product.createProduct(
        input.id,
        input.name,
        input.price,
        input.cost,
        input.description,
        input.stock,
        input.categoryId,
        input.sku,
        input.tenantId,
        input.expirationDate,
        undefined, // status
        input.seasonIds || [],
        input.imagePath,
        input.hasVariants || false,
        variants,
        input.isVatExempt || false,
        input.wholesalePrice || 0
    );

    await productRepository.save(newProduct);
}