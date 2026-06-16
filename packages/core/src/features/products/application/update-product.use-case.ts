import { IProductRepository } from '../domain/product.repository';
import { ProductStatus } from "../domain/product.entity";
import { ProductVariant, ProductVariantPrimitives } from "../domain/product-variant.entity";
import { Money } from "@/features/shared/domain/value-objects/Money";

export type UpdateProductData = {
    name?: string;
    price?: number;
    cost?: number;
    description?: string;
    stock?: number;
    categoryId?: string;
    expirationDate?: Date;
    status?: ProductStatus;
    seasonIds?: string[];
    imagePath?: string | null;
    hasVariants?: boolean;
    variants?: ProductVariantPrimitives[];
    isVatExempt?: boolean;
    wholesalePrice?: number;
};

export type UpdateProductInput = {
    id: string;
    data: UpdateProductData;
}

export async function updateProductUseCase(
    productRepository: IProductRepository,
    input: UpdateProductInput
): Promise<void> {
    const { id, data } = input;
    const productToUpdate = await productRepository.findById(id);

    if (!productToUpdate) {
        throw new Error('Product not found');
    }

    // Actualizar campos básicos primero
    if (data.name !== undefined) {
        productToUpdate.updateName(data.name);
    }

    if (data.price !== undefined) {
        productToUpdate.updatePrice(Money.from(data.price));
    }

    if (data.cost !== undefined) {
        productToUpdate.updateCost(Money.from(data.cost));
    }

    if (data.description !== undefined) {
        productToUpdate.updateDescription(data.description);
    }

    if (data.categoryId !== undefined) {
        productToUpdate.updateCategory(data.categoryId);
    }

    if (data.expirationDate !== undefined) {
        productToUpdate.updateExpirationDate(data.expirationDate);
    }

    if (data.stock !== undefined) {
        productToUpdate.updateStock(data.stock);
    }

    if (data.seasonIds !== undefined) {
        productToUpdate.updateSeasons(data.seasonIds);
    }

    if (data.imagePath !== undefined) {
        productToUpdate.updateImagePath(data.imagePath);
    }

    if (data.hasVariants !== undefined) {
        productToUpdate.setHasVariants(data.hasVariants);
    }

    if (data.variants !== undefined) {
        const variantEntities = data.variants.map(v => ProductVariant.create(
            v.id,
            v.product_id || productToUpdate.id,
            v.sku,
            v.price,
            v.cost,
            v.stock,
            v.attributes,
            v.status,
            v.image_path
        ));
        productToUpdate.setVariants(variantEntities);
    }

    if (data.isVatExempt !== undefined) {
        productToUpdate.updateIsVatExempt(data.isVatExempt);
    }

    if (data.wholesalePrice !== undefined) {
        productToUpdate.updateWholesalePrice(Money.from(data.wholesalePrice));
    }

    // Actualizar status AL FINAL para que no sea sobrescrito por updateStock
    if (data.status !== undefined) {
        productToUpdate.updateStatus(data.status);
    }

    await productRepository.save(productToUpdate);
}