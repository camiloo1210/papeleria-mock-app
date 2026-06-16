import { Product, ProductStatus } from './product.entity';
import { PaginatedResult, PaginationOptions } from '../../shared/domain/PaginationOptions';

export interface IProductRepository {

    save(product: Product): Promise<void>;
    findById(id: string): Promise<Product | null>;
    archive(id: string): Promise<void>;
    deleteById(id: string): Promise<void>;

    //Additional operations
    findAll(tenantId?: number, pagination?: PaginationOptions): Promise<Product[] | PaginatedResult<Product>>;
    findByCategory(categoryId: string, tenantId?: number): Promise<Product[]>;
    findByStatus(status: ProductStatus, tenantId?: number): Promise<Product[]>;
    findAvailable(tenantId?: number): Promise<Product[]>;
    searchProductsByName(query: string, tenantId?: number): Promise<Product[]>;
}
