import { BusinessCategory } from "../business-category.entity";

export interface BusinessCategoryRepository {
    findAll(): Promise<BusinessCategory[]>;
    findById(id: number): Promise<BusinessCategory | null>;
    findBySlug(slug: string): Promise<BusinessCategory | null>;
    assignToBusiness(businessId: number, categoryIds: number[]): Promise<void>;
}
