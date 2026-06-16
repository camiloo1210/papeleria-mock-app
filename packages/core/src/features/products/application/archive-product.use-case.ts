import { IProductRepository } from "../domain/product.repository";

export type ArchiveProductInput = {
    id: string;
}

export async function archiveProductUseCase(productRepository: IProductRepository, input: ArchiveProductInput): Promise<void> {
    const productToArchive = await productRepository.findById(input.id);
    if (!productToArchive) {
        throw new Error('Product not found');
    }
    productToArchive.archive();
    await productRepository.archive(input.id);
}