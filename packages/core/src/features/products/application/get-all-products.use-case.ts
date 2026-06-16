import { IProductRepository } from '../domain/product.repository';
import { Product } from "../domain/product.entity";

export class GetAllProductsUseCase {
    constructor(private readonly productRepository: IProductRepository) { }

    async execute(query?: string): Promise<Product[]> {
        if (query) {
            return await this.productRepository.searchProductsByName(query);
        }
        return await this.productRepository.findAll() as Product[];
    }
}