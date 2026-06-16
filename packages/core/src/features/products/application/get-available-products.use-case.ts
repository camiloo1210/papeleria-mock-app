import { IProductRepository } from '../domain/product.repository';
import { Product } from "../domain/product.entity";

export class GetAvailableProductsUseCase {
    constructor(private readonly productRepository: IProductRepository) { }

    async execute(): Promise<Product[]> {
        return await this.productRepository.findAvailable();
    }
}
